import { NextRequest, NextResponse } from 'next/server'
import { generateImage } from '../../../lib/openai'
import { 
  ImageGenerationRequestSchema,
  type ImageGenerationResponse 
} from '../../../lib/contract'
import { generateImagePrompt, getDefaultImageTypeForPostType } from '../../../lib/ai/image-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request
    const validatedRequest = ImageGenerationRequestSchema.parse(body)
    
    // Determine image type (use provided or auto-select)
    let imageType: string = validatedRequest.style || 'illustration'
    
    // If post content is provided, auto-select based on post type
    if (validatedRequest.post_type && validatedRequest.post_text) {
      const autoSelected = getDefaultImageTypeForPostType(
        validatedRequest.post_type,
        validatedRequest.post_text
      )
      console.log('[generate-image] Auto-selected image type:', autoSelected, 'for post type:', validatedRequest.post_type)
      // Only use auto-selection if no explicit style was provided
      if (!validatedRequest.style) {
        imageType = autoSelected as string
      }
    }
    
    // Generate context-aware prompt if we have post content
    let imagePrompt: string
    
    if (validatedRequest.post_headline && validatedRequest.post_text) {
      // Use new context-aware prompt generator
      imagePrompt = await generateImagePrompt({
        type: imageType,
        postHeadline: validatedRequest.post_headline,
        postText: validatedRequest.post_text
      })
      console.log('[generate-image] Generated context-aware prompt for type:', imageType)
    } else {
      // Fallback to legacy prompt format
      imagePrompt = `Create a scroll-stopping LinkedIn visual for a ${validatedRequest.industry} audience.
Concept: ${validatedRequest.visual_prompt}
Style: high-contrast, witty, minimal text, clean composition, room for overlay.
Tone: ${validatedRequest.tone}. Style mode: ${imageType}.
Orientation: square or 4:5 portrait. High resolution. Avoid brand logos or real people.`
      console.log('[generate-image] Using legacy prompt format')
    }

    console.log('[generate-image] Final image type:', imageType)
    console.log('[generate-image] Prompt length:', imagePrompt.length, 'characters')
    
    // Generate image with OpenAI
    const imageBase64 = await generateImage(imagePrompt)
    
    const response: ImageGenerationResponse = {
      image_base64: imageBase64,
      image_type: imageType
    }
    
    return NextResponse.json(response)
    
  } catch (error: any) {
    console.error('[generate-image] Error:', error)
    
    // Better error messages
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to generate image', details: error.message },
      { status: 500 }
    )
  }
}
