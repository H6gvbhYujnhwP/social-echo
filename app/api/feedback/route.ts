import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Force Node.js runtime
export const runtime = 'nodejs'

const FeedbackSchema = z.object({
  postId: z.string().min(1, 'Please ensure you have generated a post before providing feedback.'),
  rating: z.enum(['up', 'down']),
  note: z.string().max(1000).nullish(), // Allow undefined, null, or string
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
    let validated
    try {
      validated = FeedbackSchema.parse(body)
    } catch (zodError: any) {
      console.error('[feedback] Validation error:', zodError.errors)
      return NextResponse.json(
        { 
          error: 'Invalid input', 
          details: zodError.errors,
          message: 'Please ensure you have generated a post before providing feedback.'
        },
        { status: 400 }
      )
    }
    
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
      console.error('[feedback] Post not found:', { postId: validated.postId, userId })
      return NextResponse.json(
        { 
          error: 'Post not found',
          message: 'This post does not exist or does not belong to you. Please regenerate the post and try again.'
        },
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
    
    // Check if feedback already exists for this post
    const existingFeedback = await prisma.feedback.findUnique({
      where: { postId: validated.postId }
    })
    
    let feedback
    
    // Normalize note: null or undefined → undefined for Prisma
    const normalizedNote = validated.note ?? undefined
    
    if (existingFeedback) {
      // Update existing feedback
      feedback = await prisma.feedback.update({
        where: { postId: validated.postId },
        data: {
          feedback: validated.rating, // 'up' or 'down'
          note: normalizedNote,
          postType: post.postType,
          tone: post.tone,
          keywords: profile.keywords,
          hashtags: post.hashtags
        }
      })
      console.log('[feedback] Updated existing feedback:', { feedbackId: feedback.id })
    } else {
      // Create new feedback
      feedback = await prisma.feedback.create({
        data: {
          userId,
          postId: validated.postId,
          feedback: validated.rating, // 'up' or 'down'
          note: normalizedNote,
          postType: post.postType,
          tone: post.tone,
          keywords: profile.keywords,
          hashtags: post.hashtags
        }
      })
      console.log('[feedback] Created new feedback:', { feedbackId: feedback.id })
    }
    
    // Learning signals are now calculated dynamically from feedback data
    // No need to update Profile table
    
    console.log('[feedback] Feedback saved successfully:', { 
      feedbackId: feedback.id, 
      rating: feedback.feedback,
      isUpdate: !!existingFeedback 
    })
    
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
    const upvotes = allFeedback.filter((f: any) => f.feedback === 'up').length
    const downvotes = allFeedback.filter((f: any) => f.feedback === 'down').length
    
    // Group by post type
    const byPostType: Record<string, { up: number; down: number }> = {}
    allFeedback.forEach((f: any) => {
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
    allFeedback.forEach((f: any) => {
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
