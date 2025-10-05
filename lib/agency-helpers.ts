/**
 * Agency Helper Functions
 * 
 * Utilities for agency management, RBAC, and Stripe integration
 */

import { prisma } from './prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-09-30.clover'
})

/**
 * Check if user has agency admin role
 */
export function isAgencyAdmin(role: string): boolean {
  return role === 'AGENCY_ADMIN' || role === 'MASTER_ADMIN'
}

/**
 * Check if user has agency staff role (can view but not modify billing)
 */
export function isAgencyStaff(role: string): boolean {
  return role === 'AGENCY_STAFF' || role === 'AGENCY_ADMIN' || role === 'MASTER_ADMIN'
}

/**
 * Get agency for a user
 */
export async function getAgencyForUser(userId: string) {
  // Check if user owns an agency
  const ownedAgency = await prisma.agency.findFirst({
    where: { ownerId: userId },
    include: {
      customers: {
        where: {
          isSuspended: false
        },
        select: {
          id: true,
          email: true,
          name: true,
          lastLogin: true,
          createdAt: true,
          isSuspended: true
        }
      }
    }
  })

  if (ownedAgency) {
    return ownedAgency
  }

  // Check if user is staff of an agency (future enhancement)
  // For now, only owners can access agency dashboard
  return null
}

/**
 * Update Stripe subscription quantity
 */
export async function updateStripeQuantity(
  stripeSubscriptionId: string,
  newQuantity: number
): Promise<void> {
  if (!stripeSubscriptionId) {
    console.warn('[agency] No Stripe subscription ID, skipping quantity update')
    return
  }

  try {
    const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId)
    
    // Find the subscription item (should be only one for agency plan)
    const item = subscription.items.data[0]
    
    if (!item) {
      throw new Error('No subscription item found')
    }

    // Update quantity
    await stripe.subscriptionItems.update(item.id, {
      quantity: Math.max(0, newQuantity) // Ensure non-negative
    })

    console.log(`[agency] Updated Stripe quantity to ${newQuantity}`)
  } catch (error) {
    console.error('[agency] Failed to update Stripe quantity:', error)
    throw new Error('Failed to update billing quantity')
  }
}

/**
 * Create audit log entry
 */
export async function createAuditLog(data: {
  actorId: string
  action: string
  targetId?: string
  meta?: any
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: data.actorId,
        action: data.action,
        targetId: data.targetId,
        meta: data.meta || {}
      }
    })
  } catch (error) {
    console.error('[audit] Failed to create audit log:', error)
    // Don't throw - audit logging should not break the main operation
  }
}

/**
 * Calculate unit price for agency plan
 */
export function getAgencyUnitPrice(): number {
  return 49 // £49 per client per month
}

/**
 * Validate subdomain format
 */
export function validateSubdomain(subdomain: string): boolean {
  // Only lowercase letters, numbers, and hyphens
  // Must start with letter or number
  // Must be 3-63 characters
  const pattern = /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/
  return pattern.test(subdomain)
}

/**
 * Check if subdomain is available
 */
export async function isSubdomainAvailable(subdomain: string, excludeAgencyId?: string): Promise<boolean> {
  const existing = await prisma.agency.findFirst({
    where: {
      subdomain,
      id: excludeAgencyId ? { not: excludeAgencyId } : undefined
    }
  })
  
  return !existing
}

/**
 * Resolve agency by subdomain or brand parameter
 */
export async function resolveAgency(subdomainOrSlug: string) {
  // Try subdomain first
  let agency = await prisma.agency.findFirst({
    where: { subdomain: subdomainOrSlug }
  })

  if (!agency) {
    // Try slug
    agency = await prisma.agency.findFirst({
      where: { slug: subdomainOrSlug }
    })
  }

  return agency
}
