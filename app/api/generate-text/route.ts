import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
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
    
    // Extract force parameter
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
    
    // Use default values (learning will be client-side)
    const effectiveTone = validatedRequest.tone
    const effectiveHashtagCount = 8
    
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
          return 'Hook → Checklist (3-5 items) → Quick-win → Question'
        case 'news':
          return 'News headline → Summary (2-3 lines) → Analysis/Why it matters → Reflection/Question'
        default:
          return 'Hook → Body → CTA'
      }
    }

    // Define hashtag focus based on post type
    const getHashtagFocus = (postType: string) => {
      switch (postType) {
        case 'selling':
          return 'Use conversion-focused hashtags like #BusinessGrowth #SMESuccess #DigitalTransformation'
        case 'informational':
          return 'Use educational hashtags like #BusinessTips #Leadership #Strategy'
        case 'advice':
          return 'Use actionable hashtags like #BusinessAdvice #Productivity #SmallBusinessTips'
        case 'news':
          return 'Use timely hashtags like #BreakingNews #IndustryNews #CurrentEvents plus sector-specific tags'
        default:
          return 'Use relevant industry and topic hashtags'
      }
    }

    // Generate random seed for variation if force is true
    let seed = ''
    if (force) {
      seed = crypto.randomBytes(8).toString('hex')
    }

    const userPrompt = `Business Name: ${validatedRequest.business_name}
Industry: ${validatedRequest.industry}
Tone: ${effectiveTone} (obey this voice consistently)
Products/Services: ${validatedRequest.products_services}
Target Audience: ${validatedRequest.target_audience}
USP (Unique Selling Point): ${validatedRequest.usp || 'Not provided'}
Keywords (weave naturally, not hashtag spam): ${validatedRequest.keywords || 'general business topics'}
Post Type: ${validatedRequest.post_type}
Seed: ${seed}

IMPORTANT: When creating ${validatedRequest.post_type} posts (especially "informational" and "selling" types), ALWAYS keep the company's USP in mind:
- For SELLING posts: Subtly weave in the USP to differentiate from competitors and highlight unique value
- For INFORMATIONAL posts: Position insights in a way that demonstrates the company's unique expertise and approach
- For ADVICE posts: Frame recommendations that align with the company's unique methodology or philosophy
- For NEWS posts: Analyze how industry news specifically impacts or validates the company's unique positioning

The USP should inform the perspective and angle of every post, making it clear why THIS company is uniquely qualified to discuss the topic.

Task: Create a ${validatedRequest.platform} post in the style of Chris Donnelly — direct, tactical, problem-led, story-first.

Post Structure for ${validatedRequest.post_type} posts: ${getPostStructure(validatedRequest.post_type)}

${validatedRequest.post_type === 'news' ? `
Special Instructions for News Posts:
- Select a GLOBAL or LOCAL top headline that is HIGHLY RELEVANT to the ${validatedRequest.industry} sector (NOT news about ${validatedRequest.business_name} itself)
- The news MUST relate directly to their business context:
  * Industry: ${validatedRequest.industry}
  * Products/Services: ${validatedRequest.products_services}
  * Target Audience: ${validatedRequest.target_audience}
  * Keywords: ${validatedRequest.keywords || 'general business topics'}
- Focus on external news that IMPACTS their specific sector: regulatory changes affecting their services, market trends in their niche, economic indicators relevant to their customers, technology/policy changes in their field
- Examples for a finance SME: "Bank of England raises rates" (affects lending), "New FCA regulations" (compliance), "SME loan defaults rise 15%" (market trend)
- Examples for a tech SME: "New AI regulations announced", "GDPR fines increase 40%", "Cloud computing costs drop 20%"
- DO NOT create news about the customer's business - focus on external industry news that directly affects their sector and services
- Summarize the news in 2-3 simple lines
- Add analysis or commentary showing why this specific news matters to SMEs like ${validatedRequest.business_name} in the ${validatedRequest.industry} industry
- Keep tone professional, timely, and relevant
- If no truly relevant breaking news is found, fallback to "Industry Insight" style using recent trends or observations specific to their sector
- Ensure the news is recent (within the last few days or weeks) and directly applicable to their business context
` : ''}

Steps:
1) Provide 3 headline/title options (hooks) that fit the ${validatedRequest.post_type} structure.
2) Write the full ${validatedRequest.platform} post draft following the ${validatedRequest.post_type} structure with double spacing between sentences.
3) Add hashtags at the foot of the post (approximately ${effectiveHashtagCount}). ${getHashtagFocus(validatedRequest.post_type)}.
4) Suggest 1 strong image concept that pairs with the ${validatedRequest.post_type} post.
   CRITICAL: The visual concept MUST accurately match the post content:
   - If the post mentions a specific person by name (e.g., "Sarah"), the visual MUST describe that exact person with correct gender and context
   - If the post describes a woman, the visual must explicitly say "woman" or "female professional"
   - If the post describes a man, the visual must explicitly say "man" or "male professional"
   - Include specific details from the post: profession (e.g., "legal firm owner"), setting (e.g., "law office"), scenario (e.g., "reviewing contracts")
   - Match the emotional arc: if post shows before/after, visual should show transformation
   - Keep it catchy and social media-friendly while being accurate
5) Suggest the best time to post based on ${validatedRequest.target_audience} and ${validatedRequest.industry} (UK timezone).

Return JSON:
{
  "headline_options": ["...", "...", "..."],
  "post_text": "...",
  "hashtags": ["...", "..."],
  "visual_prompt": "...",
  "best_time_uk": "HH:MM"
}`

    // Call OpenAI with error handling
    let rawResponse: string
    try {
      const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`
      rawResponse = await generateText(combinedPrompt)
    } catch (openaiError: any) {
      console.error('[generate-text] OpenAI API error:', openaiError?.message, openaiError?.stack)
      return NextResponse.json(
        { 
          error: 'Failed to generate content from AI',
          details: openaiError?.message || 'Unknown OpenAI error'
        },
        { status: 502 }
      )
    }
    
    // Parse and validate response
    let parsed: TextGenerationResponse
    try {
      parsed = parseTextGenerationResponse(rawResponse)
    } catch (parseError: any) {
      console.error('[generate-text] Response parsing error:', parseError?.message)
      console.error('[generate-text] Raw response:', rawResponse?.substring(0, 500))
      return NextResponse.json(
        { 
          error: 'Failed to parse AI response',
          details: parseError?.message || 'Invalid response format'
        },
        { status: 502 }
      )
    }
    
    // Return with metadata
    return NextResponse.json({
      ...parsed,
      meta: {
        seed: seed || null,
        force: force
      }
    })
    
  } catch (error: any) {
    // Catch-all error handler
    console.error('[generate-text] Unexpected error:', error?.message, error?.stack)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}
