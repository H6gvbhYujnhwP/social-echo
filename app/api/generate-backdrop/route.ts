import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'
import { compositeImages, generateBackdropPrompt, PhotoPosition, PhotoSize, PhotoPlacement } from '@/lib/image-compositing'
import { overlayLogo } from '@/lib/image-overlay'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await req.json()
    const {
      photoId,
      backdropDescription,
      photoPosition = 'center',
      photoSize = 'medium',
      photoPlacement = 'foreground',
      includeText = false,
      textContent = '',
      includeLogo = false
    } = body

    if (!photoId || !backdropDescription) {
      return NextResponse.json(
        { error: 'photoId and backdropDescription are required' },
        { status: 400 }
      )
    }

    // Get the custom photo
    const customPhotos = (user.profile?.customPhotos as any[]) || []
    const selectedPhoto = customPhotos.find((photo: any) => photo.id === photoId)

    if (!selectedPhoto) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
    }

    // Generate backdrop prompt
    const backdropPrompt = generateBackdropPrompt(backdropDescription, photoPosition as PhotoPosition)

    console.log('[generate-backdrop] Generating backdrop with DALL-E 3:', backdropPrompt)

    // Generate backdrop with DALL-E 3
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: backdropPrompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard'
    })

    const backdropUrl = response.data[0]?.url

    if (!backdropUrl) {
      throw new Error('No backdrop image generated')
    }

    // Download backdrop image
    const backdropResponse = await fetch(backdropUrl)
    const backdropBuffer = await backdropResponse.arrayBuffer()
    const backdropBase64 = Buffer.from(backdropBuffer).toString('base64')
    const backdropDataUri = `data:image/png;base64,${backdropBase64}`

    console.log('[generate-backdrop] Compositing photo onto backdrop')

    // Composite photo onto backdrop
    let compositeImage = await compositeImages({
      backdropBase64: backdropDataUri,
      photoBase64: selectedPhoto.base64,
      position: photoPosition as PhotoPosition,
      size: photoSize as PhotoSize,
      placement: photoPlacement as PhotoPlacement
    })

    // Add text overlay if requested
    if (includeText && textContent) {
      // TODO: Implement text overlay using Sharp
      console.log('[generate-backdrop] Text overlay requested:', textContent)
      // For now, skip text overlay - can be added later
    }

    // Add logo overlay if requested
    if (includeLogo && user.profile?.logoUrl) {
      console.log('[generate-backdrop] Adding logo overlay')
      compositeImage = await overlayLogo(
        compositeImage,
        {
          logoPath: user.profile.logoUrl,
          position: (user.profile.logoPosition as any) || 'bottom-right',
          size: (user.profile.logoSize as any) || 'medium'
        }
      )
    }

    return NextResponse.json({
      imageUrl: compositeImage,
      backdropUrl: backdropDataUri,
      photoUrl: selectedPhoto.base64
    })

  } catch (error: any) {
    console.error('[generate-backdrop] Error:', error)

    // Handle OpenAI content policy errors
    if (error?.error?.code === 'content_policy_violation') {
      return NextResponse.json(
        { error: 'The backdrop description was rejected by the content policy. Please try a different description.' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error?.message || 'Failed to generate backdrop' },
      { status: 500 }
    )
  }
}
