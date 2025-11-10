import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAPICreditsStatus } from '@/lib/api-credits-service'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/api-credits
 * Check remaining API credits for OpenAI and Replicate
 * Master admin only
 */
export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is master admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    if (user?.role !== 'MASTER_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Master admin access required' },
        { status: 403 }
      )
    }

    // Get API credits status
    const creditsStatus = await getAPICreditsStatus()

    return NextResponse.json(creditsStatus)
  } catch (error: any) {
    console.error('[api-credits] Error:', error)
    return NextResponse.json(
      { error: 'Failed to check API credits', details: error.message },
      { status: 500 }
    )
  }
}
