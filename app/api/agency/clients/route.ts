export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { 
  getAgencyForUser, 
  isAgencyAdmin, 
  updateStripeQuantity,
  createAuditLog,
  getAgencyUnitPrice
} from '@/lib/agency-helpers'
import { sendEmail } from '@/lib/email/service'
import { welcomeEmail } from '@/lib/email/templates'
import bcrypt from 'bcryptjs'

/**
 * POST /api/agency/clients
 * 
 * Add a new client to the agency
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user as any
    
    // Check role - only AGENCY_ADMIN can add clients
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

    // Parse request body
    const body = await request.json()
    const { email, name } = body

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const cleanEmail = email.trim().toLowerCase()
    const cleanName = name?.trim() || cleanEmail.split('@')[0]

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 }
      )
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-12)
    const hashedPassword = await bcrypt.hash(tempPassword, 10)

    // Create client user
    const client = await prisma.user.create({
      data: {
        email: cleanEmail,
        name: cleanName,
        password: hashedPassword,
        role: 'CUSTOMER',
        agencyId: agency.id
      }
    })

    // Update agency client count
    const newClientCount = agency.activeClientCount + 1
    await prisma.agency.update({
      where: { id: agency.id },
      data: { activeClientCount: newClientCount }
    })

    // Update Stripe subscription quantity
    if (agency.stripeSubscriptionId) {
      try {
        await updateStripeQuantity(agency.stripeSubscriptionId, newClientCount)
      } catch (error) {
        console.error('[agency/clients] Failed to update Stripe quantity:', error)
        // Continue anyway - we can fix billing manually if needed
      }
    }

    // Create audit log
    await createAuditLog({
      actorId: user.id,
      action: 'CLIENT_ADDED',
      targetId: client.id,
      meta: {
        agencyId: agency.id,
        clientEmail: cleanEmail,
        newClientCount
      }
    })

    // Send welcome email with temporary password
    try {
      const emailTemplate = welcomeEmail(cleanName, cleanEmail, tempPassword)
      await sendEmail({
        to: cleanEmail,
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
      console.error('[agency/clients] Failed to send welcome email:', error)
      // Continue anyway - admin can resend password reset
    }

    // Calculate new monthly total
    const unitPrice = getAgencyUnitPrice()
    const newMonthlyTotal = newClientCount * unitPrice

    return NextResponse.json({
      clientId: client.id,
      newClientCount,
      newMonthlyTotal,
      message: 'Client added successfully'
    })
  } catch (error: any) {
    console.error('[api/agency/clients] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
