/**
 * API endpoint for reapplying photo changes to existing backdrop
 * Adjusts rotation, size, and position without regenerating the backdrop
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import sharp from 'sharp'
import { removeBackground } from '@/lib/background-removal'
import { overlayLogo } from '@/lib/image-overlay'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      existingImageUrl,
      photoId,
      photoPosition,
      photoSize,
      photoRotation,
      removeBackgroundEnabled,
      applyLogo
    } = body

    console.log('[reapply-photo] Reapplying photo with new settings:', {
      photoPosition,
      photoSize,
      photoRotation,
      removeBackgroundEnabled,
      applyLogo
    })

    // Get the user profile to access the custom photo
    const profile = await prisma.profile.findUnique({
      where: { userEmail: session.user.email },
      select: { customPhotos: true, logoUrl: true, logoPosition: true, logoSize: true }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Find the selected photo
    const photo = profile.customPhotos.find((p: any) => p.id === photoId)
    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
    }

    // Extract base64 data from existing image (this is the backdrop)
    const backdropBase64 = existingImageUrl.replace(/^data:image\/\w+;base64,/, '')
    const backdropBuffer = Buffer.from(backdropBase64, 'base64')

    // Get backdrop dimensions
    const backdropMetadata = await sharp(backdropBuffer).metadata()
    const backdropWidth = backdropMetadata.width || 1024
    const backdropHeight = backdropMetadata.height || 1024

    // Process the custom photo
    let photoBuffer = Buffer.from(photo.imageData.replace(/^data:image\/\w+;base64,/, ''), 'base64')

    // Remove background if enabled
    if (removeBackgroundEnabled) {
      console.log('[reapply-photo] Removing background from photo')
      const processedPhoto = await removeBackground(photo.imageData)
      photoBuffer = Buffer.from(processedPhoto.replace(/^data:image\/\w+;base64,/, ''), 'base64')
    }

    // Rotate the photo
    if (photoRotation !== 0) {
      console.log(`[reapply-photo] Rotating photo by ${photoRotation}°`)
      photoBuffer = await sharp(photoBuffer)
        .rotate(photoRotation)
        .toBuffer()
    }

    // Calculate photo dimensions based on size setting
    const sizeMultipliers = {
      small: 0.25,
      medium: 0.40,
      large: 0.60
    }
    const multiplier = sizeMultipliers[photoSize as keyof typeof sizeMultipliers] || 0.40

    // Get photo metadata after rotation
    const photoMetadata = await sharp(photoBuffer).metadata()
    const photoWidth = photoMetadata.width || 512
    const photoHeight = photoMetadata.height || 512

    // Calculate target dimensions maintaining aspect ratio
    const targetHeight = Math.round(backdropHeight * multiplier)
    const aspectRatio = photoWidth / photoHeight
    const targetWidth = Math.round(targetHeight * aspectRatio)

    // Resize photo
    const resizedPhotoBuffer = await sharp(photoBuffer)
      .resize(targetWidth, targetHeight, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .toBuffer()

    // Calculate position
    let left = 0
    const top = Math.round((backdropHeight - targetHeight) / 2) // Always vertically centered

    switch (photoPosition) {
      case 'left':
        left = Math.round(backdropWidth * 0.1) // 10% from left
        break
      case 'center':
        left = Math.round((backdropWidth - targetWidth) / 2)
        break
      case 'right':
        left = Math.round(backdropWidth * 0.9 - targetWidth) // 10% from right
        break
    }

    // Composite photo onto backdrop
    console.log('[reapply-photo] Compositing photo onto backdrop')
    let finalBuffer = await sharp(backdropBuffer)
      .composite([
        {
          input: resizedPhotoBuffer,
          top,
          left,
          blend: 'over'
        }
      ])
      .png()
      .toBuffer()

    // Apply logo if enabled
    if (applyLogo && profile.logoUrl) {
      console.log('[reapply-photo] Applying logo overlay')
      const finalBase64 = `data:image/png;base64,${finalBuffer.toString('base64')}`
      const withLogo = await overlayLogo(finalBase64, {
        logoPath: profile.logoUrl,
        position: (profile.logoPosition as any) || 'bottom-right',
        size: (profile.logoSize as any) || 'medium'
      })
      finalBuffer = Buffer.from(withLogo.replace(/^data:image\/\w+;base64,/, ''), 'base64')
    }

    // Convert to base64
    const finalBase64 = `data:image/png;base64,${finalBuffer.toString('base64')}`

    console.log('[reapply-photo] Photo reapplied successfully')
    return NextResponse.json({
      success: true,
      imageUrl: finalBase64
    })

  } catch (error) {
    console.error('[reapply-photo] Error:', error)
    return NextResponse.json(
      { error: 'Failed to reapply photo changes' },
      { status: 500 }
    )
  }
}
