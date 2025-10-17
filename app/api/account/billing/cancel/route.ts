// app/api/account/billing/cancel/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/billing/stripe';
// Cancellation email is sent by Stripe webhook to avoid duplicates
import Stripe from 'stripe';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

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
        { error: 'No Stripe subscription found' },
        { status: 400 }
      );
    }

    // Cancel subscription in Stripe
    let canceledSubscription: any;
    
    if (subscription.status === 'trialing') {
      // Cancel immediately for trials
      canceledSubscription = await stripe.subscriptions.cancel(
        subscription.stripeSubscriptionId
      );
    } else {
      // Cancel at period end for active subscriptions
      canceledSubscription = await stripe.subscriptions.update(
        subscription.stripeSubscriptionId,
        { cancel_at_period_end: true }
      );
    }

    // Update our database - always set to 'canceled' immediately
    // This ensures admin panel shows correct status right away
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'canceled',
        cancelAtPeriodEnd: canceledSubscription.cancel_at_period_end || false
      }
    });

    // Note: Cancellation email will be sent by Stripe webhook (customer.subscription.deleted)
    // to avoid duplicate emails
    const effectiveDate = subscription.status === 'trialing' 
      ? new Date()
      : new Date((canceledSubscription.current_period_end || 0) * 1000);

    console.log('[billing] Subscription canceled', {
      userId: user.id,
      plan: subscription.plan,
      immediate: subscription.status === 'trialing',
      note: 'Email will be sent by webhook'
    });

    return NextResponse.json({
      ok: true,
      immediate: subscription.status === 'trialing',
      effectiveDate: effectiveDate.toISOString()
    });

  } catch (error: any) {
    console.error('[billing] Cancel failed:', error);

    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}

