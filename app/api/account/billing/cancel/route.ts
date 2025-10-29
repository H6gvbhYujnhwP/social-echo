// app/api/account/billing/cancel/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/billing/stripe';
import { sendSubscriptionCancelledEmail, sendTrialCancelledEmail } from '@/lib/email/service';
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

    // Parse feedback from request body
    const body = await request.json();
    const { reason, comment } = body;

    // Validate feedback reason is provided
    if (!reason) {
      return NextResponse.json(
        { error: 'Feedback reason is required before cancellation' },
        { status: 400 }
      );
    }

    // Validate reason is one of the allowed values
    const validReasons = ['too_expensive', 'not_using', 'missing_features', 'switching', 'other'];
    if (!validReasons.includes(reason)) {
      return NextResponse.json(
        { error: 'Invalid feedback reason' },
        { status: 400 }
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

    // Check if already cancelled
    if (subscription.cancelAtPeriodEnd || subscription.status === 'canceled') {
      return NextResponse.json(
        { error: 'Subscription is already cancelled' },
        { status: 400 }
      );
    }

    // Save cancellation feedback BEFORE processing cancellation
    await prisma.cancellationFeedback.create({
      data: {
        userId: user.id,
        reason,
        comment: comment || null
      }
    });

    console.log('[billing] Cancellation feedback saved', {
      userId: user.id,
      reason,
      hasComment: !!comment
    });

    // Cancel subscription in Stripe
    let canceledSubscription: any;
    const isTrialing = subscription.status === 'trialing';
    
    if (isTrialing) {
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

    // Update our database
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: canceledSubscription.cancel_at_period_end ? 'active' : 'canceled',
        cancelAtPeriodEnd: !!canceledSubscription.cancel_at_period_end
      }
    });

    const effectiveDate = isTrialing 
      ? new Date()
      : new Date((canceledSubscription.current_period_end || 0) * 1000);

    // Send immediate cancellation email
    try {
      if (isTrialing) {
        await sendTrialCancelledEmail(
          user.email,
          user.name,
          subscription.plan
        );
        console.log('[billing] Trial cancellation email sent immediately');
      } else {
        await sendSubscriptionCancelledEmail(
          user.email,
          user.name,
          subscription.plan,
          effectiveDate.toLocaleDateString('en-GB', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          })
        );
        console.log('[billing] Cancellation email sent immediately');
      }
    } catch (emailError) {
      console.error('[billing] Failed to send immediate cancellation email:', emailError);
      // Don't fail the cancellation if email fails
    }

    console.log('[billing] Subscription canceled with feedback', {
      userId: user.id,
      plan: subscription.plan,
      reason,
      immediate: isTrialing,
      effectiveDate: effectiveDate.toISOString()
    });

    return NextResponse.json({
      ok: true,
      immediate: isTrialing,
      effectiveDate: effectiveDate.toISOString(),
      message: isTrialing
        ? 'Your trial has been cancelled immediately.'
        : `Your subscription will remain active until ${effectiveDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}. You can continue using Social Echo until then.`
    });

  } catch (error: any) {
    console.error('[billing] Cancel failed:', error);

    return NextResponse.json(
      { error: 'Failed to cancel subscription', details: error.message },
      { status: 500 }
    );
  }
}
