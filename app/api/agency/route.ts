import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAgencyForUser, isAgencyStaff } from '@/lib/agency-helpers'

/**
 * GET /api/agency
 * 
 * Returns current user's agency summary
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user as any
    
    // Check role
    if (!isAgencyStaff(user.role)) {
      return NextResponse.json(
        { error: 'Access denied. Agency role required.' },
        { status: 403 }
      )
    }

    // Get agency data
    const agency = await getAgencyForUser(user.id)
    
    if (!agency) {
      return NextResponse.json(
        { error: 'Agency not found' },
        { status: 404 }
      )
    }

    // Format response
    const response = {
      id: agency.id,
      name: agency.name,
      slug: agency.slug,
      logoUrl: agency.logoUrl,
      primaryColor: agency.primaryColor || '#3B82F6',
      subdomain: agency.subdomain,
      customDomain: agency.customDomain,
      activeClientCount: agency.activeClientCount,
      stripeCustomerId: agency.stripeCustomerId,
      stripeSubscriptionId: agency.stripeSubscriptionId,
      clients: agency.customers.map(c => ({
        id: c.id,
        email: c.email,
        name: c.name,
        status: c.isSuspended ? 'paused' : 'active',
        lastLogin: c.lastLogin?.toISOString() || null,
        createdAt: c.createdAt.toISOString()
      }))
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('[api/agency] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
