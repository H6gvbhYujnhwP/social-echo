import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Force Node.js runtime
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/feedback/history
 * 
 * Fetch feedback history for the current user with pagination
 * 
 * Query params:
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 100)
 * 
 * Response:
 * {
 *   feedback: Array<{
 *     id: string
 *     postId: string
 *     feedback: 'up' | 'down'
 *     note: string | null
 *     postType: string
 *     tone: string
 *     keywords: string[]
 *     hashtags: string[]
 *     createdAt: string
 *     post: {
 *       id: string
 *       postText: string
 *       headlineOptions: string[]
 *     }
 *   }>
 *   pagination: {
 *     page: number
 *     limit: number
 *     total: number
 *     totalPages: number
 *   }
 * }
 */
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
    
    // Parse query params
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const skip = (page - 1) * limit
    
    console.log('[feedback-history] Fetching history for user:', userId, { page, limit })
    
    // Get total count
    const total = await prisma.feedback.count({
      where: { userId }
    })
    
    // Get feedback with post data
    const feedback = await prisma.feedback.findMany({
      where: { userId },
      include: {
        post: {
          select: {
            id: true,
            postText: true,
            headlineOptions: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })
    
    console.log('[feedback-history] Found items:', feedback.length, 'Total:', total)
    
    return NextResponse.json({
      feedback,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
    
  } catch (error: any) {
    console.error('[feedback-history] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feedback history' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/feedback/history
 * 
 * Delete a feedback item
 * 
 * Body:
 * {
 *   feedbackId: string
 * }
 */
export async function DELETE(request: NextRequest) {
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
    
    const { feedbackId } = z.object({
      feedbackId: z.string().min(1)
    }).parse(body)
    
    console.log('[feedback-history] Deleting feedback:', feedbackId, 'for user:', userId)
    
    // Verify ownership before deleting
    const feedback = await prisma.feedback.findFirst({
      where: {
        id: feedbackId,
        userId
      }
    })
    
    if (!feedback) {
      return NextResponse.json(
        { error: 'Feedback not found or does not belong to you' },
        { status: 404 }
      )
    }
    
    // Delete feedback
    await prisma.feedback.delete({
      where: { id: feedbackId }
    })
    
    console.log('[feedback-history] Feedback deleted successfully')
    
    return NextResponse.json({
      success: true,
      message: 'Feedback deleted successfully'
    })
    
  } catch (error: any) {
    console.error('[feedback-history] Error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to delete feedback' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/feedback/history
 * 
 * Update a feedback item (rating and/or note)
 * 
 * Body:
 * {
 *   feedbackId: string
 *   rating?: 'up' | 'down'
 *   note?: string | null
 * }
 */
export async function PATCH(request: NextRequest) {
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
    
    const validated = z.object({
      feedbackId: z.string().min(1),
      rating: z.enum(['up', 'down']).optional(),
      note: z.string().max(1000).nullish()
    }).parse(body)
    
    console.log('[feedback-history] Updating feedback:', validated.feedbackId, 'for user:', userId)
    
    // Verify ownership before updating
    const feedback = await prisma.feedback.findFirst({
      where: {
        id: validated.feedbackId,
        userId
      }
    })
    
    if (!feedback) {
      return NextResponse.json(
        { error: 'Feedback not found or does not belong to you' },
        { status: 404 }
      )
    }
    
    // Build update data
    const updateData: any = {}
    if (validated.rating !== undefined) {
      updateData.feedback = validated.rating
    }
    if (validated.note !== undefined) {
      updateData.note = validated.note || null
    }
    
    // Update feedback
    const updated = await prisma.feedback.update({
      where: { id: validated.feedbackId },
      data: updateData
    })
    
    console.log('[feedback-history] Feedback updated successfully')
    
    return NextResponse.json({
      success: true,
      message: 'Feedback updated successfully',
      feedback: updated
    })
    
  } catch (error: any) {
    console.error('[feedback-history] Error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update feedback' },
      { status: 500 }
    )
  }
}
