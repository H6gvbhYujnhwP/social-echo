import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { 
  getAgencyForUser, 
  isAgencyAdmin,
  createAuditLog
} from '@/lib/agency-helpers'
import { SignJWT } from 'jose'

/**
 * POST /api/agency/clients/[id]/impersonate
 * 
 * Start impersonation session (15 minutes)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user as any
    
    // Check role - AGENCY_ADMIN or MASTER_ADMIN
    if (!isAgencyAdmin(user.role)) {
      return NextResponse.json(
        { error: 'Access denied. Agency admin role required.' },
        { status: 403 }
      )
    }

    const clientId = params.id

    // If AGENCY_ADMIN, verify client belongs to their agency
    if (user.role === 'AGENCY_ADMIN') {
      const agency = await getAgencyForUser(user.id)
      
      if (!agency) {
        return NextResponse.json(
          { error: 'Agency not found' },
          { status: 404 }
        )
      }

      const client = await prisma.user.findFirst({
        where: {
          id: clientId,
          agencyId: agency.id,
          role: 'CUSTOMER'
        }
      })

      if (!client) {
        return NextResponse.json(
          { error: 'Client not found or does not belong to your agency' },
          { status: 404 }
        )
      }
    } else {
      // MASTER_ADMIN can impersonate anyone
      const client = await prisma.user.findUnique({
        where: { id: clientId }
      })

      if (!client) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }
    }

    // Create impersonation token (15 minutes)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)
    
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret')
    const token = await new SignJWT({
      impersonatorId: user.id,
      targetUserId: clientId,
      expiresAt: expiresAt.toISOString()
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('15m')
      .sign(secret)

    // Create audit log
    await createAuditLog({
      actorId: user.id,
      action: 'IMPERSONATE_START',
      targetId: clientId,
      meta: {
        expiresAt: expiresAt.toISOString()
      }
    })

    return NextResponse.json({
      token,
      expiresAt: expiresAt.toISOString(),
      message: 'Impersonation session started'
    })
  } catch (error: any) {
    console.error('[api/agency/clients/impersonate] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
