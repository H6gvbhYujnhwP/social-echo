/**
 * Backfill Legacy Subscriptions with VAT/Tax
 * 
 * This script updates all existing active Stripe subscriptions to enable
 * automatic tax, ensuring all future invoices display VAT breakdown.
 * 
 * Usage:
 *   npx ts-node scripts/backfill-legacy-tax.ts
 * 
 * Or via API endpoint (admin only):
 *   POST /api/admin/backfill-tax
 */

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia' as any,
});

interface BackfillStats {
  total: number;
  alreadyEnabled: number;
  updated: number;
  failed: number;
  errors: Array<{ subscriptionId: string; error: string }>;
}

async function backfillLegacyTax(): Promise<BackfillStats> {
  const stats: BackfillStats = {
    total: 0,
    alreadyEnabled: 0,
    updated: 0,
    failed: 0,
    errors: [],
  };

  console.log('[backfill-tax] Starting legacy subscription tax backfill...');
  console.log('[backfill-tax] Fetching active subscriptions from Stripe...');

  try {
    // Fetch all active subscriptions (paginated)
    let hasMore = true;
    let startingAfter: string | undefined = undefined;

    while (hasMore) {
      const subscriptions: Stripe.ApiList<Stripe.Subscription> = await stripe.subscriptions.list({
        status: 'active',
        limit: 100,
        starting_after: startingAfter,
      });

      console.log(`[backfill-tax] Processing ${subscriptions.data.length} subscriptions...`);

      for (const subscription of subscriptions.data) {
        stats.total++;

        // Check if tax is already enabled
        const hasAutomaticTax = subscription.automatic_tax?.enabled === true;
        const hasDefaultTaxRates = (subscription.default_tax_rates?.length ?? 0) > 0;

        if (hasAutomaticTax || hasDefaultTaxRates) {
          stats.alreadyEnabled++;
          console.log(`[backfill-tax] ✓ ${subscription.id} - Tax already enabled`);
          continue;
        }

        // Update subscription to enable automatic tax
        try {
          // Prefer automatic tax if available, fallback to manual tax rate
          const updateParams: Stripe.SubscriptionUpdateParams = {};

          if (process.env.STRIPE_TAXRATE_UK_VAT_20) {
            // Use manual tax rate fallback
            updateParams.default_tax_rates = [process.env.STRIPE_TAXRATE_UK_VAT_20];
            console.log(`[backfill-tax] → ${subscription.id} - Enabling manual tax rate...`);
          } else {
            // Use automatic tax (Stripe Tax)
            updateParams.automatic_tax = { enabled: true };
            console.log(`[backfill-tax] → ${subscription.id} - Enabling automatic tax...`);
          }

          await stripe.subscriptions.update(subscription.id, updateParams);

          stats.updated++;
          console.log(`[backfill-tax] ✓ ${subscription.id} - Successfully updated`);
        } catch (error) {
          stats.failed++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          stats.errors.push({
            subscriptionId: subscription.id,
            error: errorMessage,
          });
          console.error(`[backfill-tax] ✗ ${subscription.id} - Failed: ${errorMessage}`);
        }
      }

      hasMore = subscriptions.has_more;
      if (hasMore && subscriptions.data.length > 0) {
        startingAfter = subscriptions.data[subscriptions.data.length - 1].id;
      }
    }

    console.log('\n[backfill-tax] ===== BACKFILL COMPLETE =====');
    console.log(`[backfill-tax] Total subscriptions: ${stats.total}`);
    console.log(`[backfill-tax] Already enabled: ${stats.alreadyEnabled}`);
    console.log(`[backfill-tax] Updated: ${stats.updated}`);
    console.log(`[backfill-tax] Failed: ${stats.failed}`);

    if (stats.errors.length > 0) {
      console.log('\n[backfill-tax] Errors:');
      stats.errors.forEach(({ subscriptionId, error }) => {
        console.log(`  - ${subscriptionId}: ${error}`);
      });
    }

    return stats;
  } catch (error) {
    console.error('[backfill-tax] Fatal error:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  backfillLegacyTax()
    .then((stats) => {
      console.log('\n[backfill-tax] Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n[backfill-tax] Script failed:', error);
      process.exit(1);
    });
}

export { backfillLegacyTax };
export type { BackfillStats };

