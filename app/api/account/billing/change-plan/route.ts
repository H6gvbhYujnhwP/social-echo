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
        { error: 'No Stripe subscription found' },
        { status: 400 }
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

    // Update subscription with new price
    const updatedSubscription = await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      {
        items: [{
          id: stripeSubscription.items.data[0].id,
          price: targetPriceId,
        }],
        proration_behavior: 'create_prorations', // Default Stripe proration
      }
    );

    // Update our database
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        plan: validated.targetPlan,
        usageLimit: validated.targetPlan === 'starter' ? 8 : 20,
      }
    });

    console.log('[billing] Plan changed', {
      userId: user.id,
      from: subscription.plan,
      to: validated.targetPlan
    });

    return NextResponse.json({
      ok: true,
      newPlan: validated.targetPlan,
      proratedAmount: updatedSubscription.latest_invoice
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

