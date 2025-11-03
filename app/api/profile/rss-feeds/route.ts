import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validateRssFeedUrl } from '@/lib/rss/custom-rss-service'

// GET - Retrieve user's custom RSS feeds
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    const feeds = await prisma.customRssFeed.findMany({
      where: { userId },
      select: {
        id: true,
        url: true,
        name: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ feeds })
  } catch (error) {
    console.error('Error fetching RSS feeds:', error)
    return NextResponse.json(
      { error: 'Failed to fetch RSS feeds' },
      { status: 500 }
    )
  }
}

// POST - Add a new RSS feed
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    const body = await req.json()
    const { url, name } = body

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'RSS feed URL is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Check if user already has this feed
    const existingFeed = await prisma.customRssFeed.findUnique({
      where: {
        userId_url: {
          userId,
          url
        }
      }
    })

    if (existingFeed) {
      return NextResponse.json(
        { error: 'This RSS feed has already been added' },
        { status: 400 }
      )
    }

    // Check feed limit (max 20 feeds per user)
    const feedCount = await prisma.customRssFeed.count({
      where: { userId }
    })

    if (feedCount >= 20) {
      return NextResponse.json(
        { error: 'Maximum of 20 RSS feeds allowed. Please delete some feeds first.' },
        { status: 400 }
      )
    }

    // Validate that the URL is actually an RSS feed
    console.log('[rss-feeds-api] Validating RSS feed:', url)
    const validation = await validateRssFeedUrl(url)

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'Invalid RSS feed' },
        { status: 400 }
      )
    }

    // Create the RSS feed
    const feed = await prisma.customRssFeed.create({
      data: {
        userId,
        url,
        name: name || validation.feedTitle || 'RSS Feed'
      },
      select: {
        id: true,
        url: true,
        name: true,
        createdAt: true
      }
    })

    console.log('[rss-feeds-api] RSS feed added successfully:', feed.name)

    return NextResponse.json({
      success: true,
      feed
    })
  } catch (error) {
    console.error('Error adding RSS feed:', error)
    return NextResponse.json(
      { error: 'Failed to add RSS feed' },
      { status: 500 }
    )
  }
}

// DELETE - Remove an RSS feed
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    const { searchParams } = new URL(req.url)
    const feedId = searchParams.get('id')

    if (!feedId) {
      return NextResponse.json(
        { error: 'Feed ID is required' },
        { status: 400 }
      )
    }

    // Verify the feed belongs to the user before deleting
    const feed = await prisma.customRssFeed.findUnique({
      where: { id: feedId }
    })

    if (!feed) {
      return NextResponse.json(
        { error: 'RSS feed not found' },
        { status: 404 }
      )
    }

    if (feed.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this feed' },
        { status: 403 }
      )
    }

    // Delete the feed
    await prisma.customRssFeed.delete({
      where: { id: feedId }
    })

    console.log('[rss-feeds-api] RSS feed deleted:', feedId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting RSS feed:', error)
    return NextResponse.json(
      { error: 'Failed to delete RSS feed' },
      { status: 500 }
    )
  }
}
