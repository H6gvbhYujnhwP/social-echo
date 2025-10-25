import { prisma } from './prisma'

export interface UsageInfo {
  remaining: number | null  // null = unlimited
  isTrial: boolean
  plan: string
  status: string
  usageCount: number
  usageLimit: number | null  // null = unlimited
  unlimited: boolean  // true if plan has unlimited posts
}

/**
 * Get remaining posts for a user
 */
export async function getRemainingPosts(userId: string): Promise<UsageInfo> {
  const sub = await prisma.subscription.findUnique({
    where: { userId },
    select: { 
      status: true, 
      plan: true, 
      usageCount: true, 
      usageLimit: true 
    }
  })
  
  if (!sub) {
    return { 
      remaining: 0, 
      isTrial: false,
      plan: 'none',
      status: 'none',
      usageCount: 0,
      usageLimit: 0,
      unlimited: false
    }
  }

  // Check if plan has unlimited posts (usageLimit is null)
  const unlimited = sub.usageLimit === null
  
  // For unlimited plans, remaining is null
  // For limited plans, calculate remaining posts
  const remaining = unlimited 
    ? null 
    : Math.max(0, (sub.usageLimit ?? 0) - (sub.usageCount ?? 0))
  
  const isTrial = sub.status === 'trialing'
  
  return { 
    remaining, 
    isTrial,
    plan: sub.plan,
    status: sub.status,
    usageCount: sub.usageCount,
    usageLimit: sub.usageLimit,
    unlimited
  }
}

/**
 * Assert that a trial user has remaining posts
 * Throws TRIAL_EXHAUSTED error if trial user has no posts left
 */
export async function assertTrialAllowance(userId: string): Promise<void> {
  const { remaining, isTrial } = await getRemainingPosts(userId)
  
  if (isTrial && remaining !== null && remaining <= 0) {
    const err: any = new Error('TRIAL_EXHAUSTED')
    err.code = 402 // Payment Required
    err.statusCode = 402
    throw err
  }
}

/**
 * Check if user has any remaining posts (trial or active)
 * Returns true for unlimited plans
 */
export async function hasRemainingPosts(userId: string): Promise<boolean> {
  const { remaining, unlimited } = await getRemainingPosts(userId)
  // Unlimited plans always have remaining posts
  if (unlimited) return true
  // Limited plans check remaining count
  return remaining !== null && remaining > 0
}

