// app/api/portal/route.ts
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/billing/stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ 
    where: { email: session.user.email }, 
    include: { subscription: true }
  });
  const customerId = user?.subscription?.stripeCustomerId;
  if (!customerId) {
    return NextResponse.json({ error: 'No Stripe customer' }, { status: 400 });
  }

  const portal = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: process.env.BILLING_PORTAL_RETURN_URL || 'https://www.socialecho.ai/train?welcome=1',
  });

  return NextResponse.json({ url: portal.url });
}
