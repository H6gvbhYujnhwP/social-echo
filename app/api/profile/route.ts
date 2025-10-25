import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Force Node.js runtime
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ProfileSchema = z.object({
  business_name: z.string().min(1, 'Business name is required'),
  website: z.string().url('Must be a valid URL').or(z.literal('')),
  industry: z.string().min(1, 'Industry is required'),
  tone: z.enum(['professional', 'casual', 'funny', 'bold']),
  products_services: z.string().min(1, 'Products/services are required'),
  target_audience: z.string().min(1, 'Target audience is required'),
  usp: z.string().min(1, 'USP is required'),
  keywords: z.array(z.string()), // Allow empty array - keywords are optional
  rotation: z.enum(['serious', 'quirky']),
  country: z.string().nullable().optional().or(z.literal('')) // v8.8: optional country for localized content
})

// GET profile
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const userId = (session.user as any).id
    
    // Get profile with fresh data (no caching)
    const profile = await prisma.profile.findUnique({
      where: { userId }
    })
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }
    
    // Return with cache-control headers to prevent caching
    return NextResponse.json({
      business_name: profile.business_name,
      website: profile.website,
      industry: profile.industry,
      tone: profile.tone,
      products_services: profile.products_services,
      target_audience: profile.target_audience,
      usp: profile.usp,
      keywords: profile.keywords,
      rotation: profile.rotation,
      country: profile.country || null  // v8.8: country for localized content
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
    
  } catch (error: any) {
    console.error('[profile-get] Error:', error)
    return NextResponse.json(
      { error: 'Failed to get profile' },
      { status: 500 }
    )
  }
}

// POST/PUT profile (create or update)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const userId = (session.user as any).id
    const body = await request.json()
    const validated = ProfileSchema.parse(body)
    
    // Prepare data for upsert - allow all fields to be updated
    const profileData = {
      userId,
      business_name: validated.business_name,
      website: validated.website,
      industry: validated.industry,
      tone: validated.tone,
      products_services: validated.products_services,
      target_audience: validated.target_audience,
      usp: validated.usp,
      keywords: validated.keywords,
      rotation: validated.rotation,
      country: validated.country && validated.country !== '' ? validated.country : null  // v8.8: optional country
    }
    
    // Upsert profile (create if doesn't exist, update if exists)
    const profile = await prisma.profile.upsert({
      where: { userId },
      update: {
        business_name: profileData.business_name,
        website: profileData.website,
        industry: profileData.industry,
        tone: profileData.tone,
        products_services: profileData.products_services,
        target_audience: profileData.target_audience,
        usp: profileData.usp,
        keywords: profileData.keywords,
        rotation: profileData.rotation,
        country: profileData.country  // v8.8: optional country
      },
      create: profileData
    })
    
    console.log('[profile-post] Profile saved:', profile.id)
    
    return NextResponse.json({
      success: true,
      profile: {
        business_name: profile.business_name,
        website: profile.website,
        industry: profile.industry,
        tone: profile.tone,
        products_services: profile.products_services,
        target_audience: profile.target_audience,
        usp: profile.usp,
        keywords: profile.keywords,
        rotation: profile.rotation,
        country: profile.country || null  // v8.8: optional country
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
    
  } catch (error: any) {
    console.error('[profile-post] Error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to save profile' },
      { status: 500 }
    )
  }
}
