import { NextRequest, NextResponse } from 'next/server'
import { generateText } from '@/lib/openai'
import { 
  TextGenerationRequestSchema, 
  parseTextGenerationResponse,
  type TextGenerationResponse 
} from '@/lib/contract'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request
    const validatedRequest = TextGenerationRequestSchema.parse(body)
    
    // Build the prompt
    const systemPrompt = `You are SOCIAL ECHO, a marketing copy expert for SMEs. You write crisp, tactical, story-first LinkedIn posts that read like Chris Donnelly: direct, practical, and engaging for busy professionals.
Always return STRICT JSON only; no markdown, no preamble.`

    const userPrompt = `Company: ${validatedRequest.business_name}
Industry: ${validatedRequest.industry}
Tone: ${validatedRequest.tone} (obey this voice consistently)
Products/Services: ${validatedRequest.products_services}
Target Audience: ${validatedRequest.target_audience}
Keywords (weave naturally, not hashtag spam): ${validatedRequest.keywords || 'general business topics'}

Rotation today: ${validatedRequest.rotation}   // "serious" or "quirky"

Task: Create a LinkedIn post in the style of Chris Donnelly — direct, tactical, problem-led, story-first.

Steps:
1) Provide 3 headline/title hooks.
2) Write the full LinkedIn post draft with DOUBLE SPACING between sentences, ending with a reflection or question.
3) Add 6–8 hashtags (mix broad SME finance reach and niche targeting).
4) Suggest ONE strong image concept that pairs with the post (visual only, no copy).
5) Suggest the best time to post today (UK time) as HH:MM.

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
    
    return NextResponse.json(parsedResponse)
    
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
