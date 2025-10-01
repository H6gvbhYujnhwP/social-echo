import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { generateText } from '../../../lib/openai'
import { 
  TextGenerationRequestSchema, 
  parseTextGenerationResponse,
  type TextGenerationResponse 
} from '../../../lib/contract'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Extract force parameter
    const force = body.force || false
    
    // Validate request
    const validatedRequest = TextGenerationRequestSchema.parse(body)
    
    // Build the prompt
    const systemPrompt = `You are SOCIAL ECHO, a marketing copy expert for SMEs. You write crisp, tactical, story-first LinkedIn posts that read like Chris Donnelly: direct, practical, and engaging for busy professionals.
Always return STRICT JSON only; no markdown, no preamble.`

    // Define post structure based on type
    const getPostStructure = (postType: string) => {
      switch (postType) {
        case 'selling':
          return 'Hook → Pain → Benefit → Mini proof → CTA'
        case 'informational':
          return 'Hook → Context → 3 takeaways → Implication → Question'
        case 'advice':
          return 'Hook → Checklist/steps → Quick-win → Question'
        case 'news':
          return 'News headline → Summary (2-3 lines) → Analysis/Why it matters → Reflection/Question'
        default:
          return 'Hook → Context → Value → Question'
      }
    }

    const getHashtagFocus = (postType: string) => {
      switch (postType) {
        case 'selling':
          return 'Include sales-focused hashtags like #SMEGrowth #BusinessSolutions #ROI'
        case 'informational':
          return 'Include industry insight hashtags like #BusinessTrends #MarketInsights #SMENews'
        case 'advice':
          return 'Include actionable hashtags like #BusinessTips #SMEAdvice #Productivity'
        case 'news':
          return 'Include timely news hashtags like #BreakingNews #IndustryNews #CurrentEvents plus industry-specific tags'
        default:
          return 'Mix broad SME and niche targeting hashtags'
      }
    }

    // Vary output if force is true
    const seed = force ? crypto.randomBytes(4).toString('hex') : 'stable'

    const userPrompt = `Company: ${validatedRequest.business_name}
Industry: ${validatedRequest.industry}
Platform: ${validatedRequest.platform}
Tone: ${validatedRequest.tone} (obey this voice consistently)
Products/Services: ${validatedRequest.products_services}
Target Audience: ${validatedRequest.target_audience}
Keywords (weave naturally, not hashtag spam): ${validatedRequest.keywords || 'general business topics'}
Post Type: ${validatedRequest.post_type}
Seed: ${seed}

Task: Create a ${validatedRequest.platform} post in the style of Chris Donnelly — direct, tactical, problem-led, story-first.

Post Structure for ${validatedRequest.post_type} posts: ${getPostStructure(validatedRequest.post_type)}

${validatedRequest.post_type === 'news' ? `
Special Instructions for News Posts:
- Select a current news headline relevant to the ${validatedRequest.industry} industry
- Summarize the news in 2-3 simple lines
- Add analysis or commentary showing why this news matters to SMEs in the ${validatedRequest.industry} industry
- Keep tone professional, timely, and relevant
- If no truly relevant breaking news is found, fallback to "Industry Insight" style using recent trends or observations
- Ensure the news is recent (within the last few days or weeks)
` : ''}

Steps:
1) Provide 3 headline/title options (hooks) that fit the ${validatedRequest.post_type} structure.
2) Write the full ${validatedRequest.platform} post draft following the ${validatedRequest.post_type} structure with double spacing between sentences.
3) Add hashtags at the foot of the post (6–8). ${getHashtagFocus(validatedRequest.post_type)}.
4) Suggest 1 strong image concept that pairs with the ${validatedRequest.post_type} post.
5) Suggest the best time to post that day (UK time).

Content rotation: Alternate between:
- A serious SME business post (growth, challenges, solutions, success stories) when rotation is "serious"
- A funny/quirky business story (unusual situations, light-hearted takes, relatable moments) when rotation is "quirky"

Current rotation: ${validatedRequest.rotation}

Output format:
- Headline options (3 hooks that work for ${validatedRequest.post_type} posts)
- ${validatedRequest.platform} post draft following ${validatedRequest.post_type} structure
- Hashtags (6-8, optimized for ${validatedRequest.post_type} content)
- Visual concept
- Best time to post today

Return ONLY valid JSON with keys:
- headline_options (array of 3),
- post_text (string),
- hashtags (array of 6-8),
- visual_prompt (string),
- best_time_uk (string).`

    // Generate text with OpenAI
    let response = await generateText(`${systemPrompt}\n\n${userPrompt}`)
    
    // Try to parse the response
    let parsedResponse: TextGenerationResponse
    try {
      parsedResponse = parseTextGenerationResponse(response)
    } catch (parseError) {
      // Retry with a nudge if parsing fails
      const retryPrompt = `${systemPrompt}\n\n${userPrompt}\n\nReturn strict JSON only.`
      response = await generateText(retryPrompt)
      parsedResponse = parseTextGenerationResponse(response)
    }
    
    // Attach meta for debugging
    return NextResponse.json({
      ...parsedResponse,
      meta: { seed, force: !!force, ts: Date.now() }
    })
    
  } catch (error) {
    console.error('Text generation error:', error)
    
    if (error instanceof Error && error.message.includes('Invalid text generation response')) {
      return NextResponse.json(
        { error: 'Failed to generate valid response format' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
