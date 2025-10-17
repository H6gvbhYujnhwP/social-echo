import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/billing/stripe';
import { PLANS } from '@/lib/billing/plans';
import Stripe from 'stripe';

/**
 * POST /api/account/upgrade-to-pro
 * 
 * Custom Starter → Pro upgrade endpoint
 * 
 * Policy:
 * - No refunds for unused Starter time
 * - No proration
 * - Immediate charge of £49.99
 * - New billing cycle starts today
 * - Starter subscription cancelled immediately
 * 
 * Flow:
 * 1. Verify user is on Starter plan
 * 2. Cancel existing Starter subscription (no refund)
 * 3. Create new Pro subscription with immediate charge
 * 4. Update database
 * 5. Return new renewal date and amount charged
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Fetch user with subscription
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // 3. Validate current plan
    const currentSub = user.subscription;
    if (!currentSub) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 400 }
      );
    }

    // Check if already on Pro or higher
    if (currentSub.plan === 'pro' || currentSub.plan?.toLowerCase().includes('agency')) {
      return NextResponse.json(
        { error: 'You are already on Pro or a higher plan' },
        { status: 400 }
      );
    }

    // Must be on Starter
    if (currentSub.plan !== 'starter') {
      return NextResponse.json(
        { error: 'Upgrade is only available from Starter plan' },
        { status: 400 }
      );
    }

    // 4. Verify Stripe customer exists
    if (!currentSub.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No Stripe customer found' },
        { status: 400 }
      );
    }

    const customerId = currentSub.stripeCustomerId;
    const starterSubId = currentSub.stripeSubscriptionId;

    // 5. Generate idempotency key to prevent double charges
    const idempotencyKey = `${user.id}:upgrade-to-pro:${Date.now()}`;

    try {
      // 6. Cancel existing Starter subscription immediately (no refund, no proration)
      if (starterSubId) {
        console.log('[upgrade] Cancelling Starter subscription:', starterSubId);
        await stripe.subscriptions.update(starterSubId, {
          cancel_at_period_end: false,
          proration_behavior: 'none',
        });
        
        // Actually cancel it now
        await stripe.subscriptions.cancel(starterSubId, {
          prorate: false,
        });
      }

      // 7. Create new Pro subscription
      // - Starts immediately (billing_cycle_anchor: 'now')
      // - Charges £49.99 now
      // - No proration
      // - New renewal date = today + 1 month
      console.log('[upgrade] Creating Pro subscription for customer:', customerId);
      
      const proSubscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: PLANS.SocialEcho_Pro.priceId }],
        cancel_at_period_end: false,
        proration_behavior: 'none',
        // billing_cycle_anchor defaults to 'now' when creating a new subscription
        collection_method: 'charge_automatically',
        automatic_tax: { enabled: true }, // Enable VAT/tax display on invoices
        expand: ['latest_invoice.payment_intent'],
      }, {
        idempotencyKey,
      }) as any; // Stripe SDK type issue workaround

      console.log('[upgrade] Pro subscription created:', proSubscription.id);

      // 8. Calculate new renewal date
      const renewalDate = new Date(proSubscription.current_period_end * 1000);

      // 9. Update database
      await prisma.subscription.update({
        where: { userId: user.id },
        data: {
          plan: 'pro',
          stripeSubscriptionId: proSubscription.id,
          status: proSubscription.status,
          usageLimit: PLANS.SocialEcho_Pro.usageLimit,
          currentPeriodStart: new Date(proSubscription.current_period_start * 1000),
          currentPeriodEnd: renewalDate,
          cancelAtPeriodEnd: false,
          trialEnd: null, // Clear any trial
        },
      });

      console.log('[upgrade] Database updated successfully');

      // 11. Return success response
      return NextResponse.json({
        ok: true,
        plan: 'pro',
        renewal: renewalDate.toISOString(),
        amount: 4999, // £49.99 in pence
        subscriptionId: proSubscription.id,
        message: 'Successfully upgraded to Pro',
      });

    } catch (stripeError: any) {
      console.error('[upgrade] Stripe error:', stripeError);
      
      // Rollback: If Pro creation failed, try to restore Starter
      // (In practice, Starter was already cancelled, so user would need support)
      
      return NextResponse.json(
        { 
          error: 'Payment failed. Please check your payment method and try again.',
          details: stripeError.message,
        },
        { status: 402 }
      );
    }

  } catch (error: any) {
    console.error('[upgrade] Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please contact support.' },
      { status: 500 }
    );
  }
}

