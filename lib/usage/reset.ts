/**
 * Monthly Usage Reset Logic
 * Handles automatic monthly resets of usage counts
 */

import { prisma } from '@/lib/prisma';
import { Subscription } from '@prisma/client';

/**
 * Add months to a date
 */
function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Compute next period end from current period end
 * Rolls forward by 1 month
 */
function computeNextPeriodEnd(currentPeriodEnd: Date): Date {
  return addMonths(currentPeriodEnd, 1);
}

/**
 * Compute initial period boundaries if missing
 * Uses createdAt as anchor, or defaults to calendar month boundaries
 */
function computeInitialPeriod(createdAt: Date): { start: Date; end: Date } {
  const now = new Date();
  
  // Use createdAt as anchor if available
  if (createdAt) {
    const start = new Date(createdAt);
    const end = addMonths(start, 1);
    
    // If we're past the first period, roll forward to current period
    if (now >= end) {
      const monthsSinceCreation = Math.floor(
        (now.getTime() - start.getTime()) / (30 * 24 * 60 * 60 * 1000)
      );
      return {
        start: addMonths(start, monthsSinceCreation),
        end: addMonths(start, monthsSinceCreation + 1),
      };
    }
    
    return { start, end };
  }
  
  // Fallback: use calendar month boundaries (1st of next month 00:00 UTC)
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0));
  
  return { start, end };
}

/**
 * Check if usage window needs reset and perform it
 * Called before checking limits in /api/generate and /api/usage
 * 
 * @param subscription - Subscription object
 * @returns Updated subscription if reset occurred, original if not
 */
export async function ensureUsageWindowFresh(
  subscription: Subscription
): Promise<Subscription> {
  const now = new Date();
  
  // CRITICAL: Free trial users should NEVER have their usage reset
  // They get 30 posts total for lifetime, not per month
  if (subscription.status === 'free_trial') {
    return subscription;
  }
  
  // Check if we have period boundaries
  if (!subscription.currentPeriodEnd) {
    // Initialize period boundaries
    const { start, end } = computeInitialPeriod(subscription.createdAt);
    
    const updated = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        currentPeriodStart: start,
        currentPeriodEnd: end,
        usageCount: 0, // Reset count when initializing
      },
    });
    
    console.log(`[usage-reset] Initialized period for subscription ${subscription.id}: ${start.toISOString()} → ${end.toISOString()}`);
    return updated;
  }
  
  // Check if we're past the current period end
  if (now >= subscription.currentPeriodEnd) {
    // Reset needed
    const newStart = subscription.currentPeriodEnd;
    const newEnd = computeNextPeriodEnd(subscription.currentPeriodEnd);
    
    const updated = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        currentPeriodStart: newStart,
        currentPeriodEnd: newEnd,
        usageCount: 0, // Reset usage count
      },
    });
    
    console.log(`[usage-reset] Reset subscription ${subscription.id}: ${newStart.toISOString()} → ${newEnd.toISOString()}, count: ${subscription.usageCount} → 0`);
    return updated;
  }
  
  // No reset needed
  return subscription;
}

/**
 * Find all subscriptions that need reset and perform them
 * Used by nightly cron job for belt-and-braces background resets
 * 
 * @returns Number of subscriptions reset
 */
export async function resetDueSubscriptions(): Promise<number> {
  const now = new Date();
  
  // Find subscriptions where currentPeriodEnd is in the past or missing
  // Split into two queries to avoid Prisma type issues with null filters
  const [missingPeriod, pastPeriod] = await Promise.all([
    // Subscriptions with missing period boundaries (exclude free trial)
    prisma.subscription.findMany({
      where: {
        currentPeriodEnd: null as any, // Type assertion needed for Prisma nullable DateTime
        status: { not: 'free_trial' }, // Free trial should never reset
      },
    }),
    // Subscriptions past their period end (exclude free trial)
    prisma.subscription.findMany({
      where: {
        currentPeriodEnd: {
          lte: now,
        },
        status: { not: 'free_trial' }, // Free trial should never reset
      },
    }),
  ]);
  
  // Combine and deduplicate
  const dueSubscriptions = [...missingPeriod, ...pastPeriod];
  const uniqueSubscriptions = Array.from(
    new Map(dueSubscriptions.map(sub => [sub.id, sub])).values()
  );
  
  let resetCount = 0;
  
  for (const sub of uniqueSubscriptions) {
    try {
      await ensureUsageWindowFresh(sub);
      resetCount++;
    } catch (error) {
      console.error(`[usage-reset] Failed to reset subscription ${sub.id}:`, error);
    }
  }
  
  console.log(`[usage-reset] Background job reset ${resetCount} subscriptions`);
  return resetCount;
}

