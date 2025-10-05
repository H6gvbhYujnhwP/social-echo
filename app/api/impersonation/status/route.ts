// GET /api/impersonation/status
// Check if current session is an impersonation session

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ isImpersonating: false })
    }

    // Check if this is an impersonation session
    // The impersonation data is stored in the session by the impersonate endpoint
    const isImpersonating = !!(session as any).impersonation

    if (!isImpersonating) {
      return NextResponse.json({ isImpersonating: false })
    }

    const impersonationData = (session as any).impersonation

    return NextResponse.json({
      isImpersonating: true,
      impersonatorName: impersonationData.impersonatorName,
      targetUserName: session.user.name || session.user.email,
      expiresAt: impersonationData.expiresAt
    })
  } catch (error) {
    console.error('[impersonation-status] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
