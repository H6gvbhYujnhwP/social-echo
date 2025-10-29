// app/api/account/billing/reactivate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/billing/stripe';

export const runtime = 'nodejs';

/**
 * POST /api/account/billing/reactivate
 * 
 * Reactivates a cancelled subscription before the period ends.
 * Removes the cancel_at_period_end flag from Stripe.
 */
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
        { error: 'No subscription found' },
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

    // Check if subscription is actually cancelled
    if (!subscription.cancelAtPeriodEnd) {
      return NextResponse.json(
        { error: 'Subscription is not cancelled' },
        { status: 400 }
      );
    }

    // Check if subscription is still active (not expired)
    if (subscription.status === 'canceled') {
      return NextResponse.json(
        { error: 'Subscription has already expired and cannot be reactivated. Please create a new subscription.' },
        { status: 400 }
      );
    }

    // Reactivate subscription in Stripe
    const reactivatedSubscription = await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      { cancel_at_period_end: false }
    );

    // Update our database
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd: false,
        status: 'active'
      }
    });

    console.log('[billing] Subscription reactivated', {
      userId: user.id,
      plan: subscription.plan,
      currentPeriodEnd: subscription.currentPeriodEnd
    });

    return NextResponse.json({
      ok: true,
      message: 'Your subscription has been reactivated successfully!',
      currentPeriodEnd: subscription.currentPeriodEnd.toISOString()
    });

  } catch (error: any) {
    console.error('[billing] Reactivation failed:', error);

    return NextResponse.json(
      { error: 'Failed to reactivate subscription', details: error.message },
      { status: 500 }
    );
  }
}
