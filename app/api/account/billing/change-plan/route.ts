// app/api/account/billing/change-plan/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/billing/stripe';
import { z } from 'zod';
import Stripe from 'stripe';

export const runtime = 'nodejs';

const ChangePlanSchema = z.object({
  targetPlan: z.enum(['starter', 'pro']),
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
    const targetPriceId = validated.targetPlan === 'starter'
      ? process.env.STRIPE_STARTER_PRICE_ID
      : process.env.STRIPE_PRO_PRICE_ID;

    if (!targetPriceId) {
      return NextResponse.json(
        { error: 'Price ID not configured' },
        { status: 500 }
      );
    }

    // Get current subscription from Stripe
    const stripeSubscription: Stripe.Response<Stripe.Subscription> = 
      await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);

    // Option A: Reset cycle now, charge Pro now only (no double billing)
    const updatedSubscription = await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      {
        cancel_at_period_end: false,
        items: [{
          id: stripeSubscription.items.data[0].id,
          price: targetPriceId,
        }],
        billing_cycle_anchor: 'now',
        proration_behavior: 'none', // No overlap, no extra line items
        trial_end: 'now', // End any existing trial immediately
        payment_behavior: 'default_incomplete'
      }
    );

    // Immediately invoice and pay (so user is upgraded right now)
    try {
      const invoice = await stripe.invoices.create({
        customer: updatedSubscription.customer as string,
        subscription: updatedSubscription.id,
        collection_method: 'charge_automatically'
      });
      await stripe.invoices.pay(invoice.id);
      
      console.log('[billing] Immediate invoice created and paid', {
        invoiceId: invoice.id,
        amount: invoice.amount_due
      });
    } catch (invoiceError: any) {
      console.error('[billing] Invoice creation/payment failed:', invoiceError);
      // Continue anyway - webhook will handle payment
    }

    // Update our database
    const newUsageLimit = validated.targetPlan === 'starter' ? 8 : 30;
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

    return NextResponse.json({
      ok: true,
      newPlan: validated.targetPlan,
      subscription: updatedSubscription
    });

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

