import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminActorOrThrow } from '@/lib/rbac';
import { stripe } from '@/lib/billing/stripe';
import { PLANS } from '@/lib/billing/plans';

export async function POST(req: Request, { params }: { params: { id: string }}) {
  try {
    const actor = await getAdminActorOrThrow();
    const { planKey } = await req.json() as { planKey: keyof typeof PLANS };
    
    const plan = PLANS[planKey];
    if (!plan) {
      return NextResponse.json({ error: 'Invalid planKey' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ 
      where: { id: params.id }, 
      include: { subscription: true }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    if (!user.subscription?.stripeCustomerId) {
      return NextResponse.json({ 
        error: 'No Stripe customer found. User must complete initial checkout first.' 
      }, { status: 400 });
    }

    const checkout = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: user.subscription.stripeCustomerId,
      line_items: [{ price: plan.priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${process.env.NEXTAUTH_URL}/train?welcome=1`,
      cancel_url:  `${process.env.NEXTAUTH_URL}/dashboard?billing=cancel`,
    });

    await prisma.auditLog.create({
      data: { 
        actorId: actor.id, 
        action: 'PLAN_CHECKOUT_LINK', 
        targetId: user.id, 
        meta: { planKey } 
      }
    });

    return NextResponse.json({ url: checkout.url });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: error.message?.includes('Forbidden') ? 403 : 500 }
    );
  }
}
