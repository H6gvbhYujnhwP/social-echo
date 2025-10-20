import { prisma } from './prisma'

export interface UsageInfo {
  remaining: number
  isTrial: boolean
  plan: string
  status: string
  usageCount: number
  usageLimit: number
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
      usageLimit: 0
    }
  }

  const remaining = Math.max(0, (sub.usageLimit ?? 0) - (sub.usageCount ?? 0))
  const isTrial = sub.status === 'trial'
  
  return { 
    remaining, 
    isTrial,
    plan: sub.plan,
    status: sub.status,
    usageCount: sub.usageCount,
    usageLimit: sub.usageLimit
  }
}

/**
 * Assert that a trial user has remaining posts
 * Throws TRIAL_EXHAUSTED error if trial user has no posts left
 */
export async function assertTrialAllowance(userId: string): Promise<void> {
  const { remaining, isTrial } = await getRemainingPosts(userId)
  
  if (isTrial && remaining <= 0) {
    const err: any = new Error('TRIAL_EXHAUSTED')
    err.code = 402 // Payment Required
    err.statusCode = 402
    throw err
  }
}

/**
 * Check if user has any remaining posts (trial or active)
 */
export async function hasRemainingPosts(userId: string): Promise<boolean> {
  const { remaining } = await getRemainingPosts(userId)
  return remaining > 0
}

