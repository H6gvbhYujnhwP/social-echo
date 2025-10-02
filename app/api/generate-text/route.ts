import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateText, assertOpenAIKey } from '../../../lib/openai'
import { 
  TextGenerationRequestSchema, 
  parseTextGenerationResponse,
  type TextGenerationResponse 
} from '../../../lib/contract'

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
    
    // Get user profile for learning
    const profile = await prisma.profile.findUnique({
      where: { userId }
    })
    
    // Analyze feedback from database for learning
    const feedback = await prisma.feedback.findMany({
      where: { userId },
      include: { post: true },
      orderBy: { createdAt: 'desc' },
      take: 50 // Last 50 feedback items
    })
    
    // Calculate learning adjustments
    let effectiveTone: string = validatedRequest.tone
    let effectiveHashtagCount = 8
    const additionalInstructions: string[] = []
    
    if (feedback.length >= 5) {
      // Tone preference learning
      const toneStats: Record<string, { up: number; down: number }> = {}
      feedback.forEach(f => {
        const tone = f.post.tone || 'unknown'
        if (!toneStats[tone]) {
          toneStats[tone] = { up: 0, down: 0 }
        }
        if (f.rating === 'up') {
          toneStats[tone].up++
        } else {
          toneStats[tone].down++
        }
      })
      
      // Find best performing tone
      let bestTone: string = validatedRequest.tone
      let bestScore = -1
      Object.entries(toneStats).forEach(([tone, stats]) => {
        const total = stats.up + stats.down
        if (total >= 3) {
          const score = stats.up / total
          if (score > bestScore && score >= 0.6) {
            bestScore = score
            bestTone = tone as string
          }
        }
      })
      
      if (bestTone !== validatedRequest.tone && bestScore >= 0.6) {
        effectiveTone = bestTone
        additionalInstructions.push(`User has shown preference for ${bestTone} tone in past feedback (${Math.round(bestScore * 100)}% positive).`)
      }
      
      // Hashtag preference (simplified - could analyze edits in future)
      const avgHashtags = 8 // Default, could be learned from post edits
      effectiveHashtagCount = avgHashtags
    }
    
    // Apply downvoted tones from profile
    if (profile?.downvotedTones) {
      const downvoted = profile.downvotedTones.split(',').filter(t => t.trim())
      if (downvoted.includes(validatedRequest.tone)) {
        additionalInstructions.push(`Avoid ${validatedRequest.tone} tone - user has downvoted this style before.`)
      }
    }
    
    // Build the prompt
    const systemPrompt = `You are SOCIAL ECHO, a marketing copy expert for SMEs. You write crisp, tactical, story-first LinkedIn posts that read like Chris Donnelly: direct, practical, and engaging for busy professionals.
Always return STRICT JSON only; no markdown, no preamble.`

    // Define post structure based on type
    const getPostStructure = (postType: string) => {
      switch (postType) {
        case 'selling':
          return 'Hook → Pain → Benefit → Mini proof → CTA'
        case 'informational':
          return 'Hook → Context → 3 takeaways → Question'
        case 'advice':
          return 'Hook → Problem → Solution → Actionable tip → Engagement question'
        case 'news':
          return 'Hook → News summary → Impact analysis → Your take → Question'
        default:
          return 'Hook → Body → CTA'
      }
    }

    // Generate random seed for variation if force is true
    let seed = ''
    if (force) {
      seed = crypto.randomBytes(8).toString('hex')
    }

    const userPrompt = `Business Name: ${validatedRequest.business_name}
Industry: ${validatedRequest.industry}
Tone: ${effectiveTone} (obey this voice consistently)${effectiveTone !== validatedRequest.tone ? ' [LEARNED PREFERENCE]' : ''}
Products/Services: ${validatedRequest.products_services}
Target Audience: ${validatedRequest.target_audience}
USP (Unique Selling Point): ${validatedRequest.usp || 'Not provided'}
Keywords (weave naturally, not hashtag spam): ${validatedRequest.keywords || 'general business topics'}
Post Type: ${validatedRequest.post_type}
Seed: ${seed}

${additionalInstructions.length > 0 ? `
LEARNING INSIGHTS (from user feedback):
${additionalInstructions.map(i => `- ${i}`).join('\n')}
` : ''}

IMPORTANT: When creating ${validatedRequest.post_type} posts (especially "informational" and "selling" types), ALWAYS keep the company's USP in mind:
- For SELLING posts: Subtly weave in the USP to differentiate from competitors and highlight unique value
- For INFORMATIONAL posts: Position insights in a way that demonstrates the company's unique expertise and approach
- For ADVICE posts: Frame recommendations that align with the company's unique methodology or philosophy
- For NEWS posts: Analyze how industry news specifically impacts or validates the company's unique positioning

The USP should inform the perspective and angle of every post, making it clear why THIS company is uniquely qualified to discuss the topic.

Task: Create a ${validatedRequest.platform} post in the style of Chris Donnelly — direct, tactical, problem-led, story-first.

Post Structure for ${validatedRequest.post_type} posts: ${getPostStructure(validatedRequest.post_type)}

Return STRICT JSON in this format:
{
  "headline_options": ["Option 1", "Option 2", "Option 3"],
  "post_text": "The main post content...",
  "hashtags": ["Hashtag1", "Hashtag2", ...],
  "visual_prompt": "Detailed image generation prompt",
  "best_time_uk": "HH:MM"
}

Generate approximately ${effectiveHashtagCount} relevant hashtags.`

    console.log('[generate-text] Generating content...')
    
    // Call OpenAI
    let rawResponse: string
    try {
      const fullPrompt = `${systemPrompt}\n\n${userPrompt}`
      rawResponse = await generateText(fullPrompt)
      console.log('[generate-text] OpenAI response received')
    } catch (openaiError: any) {
      console.error('[generate-text] OpenAI error:', openaiError)
      return NextResponse.json(
        { 
          error: 'Failed to generate content from AI',
          details: openaiError.message 
        },
        { status: 502 }
      )
    }
    
    // Parse response
    let result: TextGenerationResponse
    try {
      result = parseTextGenerationResponse(rawResponse)
      console.log('[generate-text] Response parsed successfully')
    } catch (parseError: any) {
      console.error('[generate-text] Parse error:', parseError)
      console.error('[generate-text] Raw response:', rawResponse)
      return NextResponse.json(
        { 
          error: 'Failed to parse AI response',
          details: parseError.message,
          raw: rawResponse.substring(0, 500)
        },
        { status: 502 }
      )
    }
    
    // Save to database
    const postHistory = await prisma.postHistory.create({
      data: {
        userId,
        postType: validatedRequest.post_type,
        tone: effectiveTone,
        draft: result as any
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
      ...result,
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
