import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { overlayLogo } from '@/lib/image-overlay'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import fetch from 'node-fetch'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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
    const { imageUrl, logoPosition, logoSize, logoEnabled } = body
    
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      )
    }
    
    console.log('[reapply-logo] Request:', { imageUrl, logoPosition, logoSize, logoEnabled })
    
    // Get user profile for logo
    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: { logoUrl: true }
    })
    
    if (!profile?.logoUrl) {
      return NextResponse.json(
        { error: 'No logo uploaded. Please upload a logo first.' },
        { status: 400 }
      )
    }
    
    // If logo is disabled, return original image
    if (!logoEnabled) {
      return NextResponse.json({
        success: true,
        imageUrl: imageUrl,
        message: 'Logo removed'
      })
    }
    
    // Handle different image URL formats
    let imageBase64: string
    
    if (imageUrl.startsWith('data:image/')) {
      // Already a base64 data URI - use directly
      imageBase64 = imageUrl
      console.log('[reapply-logo] Using base64 data URI directly')
    } else if (imageUrl.startsWith('/')) {
      // Local file - read from public directory
      const { readFile } = await import('fs/promises')
      const publicPath = join(process.cwd(), 'public', imageUrl)
      const imageBuffer = await readFile(publicPath)
      imageBase64 = `data:image/png;base64,${imageBuffer.toString('base64')}`
      console.log('[reapply-logo] Loaded local file, size:', imageBuffer.length)
    } else {
      // External URL - download it
      const imageResponse = await fetch(imageUrl)
      if (!imageResponse.ok) {
        throw new Error('Failed to download image')
      }
      const arrayBuffer = await imageResponse.arrayBuffer()
      const imageBuffer = Buffer.from(arrayBuffer)
      imageBase64 = `data:image/png;base64,${imageBuffer.toString('base64')}`
      console.log('[reapply-logo] Downloaded external image, size:', imageBuffer.length)
    }
    
    // Apply logo overlay with specified settings
    const processedBase64 = await overlayLogo(imageBase64, {
      logoPath: profile.logoUrl,
      position: (logoPosition || 'bottom-right') as any,
      size: (logoSize || 'medium') as any
    })
    
    console.log('[reapply-logo] Logo applied successfully')
    
    // Convert base64 back to buffer for saving
    const base64Data = processedBase64.replace(/^data:image\/\w+;base64,/, '')
    const processedBuffer = Buffer.from(base64Data, 'base64')
    
    // Save the new image
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'images')
    await mkdir(uploadsDir, { recursive: true })
    
    const timestamp = Date.now()
    const filename = `reapplied-${userId}-${timestamp}.png`
    const filepath = join(uploadsDir, filename)
    
    await writeFile(filepath, processedBuffer)
    
    const newImageUrl = `/uploads/images/${filename}`
    
    console.log('[reapply-logo] Saved new image:', newImageUrl)
    
    return NextResponse.json({
      success: true,
      imageUrl: newImageUrl,
      message: 'Logo applied successfully'
    })
    
  } catch (error: any) {
    console.error('[reapply-logo] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to reapply logo' },
      { status: 500 }
    )
  }
}
