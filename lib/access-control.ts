/**
 * Centralized Access Control System
 * 
 * Enforces trial duration, suspension, and usage limits across all protected endpoints.
 * Automatically suspends expired trials and blocks access for suspended accounts.
 */

import { prisma } from '@/lib/prisma'
import { isUnlimitedMonthly, formatLimit } from '@/lib/billing/limits'

export type AccessCheckResult = {
  allowed: boolean
  reason?: string
  subscription?: {
    status: string
    plan: string
    usageCount: number
    usageLimit: number | null
    trialEnd?: Date | null
    currentPeriodEnd: Date
  }
}

/**
 * Check if user has access to protected features
 * 
 * This function:
 * 1. Checks if subscription exists
 * 2. Auto-suspends expired trials
 * 3. Blocks suspended accounts
 * 4. Validates subscription status
 * 5. Returns subscription data for further checks
 * 
 * @param userId - The user ID to check
 * @returns AccessCheckResult with allowed status and reason if denied
 */
export async function checkUserAccess(userId: string): Promise<AccessCheckResult> {
  // Get subscription
  const subscription = await prisma.subscription.findUnique({
    where: { userId }
  })

  if (!subscription) {
    return {
      allowed: false,
      reason: 'Subscription required. Please subscribe to a plan.'
    }
  }
  
  // Check email verification for free trial users
  if (subscription.status === 'free_trial') {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { emailVerified: true }
    });
    
    if (!user?.emailVerified) {
      return {
        allowed: false,
        reason: 'Please verify your email address to start using your free trial. Check your inbox for the verification link.',
        subscription: {
          status: subscription.status,
          plan: subscription.plan,
          usageCount: subscription.usageCount,
          usageLimit: subscription.usageLimit,
          trialEnd: subscription.trialEnd,
          currentPeriodEnd: subscription.currentPeriodEnd
        }
      }
    }
  }

  // Check if trial has expired and auto-suspend
  if (subscription.status === 'trial' && subscription.trialEnd) {
    const now = new Date()
    if (now > subscription.trialEnd) {
      // Auto-suspend expired trial
      await prisma.subscription.update({
        where: { userId },
        data: { status: 'suspended' }
      })
      
      return {
        allowed: false,
        reason: 'Your trial has expired. Please subscribe to continue using SocialEcho.',
        subscription: {
          status: 'suspended',
          plan: subscription.plan,
          usageCount: subscription.usageCount,
          usageLimit: subscription.usageLimit,
          trialEnd: subscription.trialEnd,
          currentPeriodEnd: subscription.currentPeriodEnd
        }
      }
    }
  }

  // Block suspended accounts
  if (subscription.status === 'suspended') {
    return {
      allowed: false,
      reason: 'Your account has been suspended. Please contact support or update your subscription.',
      subscription: {
        status: subscription.status,
        plan: subscription.plan,
        usageCount: subscription.usageCount,
        usageLimit: subscription.usageLimit,
        trialEnd: subscription.trialEnd,
        currentPeriodEnd: subscription.currentPeriodEnd
      }
    }
  }

  // Block canceled accounts
  if (subscription.status === 'canceled') {
    return {
      allowed: false,
      reason: 'Your subscription has been canceled. Please reactivate to continue.',
      subscription: {
        status: subscription.status,
        plan: subscription.plan,
        usageCount: subscription.usageCount,
        usageLimit: subscription.usageLimit,
        trialEnd: subscription.trialEnd,
        currentPeriodEnd: subscription.currentPeriodEnd
      }
    }
  }

  // Allow access for valid statuses: active, trial (not expired), trialing, free_trial, past_due
  const validStatuses = ['active', 'trial', 'trialing', 'free_trial', 'past_due']
  if (!validStatuses.includes(subscription.status)) {
    return {
      allowed: false,
      reason: `Subscription status '${subscription.status}' is not valid. Please contact support.`,
      subscription: {
        status: subscription.status,
        plan: subscription.plan,
        usageCount: subscription.usageCount,
        usageLimit: subscription.usageLimit,
        trialEnd: subscription.trialEnd,
        currentPeriodEnd: subscription.currentPeriodEnd
      }
    }
  }

  // Access granted
  return {
    allowed: true,
    subscription: {
      status: subscription.status,
      plan: subscription.plan,
      usageCount: subscription.usageCount,
      usageLimit: subscription.usageLimit,
      trialEnd: subscription.trialEnd,
      currentPeriodEnd: subscription.currentPeriodEnd
    }
  }
}

/**
 * Check if user can generate a new post (usage limit check)
 * 
 * @param userId - The user ID to check
 * @returns AccessCheckResult with allowed status and usage details
 */
export async function checkPostGenerationAccess(userId: string): Promise<AccessCheckResult> {
  // First check general access
  const accessCheck = await checkUserAccess(userId)
  
  if (!accessCheck.allowed) {
    return accessCheck
  }

  const subscription = accessCheck.subscription!

  // Check usage limit (unlimited plans bypass this check)
  if (!isUnlimitedMonthly(subscription.usageLimit) && subscription.usageCount >= subscription.usageLimit) {
    return {
      allowed: false,
      reason: `You've used all ${formatLimit(subscription.usageLimit)} posts for this period. Upgrade your plan for more posts.`,
      subscription
    }
  }

  // Access granted
  return {
    allowed: true,
    subscription
  }
}

/**
 * Increment usage count after successful post generation
 * 
 * @param userId - The user ID
 */
export async function incrementUsageCount(userId: string): Promise<void> {
  await prisma.subscription.update({
    where: { userId },
    data: {
      usageCount: {
        increment: 1
      }
    }
  })
}

/**
 * Get user subscription status for display purposes
 * 
 * @param userId - The user ID
 * @returns Subscription data or null
 */
export async function getUserSubscriptionStatus(userId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId }
  })

  if (!subscription) {
    return null
  }

  // Check if trial expired
  let isTrialExpired = false
  if (subscription.status === 'trial' && subscription.trialEnd) {
    isTrialExpired = new Date() > subscription.trialEnd
  }

  return {
    status: subscription.status,
    plan: subscription.plan,
    usageCount: subscription.usageCount,
    usageLimit: subscription.usageLimit,
    trialEnd: subscription.trialEnd,
    isTrialExpired,
    currentPeriodStart: subscription.currentPeriodStart,
    currentPeriodEnd: subscription.currentPeriodEnd,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd
  }
}

