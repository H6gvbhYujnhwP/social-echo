// app/api/usage/route.ts
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkPostsRemaining } from '@/lib/usage/service';
import { getEffectiveUserId } from '@/lib/impersonation';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check for impersonation
    const { effectiveUserId } = await getEffectiveUserId(request, currentUser.id);

    const user = await prisma.user.findUnique({
      where: { id: effectiveUserId },
      include: { subscription: true }
    });

    if (!user?.subscription) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
    }

    // Use centralized usage service with automatic monthly reset
    const usage = await checkPostsRemaining(user.id);

    return NextResponse.json({
      plan: user.subscription.plan.toLowerCase(),
      posts_allowance: usage.postsAllowance,
      cycle_start: user.subscription.currentPeriodStart?.toISOString(),
      cycle_end: usage.cycleEnd?.toISOString(),
      posts_used: usage.postsUsed,
      posts_left: usage.postsLeft,
    });
  } catch (error) {
    console.error('[GET /api/usage] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

