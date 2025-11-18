import { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { prisma } from './prisma'

export interface ImpersonationResult {
  isImpersonating: boolean
  effectiveUserId: string
  impersonatorId?: string
  expiresAt?: string
}

/**
 * Check if the current request is an impersonation session
 * and return the effective user ID to use for data access
 */
export async function getEffectiveUserId(
  request: NextRequest,
  currentUserId: string
): Promise<ImpersonationResult> {
  try {
    // Check for impersonation cookie
    const impersonatingCookie = request.cookies.get('impersonating')
    
    if (!impersonatingCookie) {
      return {
        isImpersonating: false,
        effectiveUserId: currentUserId
      }
    }

    // Verify the impersonation token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret')
    
    try {
      const { payload } = await jwtVerify(impersonatingCookie.value, secret)
      
      const impersonatorId = payload.impersonatorId as string
      const targetUserId = payload.targetUserId as string
      const expiresAt = payload.expiresAt as string

      // Check if token is expired
      if (new Date(expiresAt) < new Date()) {
        return {
          isImpersonating: false,
          effectiveUserId: currentUserId
        }
      }

      // Verify the impersonator matches the current session
      if (currentUserId !== impersonatorId) {
        return {
          isImpersonating: false,
          effectiveUserId: currentUserId
        }
      }

      // Verify the target user exists
      const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId }
      })

      if (!targetUser) {
        return {
          isImpersonating: false,
          effectiveUserId: currentUserId
        }
      }

      // Return the target user ID as the effective user
      return {
        isImpersonating: true,
        effectiveUserId: targetUserId,
        impersonatorId,
        expiresAt
      }
    } catch (error) {
      console.error('[impersonation] Token verification failed:', error)
      return {
        isImpersonating: false,
        effectiveUserId: currentUserId
      }
    }
  } catch (error) {
    console.error('[impersonation] Error checking impersonation:', error)
    return {
      isImpersonating: false,
      effectiveUserId: currentUserId
    }
  }
}

/**
 * Helper to get effective user ID from cookies (for API routes)
 * This is a convenience wrapper that extracts the user ID from the session
 */
export async function getEffectiveUserIdFromSession(
  request: NextRequest,
  session: any
): Promise<ImpersonationResult> {
  const currentUserId = session?.user?.id
  
  if (!currentUserId) {
    throw new Error('No user ID in session')
  }

  return getEffectiveUserId(request, currentUserId)
}
