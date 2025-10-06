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
  keywords: z.array(z.string()).min(1, 'At least one keyword is required'),
  rotation: z.enum(['serious', 'quirky'])
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
    
    // Get profile
    const profile = await prisma.profile.findUnique({
      where: { userId }
    })
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      business_name: profile.business_name,
      website: profile.website,
      industry: profile.industry,
      tone: profile.tone,
      products_services: profile.products_services,
      target_audience: profile.target_audience,
      usp: profile.usp,
      keywords: profile.keywords,
      rotation: profile.rotation
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
    
    // Check for existing profile to enforce immutability
    const existingProfile = await prisma.profile.findUnique({
      where: { userId },
      select: { business_name: true, industry: true }
    })
    
    // If profile exists, prevent changes to business_name and industry
    let updateData: any = {
      website: validated.website,
      tone: validated.tone,
      products_services: validated.products_services,
      target_audience: validated.target_audience,
      usp: validated.usp,
      keywords: validated.keywords,
      rotation: validated.rotation
    }
    
    let createData: any = {
      userId,
      business_name: validated.business_name,
      website: validated.website,
      industry: validated.industry,
      tone: validated.tone,
      products_services: validated.products_services,
      target_audience: validated.target_audience,
      usp: validated.usp,
      keywords: validated.keywords,
      rotation: validated.rotation
    }
    
    // Check if user is trying to change immutable fields
    if (existingProfile) {
      const attemptedChanges: string[] = []
      
      if (validated.business_name !== existingProfile.business_name) {
        attemptedChanges.push('business_name')
      }
      if (validated.industry !== existingProfile.industry) {
        attemptedChanges.push('industry')
      }
      
      if (attemptedChanges.length > 0) {
        // Log the violation
        await prisma.auditLog.create({
          data: {
            actorId: userId,
            action: 'ACCOUNT_PROTECTED',
            meta: {
              message: 'User attempted to change locked business field',
              fields: attemptedChanges,
              ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
            }
          }
        }).catch(console.error)
        
        return NextResponse.json(
          { 
            error: 'Company name and industry are locked after initial setup to protect brand and billing integrity',
            lockedFields: attemptedChanges
          },
          { status: 403 }
        )
      }
      
      // Keep existing immutable values
      updateData.business_name = existingProfile.business_name
      updateData.industry = existingProfile.industry
    }
    
    // Upsert profile (create if doesn't exist, update if exists)
    const profile = await prisma.profile.upsert({
      where: { userId },
      update: updateData,
      create: createData
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
        rotation: profile.rotation
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
