export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { jwtVerify } from 'jose'

/**
 * GET /api/impersonate/session
 * 
 * Get the impersonated user's session data
 */
export async function GET(request: NextRequest) {
  try {
    // Get the current session (agency admin)
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check for impersonation cookie
    const impersonatingCookie = request.cookies.get('impersonating')
    
    if (!impersonatingCookie) {
      return NextResponse.json({ 
        impersonating: false 
      })
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
        return NextResponse.json({ 
          error: 'Impersonation session expired',
          expired: true
        }, { status: 401 })
      }

      // Verify the impersonator matches the current session
      const currentUser = session.user as any
      if (currentUser.id !== impersonatorId) {
        return NextResponse.json({ 
          error: 'Invalid impersonation session' 
        }, { status: 403 })
      }

      // Fetch the target user's data
      const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId },
        include: {
          subscription: true,
          profile: true
        }
      })

      if (!targetUser) {
        return NextResponse.json({ 
          error: 'Target user not found' 
        }, { status: 404 })
      }

      // Return the target user's session data
      return NextResponse.json({
        impersonating: true,
        impersonator: {
          id: currentUser.id,
          email: currentUser.email,
          name: currentUser.name,
          role: currentUser.role
        },
        user: {
          id: targetUser.id,
          email: targetUser.email,
          name: targetUser.name,
          role: targetUser.role,
          plan: targetUser.subscription?.plan || 'starter',
          subscriptionStatus: targetUser.subscription?.status || null,
          cancelAtPeriodEnd: targetUser.subscription?.cancelAtPeriodEnd || false,
          currentPeriodEnd: targetUser.subscription?.currentPeriodEnd?.toISOString() || null
        },
        expiresAt
      })
    } catch (error) {
      console.error('[api/impersonate/session] Token verification failed:', error)
      return NextResponse.json({ 
        error: 'Invalid impersonation token',
        invalid: true
      }, { status: 401 })
    }
  } catch (error: any) {
    console.error('[api/impersonate/session] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/impersonate/session
 * 
 * End the impersonation session
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Clear the impersonation cookie
    const response = NextResponse.json({ 
      message: 'Impersonation session ended' 
    })
    
    response.cookies.set('impersonating', '', {
      path: '/',
      maxAge: 0
    })

    return response
  } catch (error: any) {
    console.error('[api/impersonate/session] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
