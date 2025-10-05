import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { 
  getAgencyForUser, 
  isAgencyAdmin,
  validateSubdomain,
  isSubdomainAvailable,
  createAuditLog
} from '@/lib/agency-helpers'

/**
 * PATCH /api/agency/branding
 * 
 * Update agency branding (logo, color, subdomain)
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user as any
    
    // Check role - only AGENCY_ADMIN can update branding
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
    const { logoUrl, color, subdomain } = body

    // Validate inputs
    const updates: any = {}

    if (logoUrl !== undefined) {
      // Validate URL format
      if (logoUrl && !logoUrl.startsWith('http')) {
        return NextResponse.json(
          { error: 'Logo URL must be a valid HTTP(S) URL' },
          { status: 400 }
        )
      }
      updates.logoUrl = logoUrl || null
    }

    if (color !== undefined) {
      // Validate hex color format
      if (color && !/^#[0-9A-F]{6}$/i.test(color)) {
        return NextResponse.json(
          { error: 'Color must be a valid hex color (e.g., #3B82F6)' },
          { status: 400 }
        )
      }
      updates.primaryColor = color || '#3B82F6'
    }

    if (subdomain !== undefined) {
      if (subdomain) {
        // Validate subdomain format
        if (!validateSubdomain(subdomain)) {
          return NextResponse.json(
            { error: 'Subdomain must be 3-63 characters, lowercase letters, numbers, and hyphens only' },
            { status: 400 }
          )
        }

        // Check availability
        const available = await isSubdomainAvailable(subdomain, agency.id)
        if (!available) {
          return NextResponse.json(
            { error: 'Subdomain is already taken' },
            { status: 409 }
          )
        }

        updates.subdomain = subdomain.toLowerCase()
      } else {
        updates.subdomain = null
      }
    }

    // Update agency
    const updatedAgency = await prisma.agency.update({
      where: { id: agency.id },
      data: updates
    })

    // Create audit log
    await createAuditLog({
      actorId: user.id,
      action: 'BRANDING_UPDATED',
      meta: {
        agencyId: agency.id,
        changes: updates
      }
    })

    return NextResponse.json({
      branding: {
        logoUrl: updatedAgency.logoUrl,
        color: updatedAgency.primaryColor,
        subdomain: updatedAgency.subdomain,
        customDomain: updatedAgency.customDomain
      },
      message: 'Branding updated successfully'
    })
  } catch (error: any) {
    console.error('[api/agency/branding] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
