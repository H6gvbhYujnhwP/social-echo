// lib/usage/service.ts
import { prisma } from '@/lib/prisma';
import { getUsageLimit, getRegenerationLimit, PLAN_LIMITS, type Plan } from './limits';
import { ensureUsageWindowFresh } from './reset';

// Regeneration limit is now centralized in PLAN_LIMITS
// Use getRegenerationLimit(plan) instead

/**
 * Track a post generation event
 * - If first generation: set firstGeneratedAt and increment usage counter
 * - If regeneration: increment customisationsUsed (up to limit)
 */
export async function trackPostGeneration(params: {
  postId: string;
  userId: string;
  isRegeneration: boolean;
}): Promise<{ success: boolean; error?: string }> {
  const { postId, userId, isRegeneration } = params;

  try {
    // Use transaction for atomic operations
    return await prisma.$transaction(async (tx) => {
      // Get the post with row-level lock
      const post = await tx.postHistory.findUnique({
        where: { id: postId },
        // Lock the row to prevent race conditions
      });

      if (!post) {
        return { success: false, error: 'Post not found' };
      }

      // Check if this is a customisation (regeneration)
      if (isRegeneration) {
        // Get user's subscription to check plan-based regeneration limit
        const subscription = await tx.subscription.findUnique({
          where: { userId }
        });

        if (!subscription) {
          return { success: false, error: 'Subscription not found' };
        }

        const plan = subscription.plan.toLowerCase() as Plan;
        const maxRegenerations = getRegenerationLimit(plan);
        
        // Check customisation limit
        if (post.customisationsUsed >= maxRegenerations) {
          return { 
            success: false, 
            error: 'CUSTOMISATIONS_EXHAUSTED',
          };
        }

        // Increment customisations counter
        await tx.postHistory.update({
          where: { id: postId },
          data: {
            customisationsUsed: { increment: 1 }
          }
        });

        console.log(`[trackPostGeneration] Customisation tracked for post ${postId}: ${post.customisationsUsed + 1}/${maxRegenerations}`);
        
        return { success: true };
      }

      // This is a first generation
      // Check if already tracked (idempotency)
      if (post.firstGeneratedAt) {
        console.log(`[trackPostGeneration] Post ${postId} already tracked, skipping`);
        return { success: true };
      }

      // Set firstGeneratedAt
      const now = new Date();
      await tx.postHistory.update({
        where: { id: postId },
        data: {
          firstGeneratedAt: now
        }
      });

      // Get subscription for cycle boundaries
      const subscription = await tx.subscription.findUnique({
        where: { userId }
      });

      if (!subscription) {
        return { success: false, error: 'Subscription not found' };
      }

      const cycleStart = subscription.currentPeriodStart;
      const cycleEnd = subscription.currentPeriodEnd;

      // Find or create usage counter for current cycle
      const usageCounter = await tx.usageCounter.upsert({
        where: {
          userId_cycleStartUtc_cycleEndUtc: {
            userId,
            cycleStartUtc: cycleStart,
            cycleEndUtc: cycleEnd,
          }
        },
        create: {
          userId,
          cycleStartUtc: cycleStart,
          cycleEndUtc: cycleEnd,
          postsUsed: 1,
        },
        update: {
          postsUsed: { increment: 1 }
        }
      });

      console.log(`[trackPostGeneration] First generation tracked for post ${postId}, usage: ${usageCounter.postsUsed}`);

      return { success: true };
    });
  } catch (error) {
    console.error('[trackPostGeneration] Error:', error);
    return { success: false, error: 'Internal error' };
  }
}

/**
 * Check if user has posts remaining in current cycle
 * Includes automatic monthly reset logic (lazy reset)
 */
export async function checkPostsRemaining(userId: string): Promise<{
  allowed: boolean;
  postsUsed: number;
  postsAllowance: number;
  postsLeft: number;
  cycleEnd?: Date;
}> {
  try {
    let subscription = await prisma.subscription.findUnique({
      where: { userId }
    });

    if (!subscription) {
      return { allowed: false, postsUsed: 0, postsAllowance: 0, postsLeft: 0 };
    }

    // LAZY RESET: Ensure usage window is fresh before checking limits
    subscription = await ensureUsageWindowFresh(subscription);

    const plan = subscription.plan.toLowerCase() as Plan;
    const postsAllowance = getUsageLimit(plan);

    const cycleStart = subscription.currentPeriodStart;
    const cycleEnd = subscription.currentPeriodEnd;

    // Find or create usage counter
    const usageCounter = await prisma.usageCounter.findUnique({
      where: {
        userId_cycleStartUtc_cycleEndUtc: {
          userId,
          cycleStartUtc: cycleStart,
          cycleEndUtc: cycleEnd,
        }
      }
    });

    const postsUsed = usageCounter?.postsUsed || 0;
    const postsLeft = Math.max(0, postsAllowance - postsUsed);

    return {
      allowed: postsLeft > 0,
      postsUsed,
      postsAllowance,
      postsLeft,
      cycleEnd: subscription.currentPeriodEnd || undefined,
    };
  } catch (error) {
    console.error('[checkPostsRemaining] Error:', error);
    return { allowed: false, postsUsed: 0, postsAllowance: 0, postsLeft: 0 };
  }
}

// Removed getPlanAllowance - now using centralized getUsageLimit from limits.ts

/**
 * Check if customisation is allowed for a post
 * Now uses plan-based regeneration limits
 */
export async function checkCustomisationAllowed(postId: string, userId: string): Promise<{
  allowed: boolean;
  customisationsUsed: number;
  customisationsLeft: number;
}> {
  try {
    const post = await prisma.postHistory.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return { allowed: false, customisationsUsed: 0, customisationsLeft: 0 };
    }

    // Get user's subscription to check plan-based limit
    const subscription = await prisma.subscription.findUnique({
      where: { userId }
    });

    if (!subscription) {
      return { allowed: false, customisationsUsed: 0, customisationsLeft: 0 };
    }

    const plan = subscription.plan.toLowerCase() as Plan;
    const maxRegenerations = getRegenerationLimit(plan);
    const customisationsUsed = post.customisationsUsed || 0;
    const customisationsLeft = Math.max(0, maxRegenerations - customisationsUsed);

    return {
      allowed: customisationsLeft > 0,
      customisationsUsed,
      customisationsLeft,
    };
  } catch (error) {
    console.error('[checkCustomisationAllowed] Error:', error);
    return { allowed: false, customisationsUsed: 0, customisationsLeft: 0 };
  }
}

