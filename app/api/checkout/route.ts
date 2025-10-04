// app/api/checkout/route.ts
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/billing/stripe';
import { PLANS, PlanKey } from '@/lib/billing/plans';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { planKey } = await req.json() as { planKey: PlanKey };
  const plan = PLANS[planKey];
  if (!plan) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });

  // Ensure user & Subscription row
  const user = await prisma.user.findUnique({ 
    where: { email: session.user.email }, 
    include: { subscription: true }
  });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // Get or create Stripe Customer
  let stripeCustomerId = user.subscription?.stripeCustomerId;
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({ email: user.email });
    stripeCustomerId = customer.id;
    await prisma.subscription.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        plan: plan.label.toLowerCase(),
        status: 'incomplete',
        usageLimit: plan.usageLimit,
        stripeCustomerId,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      },
      update: { stripeCustomerId },
    });
  }

  // Create Checkout Session
  const checkout = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: stripeCustomerId,
    line_items: [{ price: plan.priceId, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: 'https://www.socialecho.ai/train?welcome=1',
    cancel_url: 'https://www.socialecho.ai/dashboard?billing=cancel',
  });

  return NextResponse.json({ url: checkout.url });
}
