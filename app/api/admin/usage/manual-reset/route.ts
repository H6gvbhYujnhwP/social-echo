// app/api/admin/usage/manual-reset/route.ts
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ensureUsageWindowFresh } from '@/lib/usage/reset';

/**
 * Admin endpoint to manually reset usage for a specific user
 * Useful for customer support and testing
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || (user.role as string) !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    console.log('[admin/usage/manual-reset] Resetting usage for user:', userId);

    // Get user's subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId }
    });

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // Force reset by calling ensureUsageWindowFresh
    const updated = await ensureUsageWindowFresh(subscription);

    console.log('[admin/usage/manual-reset] Reset complete for user:', userId);

    return NextResponse.json({
      success: true,
      message: 'Usage reset successfully',
      subscription: {
        id: updated.id,
        userId: updated.userId,
        plan: updated.plan,
        usageCount: updated.usageCount,
        usageLimit: updated.usageLimit,
        currentPeriodStart: updated.currentPeriodStart,
        currentPeriodEnd: updated.currentPeriodEnd,
      }
    });
  } catch (error) {
    console.error('[admin/usage/manual-reset] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

