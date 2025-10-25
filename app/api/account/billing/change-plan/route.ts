// app/api/account/billing/change-plan/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/billing/stripe';
import { limitsFor, Plan } from '@/lib/billing/plan-map';
import { z } from 'zod';
import Stripe from 'stripe';

export const runtime = 'nodejs';

// Social Echo Blueprint v8.3 — unified Stripe API version (2024-06-20)

const ChangePlanSchema = z.object({
  targetPlan: z.enum(['starter', 'pro', 'ultimate']),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = ChangePlanSchema.parse(body);

    // Get user with subscription
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true }
    });

    if (!user || !user.subscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    const subscription = user.subscription;

    if (!subscription.stripeSubscriptionId) {
      return NextResponse.json(
        { needsCheckout: true, error: 'No Stripe subscription found' },
        { status: 409 }
      );
    }

    // Get target price ID
    let targetPriceId: string | undefined;
    if (validated.targetPlan === 'starter') {
      targetPriceId = process.env.STRIPE_STARTER_PRICE_ID;
    } else if (validated.targetPlan === 'pro') {
      targetPriceId = process.env.STRIPE_PRO_PRICE_ID;
    } else if (validated.targetPlan === 'ultimate') {
      targetPriceId = process.env.STRIPE_ULTIMATE_PRICE_ID;
    }

    if (!targetPriceId) {
      return NextResponse.json(
        { error: 'Price ID not configured' },
        { status: 500 }
      );
    }

    // Get current subscription from Stripe
    const stripeSubscription: Stripe.Response<Stripe.Subscription> = 
      await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);

    // Validate and select the correct subscription item
    const items = stripeSubscription.items?.data ?? [];
    if (items.length === 0) {
      throw new Error('[billing/change-plan] No subscription items found on current subscription');
    }

    // Prefer the single SocialEcho item; fallback to index 0
    const currentItem = items.find(i => !!i?.price?.id) ?? items[0];
    if (!currentItem?.id) {
      throw new Error('[billing/change-plan] Missing subscription item id');
    }
    const subscriptionItemId = currentItem.id;

    // Update the existing item (replace, don't add)
    const updateParams: Stripe.SubscriptionUpdateParams = {
      cancel_at_period_end: false,
      items: [{ id: subscriptionItemId, price: targetPriceId }],
      billing_cycle_anchor: 'now',
      proration_behavior: 'none',
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
    };

    // If subscription is trialing, end trial immediately to avoid billing_cycle_anchor conflict
    if (stripeSubscription.status === 'trialing') {
      updateParams.trial_end = 'now';
    }

    const updated = await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      updateParams
    );

    console.log('[billing/change-plan] updated', { sub: updated.id, price: targetPriceId });

    // Pay the latest_invoice (no new invoice creation)
    let latestInvoiceId = typeof updated.latest_invoice === 'string'
      ? updated.latest_invoice
      : updated.latest_invoice?.id;

    if (latestInvoiceId) {
      // Option A: attempt server-side payment (off-session card on file)
      try {
        const paid = await stripe.invoices.pay(latestInvoiceId);
        console.log('[billing/change-plan] invoice paid', { invoice: paid.id, status: paid.status });
        
        // Update our database
        const newUsageLimit = limitsFor(validated.targetPlan as Plan);
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            plan: validated.targetPlan,
            usageLimit: newUsageLimit,
            usageCount: 0, // Reset usage count on plan change
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }
        });

        console.log('[billing] Plan changed successfully', {
          userId: user.id,
          from: subscription.plan,
          to: validated.targetPlan,
          newLimit: newUsageLimit
        });

        return NextResponse.json({ ok: true, upgraded: true });
      } catch (e: any) {
        // If SCA is required, return client secret so the client can confirm
        const inv = await stripe.invoices.retrieve(latestInvoiceId, { expand: ['payment_intent'] }) as any;
        const pi = inv.payment_intent as Stripe.PaymentIntent | null;
        if (pi?.status === 'requires_action' && pi.client_secret) {
          return NextResponse.json({
            ok: true,
            requiresAction: true,
            paymentIntentClientSecret: pi.client_secret,
          }, { status: 202 });
        }
        console.error('[billing/change-plan] pay invoice failed', e);
        return NextResponse.json({ ok: false, error: 'payment_failed' }, { status: 402 });
      }
    }

    // Fallback: if no invoice (shouldn't happen)
    // Update database anyway
    const newUsageLimit = limitsFor(validated.targetPlan as Plan);
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        plan: validated.targetPlan,
        usageLimit: newUsageLimit,
        usageCount: 0,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });

    return NextResponse.json({ ok: true, upgraded: true });

  } catch (error: any) {
    console.error('[billing] Plan change failed:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to change plan' },
      { status: 500 }
    );
  }
}

