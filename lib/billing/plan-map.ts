/**
 * Centralized Plan Mapping - Single Source of Truth
 * 
 * This module provides the canonical mapping between:
 * - Plan names (starter, pro, agency)
 * - Stripe Price IDs
 * - Usage limits
 * 
 * Use this everywhere instead of hardcoded values.
 */

// Stripe Price IDs from environment variables
export const PRICE = {
  starter: process.env.STRIPE_STARTER_PRICE_ID!,
  pro: process.env.STRIPE_PRO_PRICE_ID!,
  ultimate: process.env.STRIPE_ULTIMATE_PRICE_ID!,
  agency: process.env.STRIPE_AGENCY_PRICE_ID!,
} as const;

// Plan type - the canonical plan names used throughout the system
export type Plan = 'starter' | 'pro' | 'ultimate' | 'agency' | 'none';

/**
 * Normalize any plan input string to a canonical plan name
 * 
 * Examples:
 * - "SocialEcho_Starter" → "starter"
 * - "SocialEcho_Pro" → "pro"
 * - "Agency" → "agency"
 * - "unknown" → "pro" (default)
 */
export function normalizePlan(input: string | null | undefined): Plan {
  if (!input) return 'none';
  
  const s = input.toLowerCase();
  
  if (s.includes('starter')) return 'starter';
  if (s.includes('ultimate')) return 'ultimate';
  if (s.includes('agency') || s.includes('reseller')) return 'agency';
  if (s.includes('pro')) return 'pro';
  if (s === 'none') return 'none';
  
  // Default to pro for unknown inputs (safer than starter)
  return 'pro';
}

/**
 * Derive plan from Stripe Price ID
 * 
 * This is the authoritative way to determine a plan from Stripe data.
 */
export function planFromPriceId(priceId: string | null | undefined): Plan {
  if (!priceId) return 'none';
  
  if (priceId === PRICE.starter) return 'starter';
  if (priceId === PRICE.pro) return 'pro';
  if (priceId === PRICE.ultimate) return 'ultimate';
  if (priceId === PRICE.agency) return 'agency';
  
  // Unknown price ID - return 'none' and log for investigation
  console.warn('[plan-map] Unknown price ID:', priceId);
  return 'none';
}

/**
 * Get usage limit for a plan
 * 
 * Returns:
 * - Starter: 30 posts/month
 * - Pro: 100 posts/month
 * - Ultimate: null (unlimited)
 * - Agency: null (unlimited)
 * - None: 0 (no access)
 */
export function limitsFor(plan: Plan): number | null {
  switch (plan) {
    case 'starter':
      return 30;
    case 'pro':
      return 100;
    case 'ultimate':
      return null; // Unlimited monthly posts
    case 'agency':
      return null; // Unlimited monthly posts
    case 'none':
      return 0;
    default:
      return 0;
  }
}

/**
 * Get regeneration limit for a plan
 * 
 * Returns:
 * - Starter/Pro: 2 regenerations per post
 * - Ultimate: Infinity (unlimited regenerations)
 * - Agency: 5 regenerations per post
 * - None: 0 (no access)
 */
export function regenerationLimitsFor(plan: Plan): number {
  switch (plan) {
    case 'starter':
      return 2;
    case 'pro':
      return 2;
    case 'ultimate':
      return Number.POSITIVE_INFINITY; // Unlimited regenerations per post
    case 'agency':
      return 5;
    case 'none':
      return 0;
    default:
      return 0;
  }
}

/**
 * Check if a plan is considered "unlimited" (monthly posts)
 */
export function isUnlimited(plan: Plan): boolean {
  return plan === 'ultimate' || plan === 'agency';
}

/**
 * Get display name for a plan
 */
export function displayName(plan: Plan): string {
  switch (plan) {
    case 'starter':
      return 'Starter';
    case 'pro':
      return 'Pro';
    case 'ultimate':
      return 'Ultimate';
    case 'agency':
      return 'Agency';
    case 'none':
      return 'No Plan';
    default:
      return 'Unknown';
  }
}

/**
 * Get price ID for a plan
 */
export function priceIdFor(plan: Plan): string | null {
  switch (plan) {
    case 'starter':
      return PRICE.starter;
    case 'pro':
      return PRICE.pro;
    case 'ultimate':
      return PRICE.ultimate;
    case 'agency':
      return PRICE.agency;
    default:
      return null;
  }
}

/**
 * Validate that all required price IDs are configured
 * Call this at startup to fail fast if env vars are missing
 */
export function validatePriceIds(): void {
  const missing: string[] = [];
  
  if (!PRICE.starter) missing.push('STRIPE_STARTER_PRICE_ID');
  if (!PRICE.pro) missing.push('STRIPE_PRO_PRICE_ID');
  if (!PRICE.ultimate) missing.push('STRIPE_ULTIMATE_PRICE_ID');
  if (!PRICE.agency) missing.push('STRIPE_AGENCY_PRICE_ID');
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required Stripe price ID environment variables: ${missing.join(', ')}`
    );
  }
}

/**
 * Check if a plan is "Pro or higher" (for feature gating)
 * Pro, Ultimate, and Agency all have access to Pro-level features
 */
export function isProOrHigher(plan: Plan): boolean {
  return plan === 'pro' || plan === 'ultimate' || plan === 'agency';
}

