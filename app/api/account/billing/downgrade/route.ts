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

    // Retrieve subscription & determine the live item id
    const liveSub = await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId,
      { expand: ['schedule', 'items.data.price'] }
    );

    const subItem = liveSub.items?.data?.[0];
    if (!subItem?.id) {
      throw new Error('[billing/downgrade] Missing subscription item');
    }

    const subscriptionItemId = subItem.id;
    const currentPriceId = subItem.price?.id || proPriceId;
    const currentPeriodEnd = (liveSub as any).current_period_end;

    if (!currentPeriodEnd) {
      throw new Error('[billing/downgrade] Missing current_period_end');
    }

    // Create/Update schedule phases WITH item id (critical)
    const phases = [
      {
        items: [{ id: subscriptionItemId, price: currentPriceId }],
        end_date: currentPeriodEnd,
        proration_behavior: 'none' as const,
      },
      {
        items: [{ id: subscriptionItemId, price: starterPriceId }],
        proration_behavior: 'none' as const,
      },
    ];

    let schedule = liveSub.schedule as Stripe.SubscriptionSchedule | null;
    
    if (schedule?.id) {
      const details = await stripe.subscriptionSchedules.retrieve(schedule.id);
      if (details.status === 'released' || details.status === 'completed') {
        schedule = await stripe.subscriptionSchedules.create({
          from_subscription: liveSub.id,
          phases,
        });
      } else {
        schedule = await stripe.subscriptionSchedules.update(schedule.id, {
          phases,
        });
      }
    } else {
      schedule = await stripe.subscriptionSchedules.create({
        from_subscription: liveSub.id,
        phases,
      });
    }

    console.log('[billing/downgrade] scheduled', {
      sub: liveSub.id,
      schedule: schedule?.id,
      effectiveDate: new Date(currentPeriodEnd * 1000).toISOString()
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
      { error: 'Failed to schedule downgrade' },
      { status: 500 }
    );
  }
}

