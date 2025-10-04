// app/api/subscription/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { subscription: true }
  });

  if (!user?.subscription) {
    return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
  }

  return NextResponse.json({
    plan: user.subscription.plan,
    status: user.subscription.status,
    usageCount: user.subscription.usageCount,
    usageLimit: user.subscription.usageLimit,
    currentPeriodStart: user.subscription.currentPeriodStart,
    currentPeriodEnd: user.subscription.currentPeriodEnd,
  });
}
