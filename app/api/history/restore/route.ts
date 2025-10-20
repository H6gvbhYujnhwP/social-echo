import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

/**
 * POST /api/history/restore
 * Restore a previous version by ID
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Parse request body
    const body = await request.json()
    const schema = z.object({
      id: z.string()
    })

    const { id } = schema.parse(body)

    // Fetch the history item and verify ownership
    const historyItem = await prisma.postHistory.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        date: true,
        postType: true,
        tone: true,
        headlineOptions: true,
        postText: true,
        hashtags: true,
        visualPrompt: true,
        imageUrl: true,
        imageStyle: true,
        customisationsUsed: true,
        createdAt: true,
      }
    })

    if (!historyItem) {
      return NextResponse.json(
        { error: 'History item not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (historyItem.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - this history item does not belong to you' },
        { status: 403 }
      )
    }

    // Return the history item data (frontend will handle restoring to state)
    return NextResponse.json({
      success: true,
      data: historyItem,
      message: 'History item retrieved successfully'
    })
  } catch (error) {
    console.error('[history/restore] POST error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to restore history' },
      { status: 500 }
    )
  }
}

