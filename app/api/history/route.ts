import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

/**
 * GET /api/history
 * Returns list of recent history items for the current user
 * Limited by subscription plan (Starter: 1, Pro: 5)
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user with subscription
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Determine max history based on plan
    const maxHistory = user.subscription?.plan === 'pro' ? 5 : 1

    // Fetch recent history items
    const historyItems = await prisma.postHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: maxHistory,
      select: {
        id: true,
        createdAt: true,
        headlineOptions: true,
        postText: true,
        hashtags: true,
        // imageUrl: true,  // Will be available after migration
        // imageStyle: true,  // Will be available after migration
        postType: true,
        tone: true,
        visualPrompt: true,
      }
    })

    return NextResponse.json({
      items: historyItems,
      maxHistory,
      plan: user.subscription?.plan || 'starter'
    })
  } catch (error) {
    console.error('[history] GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/history
 * Save current draft to history before generating new one
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Parse request body
    const body = await request.json()
    const schema = z.object({
      date: z.string(),
      postType: z.string(),
      tone: z.string(),
      headlineOptions: z.array(z.string()),
      postText: z.string(),
      hashtags: z.array(z.string()),
      visualPrompt: z.string(),
      imageUrl: z.string().optional().nullable(),
      imageStyle: z.string().optional().nullable(),
      isRegeneration: z.boolean().optional().default(false),
    })

    const validated = schema.parse(body)

    // Determine max history based on plan
    const maxHistory = user.subscription?.plan === 'pro' ? 5 : 1

    // Create new history entry
    const newHistory = await prisma.postHistory.create({
      data: {
        userId: user.id,
        date: validated.date,
        postType: validated.postType,
        tone: validated.tone,
        headlineOptions: validated.headlineOptions,
        postText: validated.postText,
        hashtags: validated.hashtags,
        visualPrompt: validated.visualPrompt,
        // imageUrl: validated.imageUrl || null,  // Will be available after migration
        // imageStyle: validated.imageStyle || null,  // Will be available after migration
        isRegeneration: validated.isRegeneration,
      }
    })

    // Delete oldest entries beyond limit
    const allHistory = await prisma.postHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: { id: true }
    })

    if (allHistory.length > maxHistory) {
      const toDelete = allHistory.slice(maxHistory).map(h => h.id)
      await prisma.postHistory.deleteMany({
        where: {
          id: { in: toDelete },
          userId: user.id // Safety check
        }
      })
      console.log(`[history] Deleted ${toDelete.length} old entries (limit: ${maxHistory})`)
    }

    return NextResponse.json({
      success: true,
      id: newHistory.id,
      message: 'History saved successfully'
    })
  } catch (error) {
    console.error('[history] POST error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to save history' },
      { status: 500 }
    )
  }
}

