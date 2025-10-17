export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminActorOrThrow } from '@/lib/rbac';
import { stripe } from '@/lib/billing/stripe';

export async function POST(_: Request, { params }: { params: { id: string }}) {
  try {
    const actor = await getAdminActorOrThrow();
    
    const user = await prisma.user.findUnique({ 
      where: { id: params.id }, 
      include: { subscription: true }
    });
    
    const customerId = user?.subscription?.stripeCustomerId;
    
    if (!customerId) {
      return NextResponse.json({ 
        error: 'No Stripe customer found. User must complete initial checkout first.' 
      }, { status: 400 });
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: process.env.NEXTAUTH_URL || 'https://www.socialecho.ai/dashboard',
    });

    await prisma.auditLog.create({ 
      data: { 
        actorId: actor.id, 
        action: 'PORTAL_LINK', 
        targetId: user?.id 
      }
    });
    
    return NextResponse.json({ url: portal.url });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create portal session' },
      { status: error.message?.includes('Forbidden') ? 403 : 500 }
    );
  }
}
