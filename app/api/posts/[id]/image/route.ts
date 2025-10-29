import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force Node.js runtime and dynamic rendering
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * PATCH /api/posts/[id]/image
 * Update an existing post with generated image data
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const userId = (session.user as any).id
    const postId = params.id
    
    // Parse request body
    const body = await request.json()
    const { imageUrl, imageStyle } = body
    
    // Validate input
    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json(
        { error: 'imageUrl is required and must be a string' },
        { status: 400 }
      )
    }
    
    if (!imageStyle || typeof imageStyle !== 'string') {
      return NextResponse.json(
        { error: 'imageStyle is required and must be a string' },
        { status: 400 }
      )
    }
    
    // Verify post exists and belongs to user
    const existingPost = await prisma.postHistory.findUnique({
      where: { id: postId },
      select: { userId: true }
    })
    
    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }
    
    if (existingPost.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden: You do not own this post' },
        { status: 403 }
      )
    }
    
    // Update post with image data
    const updatedPost = await prisma.postHistory.update({
      where: { id: postId },
      data: {
        imageUrl,
        imageStyle
      }
    })
    
    console.log(`[posts/image] Updated post ${postId} with image (style: ${imageStyle})`)
    
    return NextResponse.json({
      success: true,
      imageUrl: updatedPost.imageUrl,
      imageStyle: updatedPost.imageStyle
    })
    
  } catch (error: any) {
    console.error('[posts/image] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update post with image' },
      { status: 500 }
    )
  }
}
