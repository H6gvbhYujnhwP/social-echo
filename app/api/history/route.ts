import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

/**
 * GET /api/history
 * Returns paginated list of recent history items for the current user
 * GLOBAL ACCESS - No plan limits (history is available to all users)
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
    
    // Check access control (trial expiration, suspension, subscription status)
    const { checkUserAccess } = await import('@/lib/access-control')
    const accessCheck = await checkUserAccess(user.id)
    
    if (!accessCheck.allowed) {
      return NextResponse.json(
        { 
          error: 'Access denied',
          message: accessCheck.reason,
          status: accessCheck.subscription?.status
        },
        { status: 403 }
      )
    }

    // Parse query parameters for pagination
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100) // Max 100 items per page
    const cursor = searchParams.get('cursor') || undefined

    // Build query with cursor-based pagination
    const queryOptions: any = {
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: limit + 1, // Fetch one extra to check if there's more
      select: {
        id: true,
        createdAt: true,
        headlineOptions: true,
        postText: true,
        hashtags: true,
        imageUrl: true,
        imageStyle: true,
        postType: true,
        tone: true,
        visualPrompt: true,
        customisationsUsed: true,
      }
    }

    // Add cursor if provided
    if (cursor) {
      queryOptions.cursor = { id: cursor }
      queryOptions.skip = 1 // Skip the cursor item itself
    }

    // Fetch history items
    const historyItems = await prisma.postHistory.findMany(queryOptions)

    // Check if there are more items
    const hasMore = historyItems.length > limit
    const items = hasMore ? historyItems.slice(0, limit) : historyItems
    const nextCursor = hasMore ? items[items.length - 1].id : undefined

    return NextResponse.json({
      items,
      nextCursor,
      hasMore,
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
 * GLOBAL ACCESS - No plan limits
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
    
    // Check access control (trial expiration, suspension, subscription status)
    const { checkUserAccess } = await import('@/lib/access-control')
    const accessCheck = await checkUserAccess(user.id)
    
    if (!accessCheck.allowed) {
      return NextResponse.json(
        { 
          error: 'Access denied',
          message: accessCheck.reason,
          status: accessCheck.subscription?.status
        },
        { status: 403 }
      )
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

    // Create new history entry (NO LIMIT - global history for all plans)
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
        imageUrl: validated.imageUrl || null,
        imageStyle: validated.imageStyle || null,
        isRegeneration: validated.isRegeneration,
      }
    })

    console.log(`[history] Saved new history entry for user ${user.id}`)

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

