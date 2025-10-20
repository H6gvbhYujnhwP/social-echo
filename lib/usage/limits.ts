/**
 * Centralized Usage Limits
 * Single source of truth for plan-based usage limits
 */

export type Plan = 'starter' | 'pro' | 'agency';

export interface PlanLimits {
  postsPerMonth: number | null;        // null = unlimited
  regenerationsPerPost: number | null; // null = unlimited
}

/**
 * Plan usage limits
 * - Starter: 8 posts/month, 2 regenerations per post
 * - Pro: 30 posts/month, 2 regenerations per post (NEW)
 * - Agency: Unlimited
 */
export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  starter: { postsPerMonth: 8,    regenerationsPerPost: 2 },
  pro:     { postsPerMonth: 30,   regenerationsPerPost: 2 }, // NEW: Pro capped at 30/month
  agency:  { postsPerMonth: null, regenerationsPerPost: null },
};

/**
 * Sentinel value for unlimited plans in database
 * Used to avoid null math in SQL paths
 */
export const UNLIMITED_SENTINEL = 1_000_000;

/**
 * Get usage limit for a plan
 * Returns actual limit or sentinel for unlimited plans
 */
export function getUsageLimit(plan: Plan): number {
  const limit = PLAN_LIMITS[plan].postsPerMonth;
  return limit === null ? UNLIMITED_SENTINEL : limit;
}

/**
 * Get regeneration limit for a plan
 * Returns actual limit or sentinel for unlimited plans
 */
export function getRegenerationLimit(plan: Plan): number {
  const limit = PLAN_LIMITS[plan].regenerationsPerPost;
  return limit === null ? UNLIMITED_SENTINEL : limit;
}

/**
 * Check if a plan has unlimited posts
 */
export function isUnlimitedPlan(plan: Plan): boolean {
  return PLAN_LIMITS[plan].postsPerMonth === null;
}

/**
 * Check if a plan has unlimited regenerations
 */
export function hasUnlimitedRegenerations(plan: Plan): boolean {
  return PLAN_LIMITS[plan].regenerationsPerPost === null;
}

