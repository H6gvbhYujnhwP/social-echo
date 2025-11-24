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
 * GET /api/agency/clients
 * 
 * Get list of clients for the agency
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user as any
    
    // Check role - only agency users can view clients
    if (!isAgencyAdmin(user.role) && user.role !== 'AGENCY_STAFF') {
      return NextResponse.json(
        { error: 'Access denied. Agency role required.' },
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

    // Get all clients for this agency (from the customers relation)
    const clients = agency.customers.map((c: any) => ({
      id: c.id,
      name: c.name,
      email: c.email
    }))

    return NextResponse.json({ clients })
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    )
  }
}

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
    const { email, name, companyName, website, businessSector } = body

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }
    
    if (!companyName || !companyName.trim()) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      )
    }
    
    if (!website || !website.trim()) {
      return NextResponse.json(
        { error: 'Website is required' },
        { status: 400 }
      )
    }
    
    if (!businessSector || !businessSector.trim()) {
      return NextResponse.json(
        { error: 'Business sector is required' },
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

    // Create client user with immutable details
    const client = await prisma.user.create({
      data: {
        email: cleanEmail,
        name: cleanName,
        password: hashedPassword,
        role: 'CUSTOMER',
        agencyId: agency.id,
        emailVerified: new Date(), // Auto-verify agency clients
        // Immutable client details (anti-gaming)
        clientCompanyName: companyName.trim(),
        clientWebsite: website.trim(),
        clientBusinessSector: businessSector.trim()
      }
    })

    // Create unlimited subscription for agency client
    // Set billing period to 1 year from now (agency handles billing, not per-client)
    const periodEnd = new Date()
    periodEnd.setFullYear(periodEnd.getFullYear() + 1)
    
    await prisma.subscription.create({
      data: {
        userId: client.id,
        plan: 'agency_client',
        status: 'active',
        usageCount: 0,
        usageLimit: null, // null = unlimited posts
        currentPeriodEnd: periodEnd,
        stripeCustomerId: null, // Agency clients don't have their own Stripe subscription
        stripeSubscriptionId: null
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
