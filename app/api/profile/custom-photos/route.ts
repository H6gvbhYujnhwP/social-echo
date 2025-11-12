import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_PHOTOS = 5
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']

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

    const formData = await req.formData()
    const file = formData.get('photo') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PNG, JPG, and WEBP are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    // Convert to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const mimeType = file.type
    const photoUrl = `data:${mimeType};base64,${base64}`

    // Get existing photos
    const existingPhotos = (user.profile?.customPhotos as any[]) || []

    // Check max photos limit
    if (existingPhotos.length >= MAX_PHOTOS) {
      return NextResponse.json(
        { error: `Maximum ${MAX_PHOTOS} photos allowed. Please delete a photo first.` },
        { status: 400 }
      )
    }

    // Create new photo object
    const photoId = crypto.randomBytes(16).toString('hex')
    const newPhoto = {
      id: photoId,
      name: file.name,
      base64: photoUrl,
      uploadedAt: new Date().toISOString()
    }

    // Add to photos array
    const updatedPhotos = [...existingPhotos, newPhoto]

    // Update profile
    await prisma.profile.update({
      where: { userId: user.id },
      data: { customPhotos: updatedPhotos }
    })

    return NextResponse.json({
      photoId,
      photoUrl,
      name: file.name
    })

  } catch (error) {
    console.error('Error uploading custom photo:', error)
    return NextResponse.json(
      { error: 'Failed to upload photo' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
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

    const photos = (user.profile?.customPhotos as any[]) || []

    return NextResponse.json({ photos })

  } catch (error) {
    console.error('Error fetching custom photos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    )
  }
}
