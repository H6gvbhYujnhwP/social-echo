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

  // Check if trial has expired
  const isTrial = user.subscription.status === 'trial'
  const isTrialing = user.subscription.status === 'trialing'
  const trialEnd = user.subscription.trialEnd
  const isTrialExpired = isTrial && trialEnd && new Date() > trialEnd

  return NextResponse.json({
    plan: user.subscription.plan,
    status: user.subscription.status,
    usageCount: user.subscription.usageCount,
    usageLimit: user.subscription.usageLimit,
    currentPeriodStart: user.subscription.currentPeriodStart,
    currentPeriodEnd: user.subscription.currentPeriodEnd,
    trialEnd: user.subscription.trialEnd,
    // Only show trial banner for real Starter trials (status='trialing'), not admin-created trial accounts (status='trial')
    isTrial: isTrialing,
    isTrialExpired,
    // v8.6: Pending downgrade state
    pendingPlan: user.subscription.pendingPlan,
    pendingAt: user.subscription.pendingAt,
    scheduleId: user.subscription.scheduleId,
    cancelAtPeriodEnd: user.subscription.cancelAtPeriodEnd,
  });
}
