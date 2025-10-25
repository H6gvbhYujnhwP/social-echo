// app/api/posts/[postId]/regenerate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { assertOpenAIKey } from '@/lib/openai'
import { z } from 'zod'
import { buildAndGenerateDraftV8, type LearningSignals, type ProfileData } from '@/lib/ai/ai-service-v8.8'
import { PostType } from '@/lib/ai/ai-config'
import { checkUserAccess } from '@/lib/access-control'

// Force Node.js runtime
export const runtime = 'nodejs'

const RegenerateSchema = z.object({
  customInstruction: z.string().trim().min(1, 'Custom instruction is required')
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const userId = (session.user as any).id
    const postId = params.id
    
    // Assert API key
    assertOpenAIKey()
    
    // Parse and validate request body
    const body = await request.json()
    const validated = RegenerateSchema.parse(body)
    
    // Check access control (trial, subscription, etc.)
    const accessCheck = await checkUserAccess(userId)
    if (!accessCheck.allowed) {
      return NextResponse.json(
        { error: accessCheck.reason },
        { status: 403 }
      )
    }
    
    // Get the existing post
    const existingPost = await prisma.postHistory.findUnique({
      where: { id: postId },
      include: { user: { include: { profile: true } } }
    })
    
    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }
    
    // Verify ownership
    if (existingPost.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }
    
    // Check customisation limit
    const { checkCustomisationAllowed } = await import('@/lib/usage/service')
    const customisation = await checkCustomisationAllowed(postId, userId)
    
    if (!customisation.allowed) {
      return NextResponse.json(
        { 
          error: 'Customisations exhausted',
          message: `You've used both customisations for this post. Start a new post or upgrade for more.`,
          customisationsUsed: customisation.customisationsUsed,
          customisationsLeft: customisation.customisationsLeft,
        },
        { status: 429 }
      )
    }
    
    // Get user profile
    const profile = existingPost.user.profile
    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found. Please complete training first.' },
        { status: 404 }
      )
    }
    
    // Get learning signals from feedback
    const feedback = await prisma.feedback.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    })
    
    const learningSignals: LearningSignals = {}
    
    if (feedback.length >= 3) {
      // Tone preference learning
      const upvotedTones = feedback
        .filter((f: any) => f.feedback === 'up')
        .map((f: any) => f.tone)
        .filter((tone: any, idx: number, arr: any[]) => arr.indexOf(tone) === idx)
      
      const downvotedTones = feedback
        .filter((f: any) => f.feedback === 'down')
        .map((f: any) => f.tone)
        .filter((tone: any, idx: number, arr: any[]) => arr.indexOf(tone) === idx)
      
      // Only include downvoted tones (upvoted not in type)
      if (downvotedTones.length > 0) {
        learningSignals.downvotedTones = downvotedTones
      }
      
      // Hashtag preference learning
      const hashtagCounts = feedback
        .filter((f: any) => f.feedback === 'up')
        .map((f: any) => f.hashtags.length)
      
      if (hashtagCounts.length >= 3) {
        const avgHashtags = Math.round(
          hashtagCounts.reduce((sum: number, count: number) => sum + count, 0) / hashtagCounts.length
        )
        learningSignals.preferredHashtagCount = avgHashtags
      }
      
      // Preferred terms from positive feedback
      const preferredKeywords = new Set<string>()
      feedback
        .filter((f: any) => f.feedback === 'up')
        .forEach((f: any) => {
          f.keywords.forEach((kw: string) => preferredKeywords.add(kw))
        })
      
      if (preferredKeywords.size > 0) {
        learningSignals.preferredTerms = Array.from(preferredKeywords).slice(0, 10)
      }
    }
    
    // Prepare profile data
    const profileData: ProfileData = {
      business_name: profile.business_name,
      industry: profile.industry,
      tone: profile.tone,
      products_services: profile.products_services,
      target_audience: profile.target_audience,
      usp: profile.usp,
      keywords: profile.keywords,
      website: profile.website,
      rotation: profile.rotation
    }
    
    console.log('[regenerate] Regenerating post with custom instruction:', validated.customInstruction)
    
    // Generate new draft with custom instruction using v8.8 refinement
    const draft = await buildAndGenerateDraftV8({
      userId,
      postType: existingPost.postType as PostType,
      profile: profileData,
      learningSignals,
      twists: {
        toneOverride: existingPost.tone !== profile.tone ? existingPost.tone : undefined,
        note: validated.customInstruction,
        originalPost: existingPost.postText  // Pass original post for refinement
      }
    })
    
    console.log('[regenerate] Draft generated successfully')
    
    // Update the existing post (don't create a new one)
    const updatedPost = await prisma.postHistory.update({
      where: { id: postId },
      data: {
        headlineOptions: draft.headline_options || [],
        postText: draft.post_text || '',
        hashtags: draft.hashtags || [],
        visualPrompt: draft.visual_prompt || '',
        isRegeneration: true
      }
    })
    
    console.log('[regenerate] Post updated:', updatedPost.id)
    
    // Track the customisation
    const { trackPostGeneration } = await import('@/lib/usage/service')
    const trackResult = await trackPostGeneration({
      postId,
      userId,
      isRegeneration: true
    })
    
    if (!trackResult.success) {
      console.error('[regenerate] Failed to track usage:', trackResult.error)
      // Don't fail the request, just log
    } else {
      console.log('[regenerate] Customisation tracked successfully')
    }
    
    // Get updated customisation count
    const updatedCustomisation = await checkCustomisationAllowed(postId, userId)
    
    console.log('[regenerate] Updated customisation:', {
      allowed: updatedCustomisation.allowed,
      customisationsUsed: updatedCustomisation.customisationsUsed,
      customisationsLeft: updatedCustomisation.customisationsLeft,
      isInfinity: updatedCustomisation.customisationsLeft === Infinity
    });
    
    // Return updated draft with customisations left
    // Convert Infinity to -1 for JSON serialization (Infinity becomes null in JSON)
    const customisationsLeftForJson = updatedCustomisation.customisationsLeft === Infinity 
      ? -1 
      : updatedCustomisation.customisationsLeft;
    
    return NextResponse.json({
      headline_options: draft.headline_options,
      post_text: draft.post_text,
      hashtags: draft.hashtags,
      visual_prompt: draft.visual_prompt,
      best_time_uk: draft.best_time_uk,
      postId: updatedPost.id,
      customisationsLeft: customisationsLeftForJson
    })
    
  } catch (error: any) {
    console.error('[regenerate] Error:', error)
    
    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { 
          error: 'Invalid request',
          message: error.issues[0]?.message || 'Invalid custom instruction'
        },
        { status: 400 }
      )
    }
    
    // Handle AI generation errors
    if (error.message?.includes('AI_GENERATION_FAILED')) {
      return NextResponse.json(
        { 
          error: 'Generation failed',
          message: 'Failed to regenerate content. Please try again.'
        },
        { status: 502 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to regenerate post',
        message: error.message || 'An unexpected error occurred'
      },
      { status: 500 }
    )
  }
}

