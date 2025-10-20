import { NextRequest, NextResponse } from 'next/server';
import { getAdminActorOrThrow } from '@/lib/rbac';
import { backfillLegacyTax } from '@/scripts/backfill-legacy-tax';

/**
 * POST /api/admin/backfill-tax
 * 
 * Admin-only endpoint to backfill legacy subscriptions with VAT/tax
 * 
 * This updates all active Stripe subscriptions that don't have tax enabled
 * to include automatic_tax or default_tax_rates, ensuring future invoices
 * display VAT breakdown.
 * 
 * Security: Requires MASTER_ADMIN role
 */
export async function POST(req: NextRequest) {
  try {
    // Verify admin access
    const actor = await getAdminActorOrThrow();
    
    console.log(`[admin/backfill-tax] Initiated by admin: ${actor.email}`);

    // Run backfill script
    const stats = await backfillLegacyTax();

    return NextResponse.json({
      success: true,
      message: 'Legacy subscription tax backfill completed',
      stats,
    });
  } catch (error: any) {
    console.error('[admin/backfill-tax] Error:', error);

    if (error.message?.includes('Forbidden')) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to backfill legacy subscriptions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

