// app/api/account/billing/cancel-downgrade/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/billing/stripe';

export const runtime = 'nodejs';

// Social Echo Blueprint v8.6 — unified Stripe API version (2024-06-20)

/**
 * POST /api/account/billing/cancel-downgrade
 * 
 * Cancels a scheduled downgrade by releasing the Subscription Schedule.
 * Clears pendingPlan, pendingAt, and scheduleId from the database.
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

    // Check if there's a pending downgrade
    if (!subscription.scheduleId || !subscription.pendingPlan) {
      return NextResponse.json(
        { error: 'No pending downgrade to cancel' },
        { status: 400 }
      );
    }

    // Release the Stripe Subscription Schedule
    try {
      await stripe.subscriptionSchedules.release(subscription.scheduleId);
      console.log('[billing/cancel-downgrade] Schedule released:', {
        scheduleId: subscription.scheduleId,
        userId: user.id,
      });
    } catch (stripeError: any) {
      // If schedule doesn't exist or is already released, continue anyway
      console.warn('[billing/cancel-downgrade] Stripe schedule release warning:', {
        scheduleId: subscription.scheduleId,
        error: stripeError.message,
      });
    }

    // Clear pending downgrade state from database
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd: false,
        pendingPlan: null,
        pendingAt: null,
        scheduleId: null,
      }
    });

    console.log('[billing] Downgrade cancelled', {
      userId: user.id,
      scheduleId: subscription.scheduleId,
    });

    return NextResponse.json({
      ok: true,
      message: 'Scheduled downgrade cancelled successfully'
    });

  } catch (error: any) {
    console.error('[billing] Cancel downgrade failed:', error);

    return NextResponse.json(
      { error: 'Failed to cancel downgrade', details: error.message },
      { status: 500 }
    );
  }
}

