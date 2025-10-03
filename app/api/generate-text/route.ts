import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { assertOpenAIKey } from '@/lib/openai'
import { 
  TextGenerationRequestSchema, 
  type TextGenerationResponse 
} from '@/lib/contract'
import { buildAndGenerateDraft, type LearningSignals, type ProfileData } from '@/lib/ai/ai-service'

// Force Node.js runtime (OpenAI SDK doesn't work well in Edge)
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
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
    
    // Assert API key is available
    assertOpenAIKey()
    
    // Parse body with error handling
    let body: any
    try {
      body = await request.json()
    } catch (parseError) {
      console.error('[generate-text] JSON parse error:', parseError)
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }
    
    // Extract force parameter (regeneration doesn't count against usage)
    const force = body.force || false
    
    // Validate request with better error handling
    let validatedRequest
    try {
      validatedRequest = TextGenerationRequestSchema.parse(body)
    } catch (validationError: any) {
      console.error('[generate-text] Validation error:', validationError)
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validationError.errors || validationError.message 
        },
        { status: 400 }
      )
    }
    
    // Check required field
    if (!validatedRequest.industry) {
      return NextResponse.json(
        { error: 'industry is required' },
        { status: 400 }
      )
    }
    
    // Check usage limits (only for new drafts, not regenerations)
    if (!force) {
      const subscription = await prisma.subscription.findUnique({
        where: { userId }
      })
      
      if (!subscription) {
        return NextResponse.json(
          { error: 'No subscription found' },
          { status: 403 }
        )
      }
      
      // Check if starter plan has reached limit
      if (subscription.plan === 'starter') {
        const limit = subscription.usageLimit || 8
        if (subscription.usageCount >= limit) {
          return NextResponse.json(
            { 
              error: 'Usage limit reached',
              message: `You've used all ${limit} posts for this month. Upgrade to Pro for unlimited posts.`,
              usageCount: subscription.usageCount,
              usageLimit: limit
            },
            { status: 403 }
          )
        }
      }
    }
    
    // Get user profile
    const profile = await prisma.profile.findUnique({
      where: { userId }
    })
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found. Please complete your profile first.' },
        { status: 400 }
      )
    }
    
    // Analyze feedback from database for learning signals
    const feedback = await prisma.feedback.findMany({
      where: { userId },
      include: { post: true },
      orderBy: { createdAt: 'desc' },
      take: 50 // Last 50 feedback items
    })
    
    // Calculate learning signals
    const learningSignals: LearningSignals = {}
    
    if (feedback.length >= 5) {
      // Tone preference learning
      const toneStats: Record<string, { up: number; down: number }> = {}
      feedback.forEach(f => {
        const tone = f.post.tone || 'unknown'
        if (!toneStats[tone]) {
          toneStats[tone] = { up: 0, down: 0 }
        }
        if (f.feedback === 'up') {
          toneStats[tone].up++
        } else {
          toneStats[tone].down++
        }
      })
      
      // Find downvoted tones (< 40% positive)
      const downvotedTones: string[] = []
      Object.entries(toneStats).forEach(([tone, stats]) => {
        const total = stats.up + stats.down
        if (total >= 3) {
          const score = stats.up / total
          if (score < 0.4) {
            downvotedTones.push(tone)
          }
        }
      })
      
      if (downvotedTones.length > 0) {
        learningSignals.downvotedTones = downvotedTones
      }
      
      // Hashtag preference learning
      const hashtagCounts = feedback
        .filter(f => f.feedback === 'up')
        .map(f => f.hashtags.length)
      
      if (hashtagCounts.length >= 3) {
        const avgHashtags = Math.round(
          hashtagCounts.reduce((sum, count) => sum + count, 0) / hashtagCounts.length
        )
        learningSignals.preferredHashtagCount = avgHashtags
      }
      
      // Preferred terms from positive feedback
      const preferredKeywords = new Set<string>()
      feedback
        .filter(f => f.feedback === 'up')
        .forEach(f => {
          f.keywords.forEach(kw => preferredKeywords.add(kw))
        })
      
      if (preferredKeywords.size > 0) {
        learningSignals.preferredTerms = Array.from(preferredKeywords).slice(0, 10)
      }
    }
    
    // Prepare profile data for AI service
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
    
    console.log('[generate-text] Calling centralized AI service...')
    
    // Call centralized AI service
    let draft
    try {
      draft = await buildAndGenerateDraft({
        userId,
        postType: validatedRequest.post_type,
        profile: profileData,
        learningSignals,
        twists: {
          toneOverride: validatedRequest.tone !== profile.tone ? validatedRequest.tone : undefined,
          extraKeywords: validatedRequest.keywords ? validatedRequest.keywords.split(',').map(k => k.trim()) : undefined
        }
      })
      console.log('[generate-text] Draft generated successfully')
    } catch (aiError: any) {
      console.error('[generate-text] AI service error:', aiError)
      
      // Check if it's a config error (post type not allowed)
      if (aiError.message.includes('not enabled')) {
        return NextResponse.json(
          { 
            error: 'Post type not available',
            message: aiError.message
          },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to generate content',
          details: aiError.message 
        },
        { status: 502 }
      )
    }
    
    // Save to database
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    const postHistory = await prisma.postHistory.create({
      data: {
        userId,
        date: today,
        postType: validatedRequest.post_type,
        tone: validatedRequest.tone,
        headlineOptions: draft.headline_options || [],
        postText: draft.post_text || '',
        hashtags: draft.hashtags || [],
        visualPrompt: draft.visual_prompt || '',
        isRegeneration: force || false
      }
    })
    
    console.log('[generate-text] Post saved to database:', postHistory.id)
    
    // Increment usage count (only for new drafts)
    if (!force) {
      await prisma.subscription.update({
        where: { userId },
        data: {
          usageCount: { increment: 1 }
        }
      })
      console.log('[generate-text] Usage count incremented')
    }
    
    // Return result with post ID for feedback
    return NextResponse.json({
      headline_options: draft.headline_options,
      post_text: draft.post_text,
      hashtags: draft.hashtags,
      visual_prompt: draft.visual_prompt,
      best_time_uk: draft.best_time_uk,
      postId: postHistory.id
    })
    
  } catch (error: any) {
    console.error('[generate-text] Unexpected error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
