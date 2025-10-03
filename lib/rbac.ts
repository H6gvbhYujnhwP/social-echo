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
    USER: 1,
    ADMIN: 2,
    MASTER_ADMIN: 3
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
