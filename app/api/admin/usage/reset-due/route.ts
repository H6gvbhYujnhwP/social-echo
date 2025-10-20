/**
 * Admin Usage Reset API
 * Background cron endpoint to reset subscriptions that are past their period end
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { getAdminActorOrThrow } from '@/lib/rbac';
import { resetDueSubscriptions } from '@/lib/usage/reset';

/**
 * POST /api/admin/usage/reset-due
 * Reset all subscriptions that are past their current period end
 * 
 * Intended for nightly cron job (belt-and-braces with lazy resets)
 */
export async function POST() {
  try {
    // Require admin authentication
    await getAdminActorOrThrow();
    
    const resetCount = await resetDueSubscriptions();
    
    return NextResponse.json({
      success: true,
      resetCount,
      message: `Reset ${resetCount} subscriptions`,
    });
    
  } catch (error: any) {
    console.error('[admin-usage-reset] Error:', error);
    
    if (error.message?.includes('Admin access required')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to reset subscriptions', details: error.message },
      { status: 500 }
    );
  }
}

