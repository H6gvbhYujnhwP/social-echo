import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const photoId = params.id
    const existingPhotos = (user.profile?.customPhotos as any[]) || []

    // Filter out the photo to delete
    const updatedPhotos = existingPhotos.filter((photo: any) => photo.id !== photoId)

    if (updatedPhotos.length === existingPhotos.length) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
    }

    // Update profile
    await prisma.profile.update({
      where: { userId: user.id },
      data: { customPhotos: updatedPhotos }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting custom photo:', error)
    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 }
    )
  }
}
