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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const userId = (session.user as any).id
    const body = await request.json()
    const validated = FeedbackSchema.parse(body)
    
    // Verify post belongs to user
    const post = await prisma.postHistory.findFirst({
      where: {
        id: validated.postId,
        userId
      }
    })
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }
    
    // Create feedback
    const feedback = await prisma.feedback.create({
      data: {
        userId,
        postId: validated.postId,
        rating: validated.rating,
        note: validated.note || null
      }
    })
    
    // Update profile learning signals
    const profile = await prisma.profile.findUnique({
      where: { userId }
    })
    
    if (profile && validated.rating === 'down') {
      // Add tone to downvoted tones if post has tone
      if (post.tone) {
        const downvotedTones = profile.downvotedTones
          ? profile.downvotedTones.split(',').filter(t => t.trim())
          : []
        
        if (!downvotedTones.includes(post.tone)) {
          downvotedTones.push(post.tone)
        }
        
        await prisma.profile.update({
          where: { userId },
          data: {
            downvotedTones: downvotedTones.join(',')
          }
        })
      }
      
      // Extract terms from note
      if (validated.note) {
        const terms = validated.note
          .toLowerCase()
          .split(/\W+/)
          .filter(t => t.length > 3)
          .slice(0, 5) // Take up to 5 terms
        
        if (terms.length > 0) {
          const preferredTerms = profile.preferredTerms
            ? profile.preferredTerms.split(',').filter(t => t.trim())
            : []
          
          terms.forEach(term => {
            if (!preferredTerms.includes(term)) {
              preferredTerms.push(term)
            }
          })
          
          await prisma.profile.update({
            where: { userId },
            data: {
              preferredTerms: preferredTerms.slice(-20).join(',') // Keep last 20 terms
            }
          })
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      feedback: {
        id: feedback.id,
        rating: feedback.rating
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
    const upvotes = allFeedback.filter(f => f.rating === 'up').length
    const downvotes = allFeedback.filter(f => f.rating === 'down').length
    
    // Group by post type
    const byPostType: Record<string, { up: number; down: number }> = {}
    allFeedback.forEach(f => {
      const postType = f.post.postType
      if (!byPostType[postType]) {
        byPostType[postType] = { up: 0, down: 0 }
      }
      if (f.rating === 'up') {
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
      if (f.rating === 'up') {
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
