// app/api/admin/migrate/fix-free-trial-flag/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/admin/migrate/fix-free-trial-flag
 * 
 * Data migration endpoint to set hasUsedFreeTrial = true for all users
 * who have a free_trial subscription status but don't have the flag set.
 * 
 * This fixes the issue where existing free trial users get an additional
 * 1-day trial when upgrading to paid plans.
 * 
 * Admin only.
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions) as any;
    
    // Check if user is authenticated and is admin
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    // Find all users with free_trial subscription who don't have hasUsedFreeTrial set
    const usersToUpdate = await prisma.user.findMany({
      where: {
        subscription: {
          status: 'free_trial'
        },
        hasUsedFreeTrial: false
      },
      select: {
        id: true,
        email: true,
        subscription: {
          select: {
            status: true,
            plan: true
          }
        }
      }
    });

    console.log(`[migrate] Found ${usersToUpdate.length} free trial users to update`);

    // Update all these users to have hasUsedFreeTrial = true
    const updateResult = await prisma.user.updateMany({
      where: {
        id: {
          in: usersToUpdate.map(u => u.id)
        }
      },
      data: {
        hasUsedFreeTrial: true,
        freeTrialUsedAt: new Date()
      }
    });

    console.log(`[migrate] Updated ${updateResult.count} users`);

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${updateResult.count} free trial users`,
      usersUpdated: usersToUpdate.map(u => ({
        email: u.email,
        subscriptionStatus: u.subscription?.status,
        subscriptionPlan: u.subscription?.plan
      }))
    });

  } catch (error) {
    console.error('[migrate] Error:', error);
    return NextResponse.json(
      { error: 'Migration failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
