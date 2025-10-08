import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Force Node.js runtime
export const runtime = 'nodejs'

const FeedbackSchema = z.object({
  postId: z.string(),
  rating: z.enum(['up', 'down']),
  note: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      console.log('[feedback] Unauthorized: No session')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const userId = (session.user as any).id
    const body = await request.json()
    
    console.log('[feedback] Received request:', { userId, body })
    
    // Validate input
    const validated = FeedbackSchema.parse(body)
    
    console.log('[feedback] Validated data:', validated)
    
    // Verify post belongs to user
    const post = await prisma.postHistory.findFirst({
      where: {
        id: validated.postId,
        userId
      }
    })
    
    console.log('[feedback] Post lookup result:', post ? 'Found' : 'Not found', { postId: validated.postId, userId })
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }
    
    // Get profile for keywords
    const profile = await prisma.profile.findUnique({
      where: { userId }
    })
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }
    
    // Create feedback with all required fields
    const feedback = await prisma.feedback.create({
      data: {
        userId,
        postId: validated.postId,
        feedback: validated.rating, // 'up' or 'down'
        note: validated.note || null,
        postType: post.postType,
        tone: post.tone,
        keywords: profile.keywords,
        hashtags: post.hashtags
      }
    })
    
    // Learning signals are now calculated dynamically from feedback data
    // No need to update Profile table
    
    console.log('[feedback] Feedback saved successfully:', { feedbackId: feedback.id, rating: feedback.feedback })
    
    // Return encouraging message based on rating
    const message = validated.rating === 'up' 
      ? "Awesome! Glad I could help. Your feedback helps me learn what you love! 🎉"
      : "Thanks for the feedback! I'm learning from this to make your next post even better. 💪"
    
    return NextResponse.json({
      success: true,
      message,
      feedback: {
        id: feedback.id,
        rating: feedback.feedback // 'up' or 'down'
      }
    })
    
  } catch (error: any) {
    console.error('[feedback] Error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to save feedback' },
      { status: 500 }
    )
  }
}

// Get feedback stats for learning progress
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
    
    // Get all feedback
    const allFeedback = await prisma.feedback.findMany({
      where: { userId },
      include: {
        post: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    // Calculate stats
    const totalFeedback = allFeedback.length
    const upvotes = allFeedback.filter(f => f.feedback === 'up').length
    const downvotes = allFeedback.filter(f => f.feedback === 'down').length
    
    // Group by post type
    const byPostType: Record<string, { up: number; down: number }> = {}
    allFeedback.forEach(f => {
      const postType = f.post.postType
      if (!byPostType[postType]) {
        byPostType[postType] = { up: 0, down: 0 }
      }
      if (f.feedback === 'up') {
        byPostType[postType].up++
      } else {
        byPostType[postType].down++
      }
    })
    
    // Group by tone
    const byTone: Record<string, { up: number; down: number }> = {}
    allFeedback.forEach(f => {
      const tone = f.post.tone || 'unknown'
      if (!byTone[tone]) {
        byTone[tone] = { up: 0, down: 0 }
      }
      if (f.feedback === 'up') {
        byTone[tone].up++
      } else {
        byTone[tone].down++
      }
    })
    
    return NextResponse.json({
      totalFeedback,
      upvotes,
      downvotes,
      byPostType,
      byTone
    })
    
  } catch (error: any) {
    console.error('[feedback-get] Error:', error)
    return NextResponse.json(
      { error: 'Failed to get feedback stats' },
      { status: 500 }
    )
  }
}
