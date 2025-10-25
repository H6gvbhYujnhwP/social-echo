import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force Node.js runtime and dynamic rendering
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET posts (optionally filtered by date)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const userId = (session.user as any).id
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') // YYYY-MM-DD format
    
    // Build query
    const where: any = { userId }
    if (date) {
      where.date = date
    }
    
    // Get posts
    const posts = await prisma.postHistory.findMany({
      where,
      include: {
        feedback: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: date ? 1 : 50 // If filtering by date, get just one; otherwise get last 50
    })
    
    // If filtering by date and no post found, return 404
    if (date && posts.length === 0) {
      return NextResponse.json(
        { error: 'No post found for this date' },
        { status: 404 }
      )
    }
    
    // Format response
    const formattedPosts = posts.map((post: any) => ({
      id: post.id,
      date: post.date,
      postType: post.postType,
      tone: post.tone,
      headline_options: post.headlineOptions,
      post_text: post.postText,
      hashtags: post.hashtags,
      visual_prompt: post.visualPrompt,
      isRegeneration: post.isRegeneration,
      createdAt: post.createdAt.toISOString(),
      feedback: post.feedback ? {
        id: post.feedback.id,
        rating: post.feedback.feedback,
        note: post.feedback.note
      } : null
    }))
    
    // If filtering by date, return single post; otherwise return array
    if (date) {
      return NextResponse.json(formattedPosts[0])
    }
    
    return NextResponse.json({ posts: formattedPosts })
    
  } catch (error: any) {
    console.error('[posts-get] Error:', error)
    return NextResponse.json(
      { error: 'Failed to get posts' },
      { status: 500 }
    )
  }
}
