/**
 * Role-Based Access Control (RBAC) Middleware
 * 
 * Protects admin routes and checks user permissions.
 */

import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { prisma } from './prisma'
import { UserRole } from '@prisma/client'

/**
 * Get current user with role
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return null
  }
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true
    }
  })
  
  return user
}

/**
 * Check if user has required role
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    CUSTOMER: 0,        // Agency client (lowest)
    USER: 1,            // Regular individual user
    AGENCY_STAFF: 2,    // Agency team member
    AGENCY_ADMIN: 3,    // Agency owner/admin
    ADMIN: 4,           // Legacy admin role
    MASTER_ADMIN: 5     // Full system access (highest)
  }
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

/**
 * Require authentication (any logged-in user)
 */
export async function requireAuth() {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }
  
  return user
}

/**
 * Require admin role (ADMIN or MASTER_ADMIN)
 */
export async function requireAdmin() {
  const user = await requireAuth()
  
  if (!hasRole(user.role, 'ADMIN')) {
    throw new Error('Forbidden: Admin access required')
  }
  
  return user
}

/**
 * Require master admin role (MASTER_ADMIN only)
 */
export async function requireMasterAdmin() {
  const user = await requireAuth()
  
  if (!hasRole(user.role, 'MASTER_ADMIN')) {
    throw new Error('Forbidden: Master Admin access required')
  }
  
  return user
}

/**
 * API response helpers
 */
export function unauthorized() {
  return Response.json(
    { error: 'Unauthorized', message: 'You must be logged in to access this resource' },
    { status: 401 }
  )
}

export function forbidden(message = 'You do not have permission to access this resource') {
  return Response.json(
    { error: 'Forbidden', message },
    { status: 403 }
  )
}

/**
 * Require master admin from request (for API routes)
 */
export async function requireMasterAdminFromReq(_req?: Request) {
  return requireMasterAdmin()
}

/**
 * Get admin actor or throw (with optional re-auth check)
 */
export async function getAdminActorOrThrow(opts?: { requireReAuth?: boolean }) {
  // Optional: implement re-auth check here if needed
  // For now, just require master admin
  return requireMasterAdmin()
}
