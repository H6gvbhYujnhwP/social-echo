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
import { passwordResetEmail } from '@/lib/email/templates'
import crypto from 'crypto'

/**
 * POST /api/agency/clients/[id]/reset-password
 * 
 * Trigger password reset for a client
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

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 3600000) // 1 hour

    // Store reset token
    await prisma.passwordResetToken.create({
      data: {
        userId: clientId,
        token,
        expiresAt
      }
    })

    // Send reset email
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`
    
    try {
      const emailTemplate = passwordResetEmail(client.name, resetUrl)
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
      console.error('[agency/clients/reset-password] Failed to send email:', error)
      return NextResponse.json(
        { error: 'Failed to send reset email' },
        { status: 500 }
      )
    }

    // Create audit log
    await createAuditLog({
      actorId: user.id,
      action: 'CLIENT_PASSWORD_RESET',
      targetId: clientId,
      meta: {
        agencyId: agency.id,
        clientEmail: client.email
      }
    })

    return NextResponse.json({
      ok: true,
      message: 'Password reset email sent.'
    })
  } catch (error: any) {
    console.error('[api/agency/clients/reset-password] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
