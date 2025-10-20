/**
 * Migration Script: Sync Pro Plan Usage Limits
 * 
 * Purpose: Update all Pro plan subscriptions from unlimited (1,000,000) to 30/month
 * 
 * This script:
 * 1. Finds all Pro plan subscriptions
 * 2. Updates usageLimit from 1,000,000 to 30
 * 3. Initializes currentPeriodStart/End if missing
 * 4. Reports migration statistics
 * 
 * Usage:
 *   npx tsx scripts/migrate-pro-usage-limits.ts
 */

import { PrismaClient } from '@prisma/client';
import { syncAllUsageLimits } from '../lib/usage/sync';

const prisma = new PrismaClient();

async function main() {
  console.log('='.repeat(60));
  console.log('Pro Plan Usage Limit Migration');
  console.log('='.repeat(60));
  console.log();

  try {
    // Get current state
    const allSubs = await prisma.subscription.findMany({
      select: {
        id: true,
        userId: true,
        plan: true,
        usageLimit: true,
        usageCount: true,
        currentPeriodStart: true,
        currentPeriodEnd: true,
      }
    });

    console.log(`Total subscriptions: ${allSubs.length}`);
    console.log();

    // Group by plan
    const byPlan = allSubs.reduce((acc, sub) => {
      const plan = sub.plan.toLowerCase();
      if (!acc[plan]) acc[plan] = [];
      acc[plan].push(sub);
      return acc;
    }, {} as Record<string, typeof allSubs>);

    console.log('Current state by plan:');
    Object.entries(byPlan).forEach(([plan, subs]) => {
      console.log(`  ${plan}: ${subs.length} subscriptions`);
      const limits = subs.map(s => s.usageLimit);
      const uniqueLimits = [...new Set(limits)];
      console.log(`    Limits: ${uniqueLimits.join(', ')}`);
    });
    console.log();

    // Find Pro plans that need migration
    const proSubs = byPlan['pro'] || [];
    const proUnlimited = proSubs.filter(s => s.usageLimit >= 1000000);
    const proMissingPeriod = proSubs.filter(s => !s.currentPeriodStart || !s.currentPeriodEnd);

    console.log('Pro plan analysis:');
    console.log(`  Total Pro subscriptions: ${proSubs.length}`);
    console.log(`  Pro with unlimited (1M+): ${proUnlimited.length}`);
    console.log(`  Pro missing period boundaries: ${proMissingPeriod.length}`);
    console.log();

    if (proSubs.length === 0) {
      console.log('✓ No Pro subscriptions found. Nothing to migrate.');
      return;
    }

    // Confirm migration
    console.log('Migration will:');
    console.log(`  1. Update ${proUnlimited.length} Pro subscriptions from unlimited to 30/month`);
    console.log(`  2. Initialize ${proMissingPeriod.length} Pro subscriptions with period boundaries`);
    console.log(`  3. Keep existing usage counts unchanged`);
    console.log();

    // In production, you'd want to prompt for confirmation
    // For now, we'll proceed automatically
    console.log('Starting migration...');
    console.log();

    // Use centralized sync function
    const result = await syncAllUsageLimits();

    console.log('Migration complete!');
    console.log();
    console.log('Results:');
    console.log(`  Total processed: ${result.total}`);
    console.log(`  Updated: ${result.updated}`);
    console.log(`  Skipped: ${result.skipped}`);
    console.log();

    // Verify migration
    const afterSubs = await prisma.subscription.findMany({
      where: { plan: 'pro' },
      select: {
        id: true,
        usageLimit: true,
        usageCount: true,
        currentPeriodStart: true,
        currentPeriodEnd: true,
      }
    });

    console.log('Post-migration verification:');
    console.log(`  Pro subscriptions: ${afterSubs.length}`);
    const limits = afterSubs.map(s => s.usageLimit);
    const uniqueLimits = [...new Set(limits)];
    console.log(`  Usage limits: ${uniqueLimits.join(', ')}`);
    
    const missingPeriod = afterSubs.filter(s => !s.currentPeriodStart || !s.currentPeriodEnd);
    console.log(`  Missing period boundaries: ${missingPeriod.length}`);
    
    if (missingPeriod.length > 0) {
      console.log();
      console.log('⚠️  Warning: Some subscriptions still missing period boundaries:');
      missingPeriod.forEach(s => {
        console.log(`    - ${s.id}`);
      });
    }

    console.log();
    console.log('='.repeat(60));
    console.log('✓ Migration completed successfully');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

