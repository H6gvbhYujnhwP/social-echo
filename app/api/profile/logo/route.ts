import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
// No longer need file system imports - using base64 storage

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('logo') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Convert image to base64 for database storage
    // This avoids issues with ephemeral file systems in production
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const mimeType = file.type
    const logoUrl = `data:${mimeType};base64,${base64}`
    
    if (user.profile) {
      await prisma.profile.update({
        where: { userId: user.id },
        data: { logoUrl }
      })
    } else {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      logoUrl 
    })
  } catch (error) {
    console.error('[logo-upload] Error:', error)
    return NextResponse.json(
      { error: 'Failed to upload logo' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true }
    })

    if (!user || !user.profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Remove logo URL from profile
    await prisma.profile.update({
      where: { userId: user.id },
      data: { logoUrl: null }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[logo-delete] Error:', error)
    return NextResponse.json(
      { error: 'Failed to delete logo' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { logoPosition, logoSize, logoEnabled } = body

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true }
    })

    if (!user || !user.profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update logo settings
    await prisma.profile.update({
      where: { userId: user.id },
      data: {
        ...(logoPosition && { logoPosition }),
        ...(logoSize && { logoSize }),
        ...(logoEnabled !== undefined && { logoEnabled })
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[logo-settings] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update logo settings' },
      { status: 500 }
    )
  }
}
