/**
 * Usage Limit Synchronization
 * Ensures database usageLimit matches plan-based limits
 */

import { prisma } from '@/lib/prisma';
import { getUsageLimit, type Plan } from './limits';

/**
 * Synchronize usage limit for a user's subscription
 * Updates usageLimit in database to match current plan limits
 * 
 * Called during:
 * - /api/usage
 * - /api/generate
 * - /api/subscription
 * 
 * @param userId - User ID to sync
 * @returns true if sync was needed, false if already correct
 */
export async function syncUsageLimitIfNeeded(userId: string): Promise<boolean> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: {
      id: true,
      plan: true,
      usageLimit: true,
    },
  });

  if (!subscription) {
    return false; // No subscription, nothing to sync
  }

  const plan = subscription.plan as Plan;
  const correctLimit = getUsageLimit(plan);

  // Check if sync is needed
  if (subscription.usageLimit === correctLimit) {
    return false; // Already correct
  }

  // Update to correct limit
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { usageLimit: correctLimit },
  });

  console.log(`[usage-sync] Updated ${userId} (${plan}): ${subscription.usageLimit} → ${correctLimit}`);
  return true;
}

/**
 * Bulk sync usage limits for all subscriptions
 * Used by admin tools to rebalance limits after plan changes
 * 
 * @param planFilter - Optional plan to filter by (e.g., 'pro' for Pro rebalancing)
 * @returns Number of subscriptions updated
 */
export async function bulkSyncUsageLimits(planFilter?: Plan): Promise<number> {
  const where = planFilter ? { plan: planFilter } : {};
  
  const subscriptions = await prisma.subscription.findMany({
    where,
    select: {
      id: true,
      plan: true,
      usageLimit: true,
    },
  });

  let updated = 0;

  for (const sub of subscriptions) {
    const plan = sub.plan as Plan;
    const correctLimit = getUsageLimit(plan);

    if (sub.usageLimit !== correctLimit) {
      await prisma.subscription.update({
        where: { id: sub.id },
        data: { usageLimit: correctLimit },
      });
      updated++;
      console.log(`[bulk-sync] Updated subscription ${sub.id} (${plan}): ${sub.usageLimit} → ${correctLimit}`);
    }
  }

  return updated;
}

/**
 * Sync all usage limits across all subscriptions
 * Alias for bulkSyncUsageLimits() for backward compatibility
 * 
 * @returns Object with total and updated counts
 */
export async function syncAllUsageLimits(): Promise<{ total: number; updated: number; skipped: number }> {
  const subscriptions = await prisma.subscription.findMany({
    select: {
      id: true,
      plan: true,
      usageLimit: true,
    },
  });

  let updated = 0;
  let skipped = 0;

  for (const sub of subscriptions) {
    const plan = sub.plan.toLowerCase() as Plan;
    const correctLimit = getUsageLimit(plan);

    if (sub.usageLimit !== correctLimit) {
      await prisma.subscription.update({
        where: { id: sub.id },
        data: { usageLimit: correctLimit },
      });
      updated++;
      console.log(`[sync-all] Updated subscription ${sub.id} (${plan}): ${sub.usageLimit} → ${correctLimit}`);
    } else {
      skipped++;
    }
  }

  return {
    total: subscriptions.length,
    updated,
    skipped,
  };
}

