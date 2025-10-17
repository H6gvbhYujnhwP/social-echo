/**
 * Sync Subscription from Stripe - Source of Truth
 * 
 * This module handles syncing user subscriptions from Stripe webhooks.
 * Stripe is the source of truth for plan status and billing periods.
 */

import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/billing/stripe';
import { planFromPriceId, limitsFor, Plan } from '@/lib/billing/plan-map';
import Stripe from 'stripe';

interface SyncResult {
  success: boolean;
  userId?: string;
  plan?: Plan;
  status?: string;
  error?: string;
}

/**
 * Sync a user's subscription from a Stripe Subscription object
 * This is the authoritative function for updating local state from Stripe
 */
export async function syncSubscriptionFromStripe(
  subscription: Stripe.Subscription
): Promise<SyncResult> {
  try {
    // Extract price ID from subscription items
    const priceId = subscription.items.data[0]?.price?.id;
    if (!priceId) {
      console.error('[sync] No price ID in subscription:', subscription.id);
      return { success: false, error: 'No price ID found' };
    }

    // Derive plan from price ID (source of truth)
    const plan = planFromPriceId(priceId);
    if (plan === 'none') {
      console.error('[sync] Unknown price ID:', priceId);
      return { success: false, error: 'Unknown price ID' };
    }

    // Get usage limit for this plan
    const usageLimit = limitsFor(plan);

    // Resolve user ID
    let userId = subscription.metadata?.userId;
    
    if (!userId) {
      // Fallback: look up by stripeCustomerId
      const customerId = typeof subscription.customer === 'string' 
        ? subscription.customer 
        : subscription.customer?.id;
        
      if (customerId) {
        const existingSub = await prisma.subscription.findFirst({
          where: { stripeCustomerId: customerId },
          include: { user: true }
        });
        
        if (existingSub) {
          userId = existingSub.userId;
        }
      }
    }

    if (!userId) {
      console.error('[sync] Cannot resolve userId for subscription:', subscription.id);
      return { success: false, error: 'Cannot resolve user ID' };
    }

    // Determine status
    const isActive = subscription.status === 'active' || subscription.status === 'trialing';
    const userStatus = isActive ? 'active' : 'inactive';

    // Calculate period boundaries
    // TypeScript strict mode requires explicit casting for Stripe webhook objects
    const sub = subscription as any;
    const currentPeriodStart = new Date((sub.current_period_start || Date.now() / 1000) * 1000);
    const currentPeriodEnd = new Date((sub.current_period_end || (Date.now() / 1000 + 30 * 24 * 3600)) * 1000);

    // Check if this is a new billing period (reset usage)
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId }
    });

    const isNewPeriod = existingSubscription && 
      existingSubscription.currentPeriodEnd &&
      currentPeriodEnd > existingSubscription.currentPeriodEnd;

    // Transactional update
    await prisma.$transaction(async (tx) => {
      // Upsert subscription (plan is stored here, not on User)
      await tx.subscription.upsert({
        where: { userId },
        create: {
          userId,
          plan,
          status: subscription.status,
          usageLimit,
          usageCount: 0,
          stripeCustomerId: typeof subscription.customer === 'string' 
            ? subscription.customer 
            : subscription.customer?.id || '',
          stripeSubscriptionId: subscription.id,
          currentPeriodStart,
          currentPeriodEnd,
        },
        update: {
          plan,
          status: subscription.status,
          usageLimit,
          usageCount: isNewPeriod ? 0 : undefined, // Reset on new period
          stripeCustomerId: typeof subscription.customer === 'string' 
            ? subscription.customer 
            : subscription.customer?.id,
          stripeSubscriptionId: subscription.id,
          currentPeriodStart,
          currentPeriodEnd,
        }
      });
    });

    console.log('[sync] Subscription synced successfully:', {
      userId,
      plan,
      status: subscription.status,
      usageLimit,
      periodStart: currentPeriodStart,
      periodEnd: currentPeriodEnd,
      resetUsage: isNewPeriod,
    });

    return {
      success: true,
      userId,
      plan,
      status: subscription.status,
    };
    
  } catch (error: any) {
    console.error('[sync] Failed to sync subscription:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Sync subscription by Stripe Subscription ID
 * Fetches from Stripe API then syncs
 */
export async function syncSubscriptionById(
  subscriptionId: string
): Promise<SyncResult> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['items.data.price'],
    });
    
    return await syncSubscriptionFromStripe(subscription);
  } catch (error: any) {
    console.error('[sync] Failed to fetch subscription from Stripe:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Sync all subscriptions for a user by their Stripe Customer ID
 */
export async function syncSubscriptionsByCustomerId(
  customerId: string
): Promise<SyncResult[]> {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      expand: ['data.items.data.price'],
    });
    
    const results: SyncResult[] = [];
    
    for (const subscription of subscriptions.data) {
      const result = await syncSubscriptionFromStripe(subscription);
      results.push(result);
    }
    
    return results;
  } catch (error: any) {
    console.error('[sync] Failed to fetch subscriptions from Stripe:', error);
    return [{
      success: false,
      error: error.message,
    }];
  }
}

/**
 * Handle subscription cancellation
 */
export async function handleSubscriptionCancellation(
  subscription: Stripe.Subscription
): Promise<SyncResult> {
  try {
    // Resolve user ID
    let userId = subscription.metadata?.userId;
    
    if (!userId) {
      const customerId = typeof subscription.customer === 'string' 
        ? subscription.customer 
        : subscription.customer?.id;
        
      if (customerId) {
        const existingSub = await prisma.subscription.findFirst({
          where: { stripeCustomerId: customerId },
          include: { user: true }
        });
        
        if (existingSub) {
          userId = existingSub.userId;
        }
      }
    }

    if (!userId) {
      console.error('[sync] Cannot resolve userId for canceled subscription:', subscription.id);
      return { success: false, error: 'Cannot resolve user ID' };
    }

    // Update subscription to canceled (plan and status are in Subscription, not User)
    await prisma.subscription.update({
      where: { userId },
      data: {
        plan: 'none',
        status: 'canceled',
        usageLimit: 0,
      }
    });

    console.log('[sync] Subscription canceled:', {
      userId,
      subscriptionId: subscription.id,
    });

    return {
      success: true,
      userId,
      plan: 'none',
      status: 'canceled',
    };
    
  } catch (error: any) {
    console.error('[sync] Failed to handle cancellation:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

