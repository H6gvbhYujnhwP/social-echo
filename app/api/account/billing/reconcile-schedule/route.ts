// app/api/account/billing/reconcile-schedule/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/billing/stripe';
import Stripe from 'stripe';

export const runtime = 'nodejs';

// Social Echo Blueprint v8.6 — unified Stripe API version (2024-06-20)

/**
 * GET /api/account/billing/reconcile-schedule
 * 
 * Reconciles pending downgrade state from Stripe if database is out of sync.
 * Checks if there's an active Subscription Schedule with a Starter phase.
 * Used for hydrating UI state after page refresh.
 * 
 * Returns:
 * - { pendingPlan, effectiveAt, scheduleId } if downgrade is scheduled
 * - { pendingPlan: null } if no pending downgrade
 */
export async function GET(request: NextRequest) {
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

    // If database already has pending state, return it
    if (subscription.pendingPlan && subscription.pendingAt && subscription.scheduleId) {
      return NextResponse.json({
        pendingPlan: subscription.pendingPlan,
        effectiveAt: subscription.pendingAt.toISOString(),
        scheduleId: subscription.scheduleId,
        source: 'database'
      });
    }

    // Otherwise, check Stripe for active schedule
    if (!subscription.stripeSubscriptionId) {
      return NextResponse.json({ pendingPlan: null });
    }

    try {
      // Retrieve subscription with schedule expanded
      const liveSub = await stripe.subscriptions.retrieve(
        subscription.stripeSubscriptionId,
        { expand: ['schedule'] }
      );

      const schedule = liveSub.schedule as Stripe.SubscriptionSchedule | null;

      // Check if there's an active or not_started schedule
      if (!schedule?.id || (schedule.status !== 'active' && schedule.status !== 'not_started')) {
        return NextResponse.json({ pendingPlan: null });
      }

      // Retrieve full schedule details
      const fullSchedule = await stripe.subscriptionSchedules.retrieve(schedule.id);

      // Check if next phase is Starter
      const starterPriceId = process.env.STRIPE_STARTER_PRICE_ID;
      if (!starterPriceId) {
        console.error('[billing/reconcile] Starter price ID not configured');
        return NextResponse.json({ pendingPlan: null });
      }

      // Look for a phase with Starter price
      const starterPhase = fullSchedule.phases.find(phase => 
        phase.items.some(item => item.price === starterPriceId)
      );

      if (starterPhase && starterPhase.start_date) {
        const effectiveAt = new Date(starterPhase.start_date * 1000);

        // Update database with reconciled state
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            pendingPlan: 'starter',
            pendingAt: effectiveAt,
            scheduleId: fullSchedule.id,
            cancelAtPeriodEnd: true,
          }
        });

        console.log('[billing/reconcile] Reconciled pending downgrade from Stripe:', {
          userId: user.id,
          scheduleId: fullSchedule.id,
          effectiveAt: effectiveAt.toISOString(),
        });

        return NextResponse.json({
          pendingPlan: 'starter',
          effectiveAt: effectiveAt.toISOString(),
          scheduleId: fullSchedule.id,
          source: 'stripe'
        });
      }

      // No pending downgrade found
      return NextResponse.json({ pendingPlan: null });

    } catch (stripeError: any) {
      console.error('[billing/reconcile] Stripe API error:', stripeError.message);
      // On Stripe error, return database state or null
      return NextResponse.json({ pendingPlan: null });
    }

  } catch (error: any) {
    console.error('[billing] Reconcile schedule failed:', error);

    return NextResponse.json(
      { error: 'Failed to reconcile schedule', details: error.message },
      { status: 500 }
    );
  }
}

