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
import { buildAndGenerateDraftV8 } from '@/lib/ai/ai-service-v8.8'

// Feature flag for v8.8 generation (set to true to enable)
const USE_V8_8_GENERATION = true

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
    
    // Extract force parameter and post ID (for regenerations)
    const force = body.force || false
    const postId = body.postId || null // Post ID for regenerations
    const isRegeneration = Boolean(force && postId) // Only regeneration if both force AND postId
    
    // Validate: force=true requires postId
    if (force && !postId) {
      return NextResponse.json(
        { 
          code: 'BAD_REGEN_REQUEST', 
          message: 'postId is required for regeneration. Generate a draft first, then try again.' 
        },
        { status: 400 }
      )
    }
    
    // Validate request with better error handling
    let validatedRequest
    try {
      validatedRequest = TextGenerationRequestSchema.parse(body)
    } catch (validationError: any) {
      console.error('[generate-text] Validation error:', validationError)
      
      // Better error handling for Zod validation errors
      if (validationError.issues) {
        const firstIssue = validationError.issues[0];
        return NextResponse.json(
          { 
            code: 'INVALID_INPUT',
            message: firstIssue.message || 'Invalid request data',
            field: firstIssue.path?.join('.') || 'unknown',
            issues: validationError.issues
          },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { 
          code: 'INVALID_INPUT',
          error: 'Invalid request data',
          details: validationError.message 
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
    
    // Check access control (trial expiration, suspension, subscription status)
    const { checkUserAccess } = await import('@/lib/access-control')
    const accessCheck = await checkUserAccess(userId)
    
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
    
    const subscription = accessCheck.subscription!
    
    // Check customisation limit (for regenerations)
    if (isRegeneration) {
      const { checkCustomisationAllowed } = await import('@/lib/usage/service');
      const customisation = await checkCustomisationAllowed(postId, userId);
      
      if (!customisation.allowed) {
        return NextResponse.json(
          { 
            error: 'CUSTOMISATIONS_EXHAUSTED',
            message: `You've used both customisations for this post. Start a new post or upgrade for more.`,
            customisations_used: customisation.customisationsUsed,
            customisations_left: customisation.customisationsLeft,
          },
          { status: 429 }
        )
      }
    }
    
    // Check usage limit (only for new posts, not regenerations)
    if (!force) {
      // Unlimited plans (usageLimit === null) should never block
      if (subscription.usageLimit !== null && subscription.usageCount >= subscription.usageLimit) {
        // Special error for trial users (both admin trials and free trials)
        if (subscription.status === 'trial' || subscription.status === 'free_trial') {
          return NextResponse.json(
            { 
              error: 'TRIAL_EXHAUSTED',
              message: `You've reached the end of your trial. Upgrade to continue creating posts.`,
              posts_used: subscription.usageCount,
              posts_allowance: subscription.usageLimit,
              plan: subscription.plan,
              isTrial: true
            },
            { status: 402 }
          )
        }
        
        // Regular usage limit error for active subscriptions
        return NextResponse.json(
          { 
            error: 'Usage limit reached',
            message: `You've used all ${subscription.usageLimit} posts for this period. Upgrade your plan for more posts.`,
            posts_used: subscription.usageCount,
            posts_allowance: subscription.usageLimit,
            plan: subscription.plan
          },
          { status: 402 }
        )
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
    
    // Derive learning signals using the new service
    const { deriveLearningSignals } = await import('@/lib/ai/learning-signals')
    const learningSignals = await deriveLearningSignals(userId)
    
    console.log('[generate-text] Learning signals derived:', {
      confidence: learningSignals.confidence,
      totalFeedback: learningSignals.totalFeedback,
      preferredTermsCount: learningSignals.preferredTerms.length,
      avoidedTermsCount: learningSignals.avoidedTerms.length
    })
    
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
      rotation: profile.rotation,
      country: profile.country || null,  // v8.8: country for localized content
      documents: profile.documents as any || null  // v8.8: uploaded technical documents
    }
    
    console.log('[generate-text] Calling AI service...', USE_V8_8_GENERATION ? 'v8.8' : 'legacy')
    
    // Fetch original post if this is a regeneration
    let originalPostText: string | undefined = undefined
    let originalCustomisationsUsed = 0
    if (isRegeneration) {
      const originalPost = await prisma.postHistory.findUnique({
        where: { id: postId }
      })
      
      if (originalPost) {
        originalPostText = originalPost.postText
        originalCustomisationsUsed = originalPost.customisationsUsed || 0
        console.log('[generate-text] Fetched original post for refinement:', postId, 'customisationsUsed:', originalCustomisationsUsed)
      } else {
        console.warn('[generate-text] Original post not found for refinement:', postId)
      }
    }
    
    // Call AI service (v8.8 or legacy based on feature flag)
    let draft
    try {
      if (USE_V8_8_GENERATION) {
        // Use new v8.8 generation with country awareness and diversity engine
        draft = await buildAndGenerateDraftV8({
          userId,
          postType: validatedRequest.post_type,
          profile: profileData,
          learningSignals,
          twists: {
            toneOverride: validatedRequest.tone !== profile.tone ? validatedRequest.tone : undefined,
            extraKeywords: validatedRequest.keywords ? validatedRequest.keywords.split(',').map(k => k.trim()) : undefined,
            note: validatedRequest.user_prompt || undefined,
            originalPost: originalPostText  // Pass original post for refinement
          },
          useDiversityEngine: true
        })
      } else {
        // Use legacy generation
        draft = await buildAndGenerateDraft({
          userId,
          postType: validatedRequest.post_type,
          profile: profileData,
          learningSignals,
          twists: {
            toneOverride: validatedRequest.tone !== profile.tone ? validatedRequest.tone : undefined,
            extraKeywords: validatedRequest.keywords ? validatedRequest.keywords.split(',').map(k => k.trim()) : undefined,
            note: validatedRequest.user_prompt || undefined,
            originalPost: originalPostText  // Pass original post for refinement
          }
        })
      }
      console.log('[generate-text] Draft generated successfully')
    } catch (aiError: any) {
      console.error('[generate-text] AI service error:', aiError)
      
      // Parse error message for better user feedback
      const errorMessage = aiError.message || 'Unknown error'
      
      // Configuration errors (400)
      if (errorMessage.includes('CONFIG_MODEL_INVALID')) {
        return NextResponse.json(
          { 
            error: 'AI Configuration Error',
            message: 'The configured AI model is invalid. Please contact support or check the admin configuration.',
            details: errorMessage
          },
          { status: 400 }
        )
      }
      
      if (errorMessage.includes('not enabled')) {
        return NextResponse.json(
          { 
            error: 'Post type not available',
            message: errorMessage
          },
          { status: 400 }
        )
      }
      
      // Authentication errors (401)
      if (errorMessage.includes('Invalid API key') || errorMessage.includes('INVALID_API_KEY')) {
        return NextResponse.json(
          { 
            error: 'API Configuration Error',
            message: 'AI service authentication failed. Please contact support.',
            details: 'Invalid API key'
          },
          { status: 500 } // Return 500 since this is a server config issue
        )
      }
      
      // Timeout errors (504)
      if (errorMessage.includes('TIMEOUT') || errorMessage.includes('timed out')) {
        return NextResponse.json(
          { 
            error: 'Generation timeout',
            message: 'The AI service took too long to respond. Please try again.',
            details: errorMessage
          },
          { status: 504 }
        )
      }
      
      // Rate limit errors (429)
      if (errorMessage.includes('RATE_LIMIT') || errorMessage.includes('429')) {
        return NextResponse.json(
          { 
            error: 'Rate limit exceeded',
            message: 'Too many requests. Please wait a moment and try again.',
            details: errorMessage
          },
          { status: 429 }
        )
      }
      
      // Service unavailable (503)
      if (errorMessage.includes('SERVICE_UNAVAILABLE') || errorMessage.includes('503')) {
        return NextResponse.json(
          { 
            error: 'AI service unavailable',
            message: 'The AI service is temporarily unavailable. Please try again in a few moments.',
            details: errorMessage
          },
          { status: 503 }
        )
      }
      
      // Generic AI generation failure (502)
      if (errorMessage.includes('AI_GENERATION_FAILED')) {
        return NextResponse.json(
          { 
            error: 'Generation failed',
            message: 'Failed to generate content after multiple attempts. Please try again.',
            details: errorMessage
          },
          { status: 502 }
        )
      }
      
      // Unknown error (500)
      return NextResponse.json(
        { 
          error: 'Failed to generate content',
          message: 'An unexpected error occurred. Please try again or contact support.',
          details: errorMessage 
        },
        { status: 500 }
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
        isRegeneration,
        // Preserve customisation counter from original post during regeneration
        customisationsUsed: isRegeneration ? originalCustomisationsUsed : 0
      }
    })
    
    console.log('[generate-text] Post saved to database:', postHistory.id)
    
    // Track usage (first generation or customisation)
    const { trackPostGeneration } = await import('@/lib/usage/service');
    const finalPostId = isRegeneration ? postId : postHistory.id;
    console.info('[trackPostGeneration] isRegen=%s postId=%s', isRegeneration, finalPostId);
    const trackResult = await trackPostGeneration({
      postId: finalPostId,
      userId,
      isRegeneration
    });
    
    if (!trackResult.success) {
      console.error('[generate-text] Failed to track usage:', trackResult.error);
      // Don't fail the request, just log the error
    } else {
      console.log('[generate-text] Usage tracked successfully');
      
      // Free trial email triggers
      if (subscription.status === 'free_trial' && !isRegeneration) {
        // Get updated usage count from database
        const updatedSubscription = await prisma.subscription.findUnique({
          where: { userId },
          select: { usageCount: true }
        });
        const newUsageCount = updatedSubscription?.usageCount || subscription.usageCount + 1;
        
        // Send feedback email at 4 posts (50% of trial)
        if (newUsageCount === 4) {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          if (user && !user.feedbackEmailSentAt) {
            const { sendFreeTrialFeedbackEmail } = await import('@/lib/email/service');
            try {
              await sendFreeTrialFeedbackEmail(user.email, user.name, 4); // 4 posts remaining
              await prisma.user.update({
                where: { id: userId },
                data: { feedbackEmailSentAt: new Date() }
              });
              console.log('[generate-text] Feedback email sent at 4 posts');
            } catch (emailError) {
              console.error('[generate-text] Failed to send feedback email:', emailError);
            }
          }
        }
        
        // Send trial exhausted email at 8 posts
        if (newUsageCount === 8) {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          if (user) {
            const { sendFreeTrialExhaustedEmail } = await import('@/lib/email/service');
            try {
              await sendFreeTrialExhaustedEmail(user.email, user.name);
              console.log('[generate-text] Trial exhausted email sent at 8 posts');
            } catch (emailError) {
              console.error('[generate-text] Failed to send trial exhausted email:', emailError);
            }
          }
        }
      }
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
