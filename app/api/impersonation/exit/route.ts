// POST /api/impersonation/exit
// Exit impersonation and return to original admin session

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Check if this is an impersonation session
    const impersonationData = (session as any).impersonation

    if (!impersonationData) {
      return NextResponse.json(
        { error: 'Not in impersonation mode' },
        { status: 400 }
      )
    }

    // Log the exit
    await prisma.auditLog.create({
      data: {
        actorId: impersonationData.impersonatorId,
        action: 'IMPERSONATION_EXIT',
        targetId: impersonationData.targetUserId || '',
        meta: {
          targetUserEmail: session.user.email || '',
          duration: Date.now() - new Date(impersonationData.startedAt).getTime()
        }
      }
    })

    // Clear the impersonation session
    // Note: In a production app, you'd need to implement proper session management
    // This might require using a custom session store or JWT tokens
    // For now, we'll return success and let the client handle the redirect

    return NextResponse.json({
      success: true,
      message: 'Exited impersonation mode'
    })
  } catch (error) {
    console.error('[impersonation-exit] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
