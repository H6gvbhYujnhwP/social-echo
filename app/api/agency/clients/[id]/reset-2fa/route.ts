import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { 
  getAgencyForUser, 
  isAgencyAdmin,
  createAuditLog
} from '@/lib/agency-helpers'
import { sendEmail } from '@/lib/email/service'
import { twoFactorResetEmail } from '@/lib/email/templates'

/**
 * POST /api/agency/clients/[id]/reset-2fa
 * 
 * Clear client's 2FA configuration
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
    
    // Check role
    if (!isAgencyAdmin(user.role)) {
      return NextResponse.json(
        { error: 'Access denied. Agency admin role required.' },
        { status: 403 }
      )
    }

    // Get agency
    const agency = await getAgencyForUser(user.id)
    
    if (!agency) {
      return NextResponse.json(
        { error: 'Agency not found' },
        { status: 404 }
      )
    }

    const clientId = params.id

    // Get client and verify they belong to this agency
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

    // Reset 2FA
    await prisma.user.update({
      where: { id: clientId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null
      }
    })

    // Send notification email
    try {
      const emailTemplate = twoFactorResetEmail(client.name)
      await sendEmail({
        to: client.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
        agencyBranding: {
          name: agency.name,
          logoUrl: agency.logoUrl,
          primaryColor: agency.primaryColor
        }
      })
    } catch (error) {
      console.error('[agency/clients/reset-2fa] Failed to send email:', error)
      // Continue anyway
    }

    // Create audit log
    await createAuditLog({
      actorId: user.id,
      action: 'CLIENT_2FA_RESET',
      targetId: clientId,
      meta: {
        agencyId: agency.id,
        clientEmail: client.email
      }
    })

    return NextResponse.json({
      ok: true,
      message: '2FA reset. The user must set it up again.'
    })
  } catch (error: any) {
    console.error('[api/agency/clients/reset-2fa] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
