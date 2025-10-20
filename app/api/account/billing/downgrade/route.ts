// app/api/account/billing/downgrade/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/billing/stripe';
import Stripe from 'stripe';

export const runtime = 'nodejs';

/**
 * POST /api/account/billing/downgrade
 * 
 * Schedules a downgrade from Pro to Starter at the end of the current billing period.
 * Uses Stripe Subscription Schedules to avoid immediate charges.
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
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    const subscription = user.subscription;

    // Only allow downgrade from Pro
    if (subscription.plan !== 'pro') {
      return NextResponse.json(
        { error: 'Only Pro users can downgrade to Starter' },
        { status: 400 }
      );
    }

    if (!subscription.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'No Stripe subscription found' },
        { status: 400 }
      );
    }

    // Get price IDs
    const starterPriceId = process.env.STRIPE_STARTER_PRICE_ID;
    const proPriceId = process.env.STRIPE_PRO_PRICE_ID;

    if (!starterPriceId || !proPriceId) {
      return NextResponse.json(
        { error: 'Price IDs not configured' },
        { status: 500 }
      );
    }

    // Get current subscription from Stripe
    const liveSub = await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId,
      { expand: ['schedule'] }
    ) as any;

    const currentPeriodEnd = liveSub.current_period_end;
    const currentPriceId = liveSub.items.data[0]?.price?.id || proPriceId;

    // Create subscription schedule phases
    // Phase 1: Keep current Pro plan until period end
    // Phase 2: Switch to Starter at period end
    const phases: any[] = [
      {
        items: [{ price: currentPriceId }],
        end_date: currentPeriodEnd,
        proration_behavior: 'none',
      },
      {
        items: [{ price: starterPriceId }],
        proration_behavior: 'none',
      },
    ];

    let schedule: any;
    const existingSchedule = liveSub.schedule;

    if (existingSchedule?.id) {
      // Update existing schedule
      schedule = await stripe.subscriptionSchedules.update(existingSchedule.id, {
        phases,
      });
    } else {
      // Create new schedule
      schedule = await stripe.subscriptionSchedules.create({
        from_subscription: liveSub.id,
        phases,
      });
    }

    // Update local database to mark downgrade scheduled
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd: true, // Reuse this field to indicate scheduled change
      }
    });

    console.log('[billing] Downgrade scheduled', {
      userId: user.id,
      from: 'pro',
      to: 'starter',
      effectiveDate: new Date(currentPeriodEnd * 1000).toISOString(),
      scheduleId: schedule.id
    });

    return NextResponse.json({
      ok: true,
      currentPeriodEnd,
      effectiveDate: new Date(currentPeriodEnd * 1000).toISOString(),
      scheduleId: schedule.id
    });

  } catch (error: any) {
    console.error('[billing] Downgrade scheduling failed:', error);

    return NextResponse.json(
      { error: 'Failed to schedule downgrade' },
      { status: 500 }
    );
  }
}

