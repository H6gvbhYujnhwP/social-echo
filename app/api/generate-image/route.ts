import { NextRequest, NextResponse } from 'next/server'
import { generateImage } from '../../../lib/openai'
import { 
  ImageGenerationRequestSchema,
  type ImageGenerationResponse 
} from '../../../lib/contract'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request
    const validatedRequest = ImageGenerationRequestSchema.parse(body)
    
    // Build the image prompt
    const style = validatedRequest.style || 'illustration'
    const imagePrompt = `Create a scroll-stopping LinkedIn visual for a ${validatedRequest.industry} audience.
Concept: ${validatedRequest.visual_prompt}
Style: high-contrast, witty, minimal text, clean composition, room for overlay.
Tone: ${validatedRequest.tone}. Style mode: ${style}.
Orientation: square or 4:5 portrait. High resolution. Avoid brand logos or real people.`

    // Generate image with OpenAI
    const imageBase64 = await generateImage(imagePrompt)
    
    const response: ImageGenerationResponse = {
      image_base64: imageBase64
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Image generation error:', error)
    
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    )
  }
}
