// app/api/account/billing/downgrade/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/billing/stripe';
import Stripe from 'stripe';

export const runtime = 'nodejs';

// Social Echo Blueprint v8.4 — unified Stripe API version (2024-06-20)

/**
 * POST /api/account/billing/downgrade
 * 
 * Schedules a downgrade from Pro to Starter at the end of the current billing period.
 * Uses Stripe Subscription Schedules (two-step: create from subscription, then update phases).
 * 
 * Fixed in v8.4: Cannot pass phases when using from_subscription (Stripe API constraint).
 * Solution: Create schedule first, then update it with phases.
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

    // Retrieve subscription to get current period end
    const liveSub = await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId,
      { expand: ['schedule'] }
    );

    const currentPeriodEnd = (liveSub as any).current_period_end;

    if (!currentPeriodEnd) {
      throw new Error('[billing/downgrade] Missing current_period_end');
    }

    // Release existing schedule if active or not_started
    let existingSchedule = liveSub.schedule as Stripe.SubscriptionSchedule | null;
    
    if (existingSchedule?.id) {
      const details = await stripe.subscriptionSchedules.retrieve(existingSchedule.id);
      if (details.status === 'active' || details.status === 'not_started') {
        console.log('[billing/downgrade] Releasing existing schedule:', existingSchedule.id);
        await stripe.subscriptionSchedules.release(existingSchedule.id);
      }
    }

    // Step 1: Create schedule from subscription (NO phases parameter)
    let schedule = await stripe.subscriptionSchedules.create({
      from_subscription: liveSub.id,
    });

    console.log('[billing/downgrade] Schedule created (step 1):', {
      scheduleId: schedule.id,
      subscriptionId: liveSub.id,
    });

    // Step 2: Update schedule with phases
    // Phase 1: Keep Pro until current period end
    // Phase 2: Switch to Starter at renewal
    const phases = [
      {
        items: [{ price: proPriceId, quantity: 1 }],
        end_date: currentPeriodEnd,
        proration_behavior: 'none' as const,
      },
      {
        items: [{ price: starterPriceId, quantity: 1 }],
        proration_behavior: 'none' as const,
      },
    ];

    schedule = await stripe.subscriptionSchedules.update(schedule.id, {
      end_behavior: 'release',
      phases,
    });

    console.log('[billing/downgrade] Schedule updated with phases (step 2):', {
      customerId: subscription.stripeCustomerId,
      subscriptionId: liveSub.id,
      scheduleId: schedule.id,
      currentPeriodEnd: new Date(currentPeriodEnd * 1000).toISOString(),
      phase1Price: proPriceId,
      phase2Price: starterPriceId,
    });

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
      { error: 'Failed to schedule downgrade', details: error.message },
      { status: 500 }
    );
  }
}

