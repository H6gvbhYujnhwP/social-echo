/**
 * Centralized Usage Limits
 * Single source of truth for plan-based usage limits
 */

export type Plan = 'starter' | 'pro' | 'ultimate' | 'agency';

export interface PlanLimits {
  postsPerMonth: number | null;        // null = unlimited
  regenerationsPerPost: number | null; // null = unlimited
}

/**
 * Plan usage limits
 * - Starter: 30 posts/month, 2 regenerations per post
 * - Pro: 100 posts/month, 2 regenerations per post
 * - Ultimate: Unlimited posts/month, unlimited regenerations per post
 * - Agency: Unlimited
 */
export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  starter:  { postsPerMonth: 30,   regenerationsPerPost: 2 },
  pro:      { postsPerMonth: 100,  regenerationsPerPost: 2 },
  ultimate: { postsPerMonth: null, regenerationsPerPost: null }, // Unlimited everything
  agency:   { postsPerMonth: null, regenerationsPerPost: null },
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
 * Returns actual limit or Infinity for unlimited plans
 */
export function getRegenerationLimit(plan: Plan): number {
  const limit = PLAN_LIMITS[plan].regenerationsPerPost;
  return limit === null ? Infinity : limit;
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

