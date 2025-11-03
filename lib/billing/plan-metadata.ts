/**
 * Plan metadata for UI display
 * Centralized source of truth for plan information in the Account page
 */

export interface PlanMetadata {
  id: 'starter' | 'pro' | 'ultimate'
  name: string
  price: string
  priceValue: number
  features: string
  postsLimit: number | null // null = unlimited
}

export const PLAN_METADATA: Record<string, PlanMetadata> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: '£29.99/month',
    priceValue: 29.99,
    features: '100 posts per month',
    postsLimit: 8
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: '£49.99/month',
    priceValue: 49.99,
    features: '100 posts per month',
    postsLimit: 30
  },
  ultimate: {
    id: 'ultimate',
    name: 'Ultimate',
    price: '£179/month',
    priceValue: 179,
    features: 'Unlimited posts',
    postsLimit: null // unlimited
  }
}

export const getPlanMetadata = (planId: string): PlanMetadata => {
  const normalized = planId.toLowerCase()
  return PLAN_METADATA[normalized] || PLAN_METADATA.starter
}

export const isUnlimitedPlan = (planId: string): boolean => {
  const plan = getPlanMetadata(planId)
  return plan.postsLimit === null
}

