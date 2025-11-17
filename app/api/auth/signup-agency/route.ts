import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

/**
 * POST /api/auth/signup-agency
 * 
 * Create a new agency account with first client (8 free trial posts)
 * 
 * Body:
 * - agencyName: string
 * - email: string
 * - password: string
 * - firstClient: { companyName, website, businessSector }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agencyName, email, password, firstClient } = body

    // Validation
    if (!agencyName?.trim()) {
      return NextResponse.json({ error: 'Agency name is required' }, { status: 400 })
    }

    if (!email?.trim() || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    if (!password || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    if (!firstClient?.companyName?.trim()) {
      return NextResponse.json({ error: 'First client company name is required' }, { status: 400 })
    }

    if (!firstClient?.website?.trim()) {
      return NextResponse.json({ error: 'First client website is required' }, { status: 400 })
    }

    if (!firstClient?.businessSector?.trim()) {
      return NextResponse.json({ error: 'First client business sector is required' }, { status: 400 })
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    // Generate agency slug from name
    const slug = agencyName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50)

    // Check if slug already exists
    const existingAgency = await prisma.agency.findUnique({
      where: { slug }
    })

    if (existingAgency) {
      return NextResponse.json({ 
        error: 'An agency with a similar name already exists. Please choose a different name.' 
      }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate first client email (agency-owned account)
    const clientEmail = `${slug}-client1@socialecho.ai`

    // Create agency owner, agency, and first client in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create agency owner user
      const owner = await tx.user.create({
        data: {
          email: email.trim().toLowerCase(),
          name: agencyName.trim(),
          password: hashedPassword,
          role: 'AGENCY_ADMIN',
          emailVerified: new Date(), // Auto-verify agency accounts
        }
      })

      // 2. Create agency
      const agency = await tx.agency.create({
        data: {
          name: agencyName.trim(),
          slug,
          ownerId: owner.id,
          activeClientCount: 1, // First client
        }
      })

      // 3. Create first client user with immutable details
      const firstClientUser = await tx.user.create({
        data: {
          email: clientEmail,
          name: firstClient.companyName.trim(),
          password: hashedPassword, // Same password as agency owner for simplicity
          role: 'CUSTOMER',
          agencyId: agency.id,
          emailVerified: new Date(),
          // Immutable client details (anti-gaming)
          clientCompanyName: firstClient.companyName.trim(),
          clientWebsite: firstClient.website.trim(),
          clientBusinessSector: firstClient.businessSector.trim(),
        }
      })

      // 4. Create subscription for first client with 8 free trial posts
      await tx.subscription.create({
        data: {
          userId: firstClientUser.id,
          plan: 'starter', // Use starter plan for trial
          status: 'free_trial',
          usageLimit: 8, // 8 free trial posts
          usageCount: 0,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        }
      })

      // 5. Create empty profile for first client (will be filled during onboarding)
      await tx.profile.create({
        data: {
          userId: firstClientUser.id,
          business_name: firstClient.companyName.trim(),
          website: firstClient.website.trim(),
          industry: firstClient.businessSector.trim(),
          tone: 'professional',
          products_services: '',
          target_audience: '',
          usp: '',
          keywords: [],
          rotation: 'serious',
        }
      })

      return { owner, agency, firstClient: firstClientUser }
    })

    return NextResponse.json({
      success: true,
      message: 'Agency created successfully',
      agencyId: result.agency.id,
      ownerId: result.owner.id,
    }, { status: 201 })

  } catch (error: any) {
    console.error('Agency signup error:', error)
    return NextResponse.json({ 
      error: 'Failed to create agency account. Please try again.' 
    }, { status: 500 })
  }
}
