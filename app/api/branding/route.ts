// GET /api/branding?identifier=acme-agency
// Returns agency branding for white-label login

import { NextRequest, NextResponse } from 'next/server'
import { getAgencyBrandingByIdentifier } from '@/lib/agency-branding-context'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const identifier = searchParams.get('identifier')

    if (!identifier) {
      return NextResponse.json(
        { error: 'Missing identifier parameter' },
        { status: 400 }
      )
    }

    const branding = await getAgencyBrandingByIdentifier(identifier)

    if (!branding) {
      return NextResponse.json(
        { error: 'Agency not found' },
        { status: 404 }
      )
    }

    // Return only public branding info (no sensitive data)
    return NextResponse.json({
      name: branding.name,
      logoUrl: branding.logoUrl,
      primaryColor: branding.primaryColor,
      subdomain: branding.subdomain
    })
  } catch (error) {
    console.error('[branding] Error fetching branding:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
