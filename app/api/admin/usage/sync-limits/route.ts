// app/api/admin/usage/sync-limits/route.ts
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { syncSubscriptionsByCustomerId, syncSubscriptionById } from '@/lib/billing/sync-subscription';

/**
 * Admin endpoint to sync usage limits from Stripe (self-heal function)
 * Fetches current subscription data from Stripe and updates local DB
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

    // Parse request body for optional user IDs
    let userIds: string[] | undefined;
    try {
      const body = await request.json();
      userIds = body.userIds;
    } catch {
      // No body or invalid JSON - sync all users
    }

    console.log('[admin/usage/sync-limits] Starting sync...', {
      adminId: user.id,
      targetUserIds: userIds || 'all',
    });

    // Get subscriptions to sync
    const subscriptions = await prisma.subscription.findMany({
      where: userIds ? { userId: { in: userIds } } : {},
      include: { user: true },
    });

    console.log('[admin/usage/sync-limits] Found', subscriptions.length, 'subscriptions');

    const results = {
      total: subscriptions.length,
      synced: 0,
      failed: 0,
      skipped: 0,
      errors: [] as string[],
    };

    // Sync each subscription from Stripe
    for (const subscription of subscriptions) {
      try {
        if (subscription.stripeSubscriptionId) {
          // Sync by subscription ID (most accurate)
          const result = await syncSubscriptionById(subscription.stripeSubscriptionId);
          
          if (result.success) {
            results.synced++;
            console.log('[admin/usage/sync-limits] Synced:', {
              userId: subscription.userId,
              email: subscription.user.email,
              plan: result.plan,
              status: result.status,
            });
          } else {
            results.failed++;
            results.errors.push(`${subscription.user.email}: ${result.error}`);
          }
        } else if (subscription.stripeCustomerId) {
          // Fallback: sync by customer ID
          const customerResults = await syncSubscriptionsByCustomerId(subscription.stripeCustomerId);
          
          const successCount = customerResults.filter(r => r.success).length;
          if (successCount > 0) {
            results.synced++;
          } else {
            results.failed++;
            const error = customerResults[0]?.error || 'Unknown error';
            results.errors.push(`${subscription.user.email}: ${error}`);
          }
        } else {
          // No Stripe IDs - skip
          results.skipped++;
          console.warn('[admin/usage/sync-limits] No Stripe IDs:', subscription.user.email);
        }
      } catch (error: any) {
        results.failed++;
        results.errors.push(`${subscription.user.email}: ${error.message}`);
        console.error('[admin/usage/sync-limits] Error:', error);
      }
    }

    console.log('[admin/usage/sync-limits] Complete:', results);

    return NextResponse.json({
      success: true,
      message: `Synced ${results.synced} of ${results.total} subscriptions`,
      results,
    });
  } catch (error: any) {
    console.error('[admin/usage/sync-limits] Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'SYNC_FAILED',
        message: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

