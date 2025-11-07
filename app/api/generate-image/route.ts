import { NextRequest, NextResponse } from 'next/server'
import { generateImage, analyzeImageForText } from '../../../lib/openai'
import { generateFluxProImage, generateIdeogramImage } from '../../../lib/replicate-image'
import { 
  ImageGenerationRequestSchema,
  type ImageGenerationResponse 
} from '../../../lib/contract'
import { generateImagePrompt, getDefaultImageTypeForPostType } from '../../../lib/ai/image-service'

/**
 * Detect text in image using OpenAI Vision API
 * Replaces the disabled OCR library to enable proper text detection and retry logic
 * 
 * Returns detected text and whether it's acceptable
 */
async function detectTextInImage(imageBase64: string): Promise<{
  hasText: boolean
  detectedText: string
  isAcceptable: boolean
  wordCount: number
  hasNonEnglish: boolean
}> {
  // Use OpenAI Vision API for text detection
  console.log('[vision-api] Analyzing image for text...')
  return await analyzeImageForText(imageBase64)
  
  /* ORIGINAL OCR CODE - DISABLED DUE TO WORKER ISSUES
  try {
    // Convert base64 to buffer
    const imageBuffer = Buffer.from(imageBase64.replace(/^data:image\/\w+;base64,/, ''), 'base64')
    
    // Perform OCR using server-side mode (no workers)
    const { data: { text } } = await Tesseract.recognize(
      imageBuffer,
      'eng',
      {
        logger: () => {}, // Disable logging
      }
    )
    
    const detectedText = text.trim()
    const hasText = detectedText.length > 0
    
    if (!hasText) {
      return {
        hasText: false,
        detectedText: '',
        isAcceptable: true,
        wordCount: 0,
        hasNonEnglish: false
      }
    }
    
    // Count words
    const words = detectedText.split(/\s+/).filter(w => w.length > 0)
    const wordCount = words.length
    
    // Check for non-English characters (non-ASCII or non-alphabetic)
    const hasNonEnglish = /[^\x00-\x7F]/.test(detectedText) || 
                          !/^[a-zA-Z0-9\s.,!?'-]+$/.test(detectedText)
    
    // Text is acceptable if:
    // - It's English (no non-ASCII)
    // - It's 5 words or fewer
    const isAcceptable = !hasNonEnglish && wordCount <= 5
    
    return {
      hasText: true,
      detectedText,
      isAcceptable,
      wordCount,
      hasNonEnglish
    }
  } catch (error) {
    console.error('[OCR] Error detecting text:', error)
    // On OCR error, assume text is acceptable to avoid blocking generation
    return {
      hasText: false,
      detectedText: '',
      isAcceptable: true,
      wordCount: 0,
      hasNonEnglish: false
    }
  }
  */
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  let telemetry = {
    textDetected: false,
    retry: false,
    finalHasText: false,
    firstAttemptText: '',
    secondAttemptText: '',
    ocrDuration: 0,
    totalDuration: 0
  }
  
  try {
    // Check authentication
    const { getServerSession } = await import('next-auth')
    const { authOptions } = await import('@/lib/auth')
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const userId = (session.user as any).id
    
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
    
    // Check if text is allowed (default: false)
    const allowText = validatedRequest.allow_text === true
    
    // CRITICAL: When checkbox is unchecked, use strict mode to completely forbid text
    // When checkbox is checked, allow text with quality controls
    const strictMode = !allowText
    
    // Generate context-aware prompt if we have post content
    let imagePrompt: string
    
    if (validatedRequest.post_headline && validatedRequest.post_text) {
      // Use new context-aware prompt generator
      imagePrompt = await generateImagePrompt({
        type: imageType,
        postHeadline: validatedRequest.post_headline,
        postText: validatedRequest.post_text,
        allowText,
        strictMode
      })
      console.log('[generate-image] Generated context-aware prompt for type:', imageType)
    } else {
      // Fallback to legacy prompt format with no-text rules
      imagePrompt = `Create a scroll-stopping LinkedIn visual for a ${validatedRequest.industry} audience.
Concept: ${validatedRequest.visual_prompt}
Style: high-contrast, witty, clean composition, room for overlay.
Tone: ${validatedRequest.tone}. Style mode: ${imageType}.
Orientation: square or 4:5 portrait. High resolution. Avoid brand logos or real people.

IMPORTANT: Do NOT include any text, letters, words, logos, watermarks, or typographic elements inside the image.
If text is absolutely unavoidable, use short English only (max 3-5 words).`
      console.log('[generate-image] Using legacy prompt format')
    }

    console.log('[generate-image] Final image type:', imageType)
    console.log('[generate-image] Prompt length:', imagePrompt.length, 'characters')
    console.log('[generate-image] Allow text:', allowText)
    
    // Route to appropriate image generator based on style
    let imageBase64: string
    let generatorUsed = 'dall-e-3' // Track which generator was actually used
    
    if (imageType === 'photo-real') {
      console.log('[generate-image] Attempting Flux Pro 1.1 for photorealistic image')
      try {
        imageBase64 = await generateFluxProImage(imagePrompt)
        generatorUsed = 'flux-pro-1.1'
        console.log('[generate-image] ✅ Successfully generated with Flux Pro 1.1')
      } catch (error: any) {
        console.error('[generate-image] ❌ Flux Pro failed:', error.message)
        console.log('[generate-image] Falling back to DALL-E 3')
        imageBase64 = await generateImage(imagePrompt)
        generatorUsed = 'dall-e-3-fallback'
      }
    } else if (imageType === 'infographic') {
      console.log('[generate-image] Attempting Ideogram v3 Turbo for infographic')
      try {
        imageBase64 = await generateIdeogramImage(imagePrompt)
        generatorUsed = 'ideogram-v3-turbo'
        console.log('[generate-image] ✅ Successfully generated with Ideogram v3 Turbo')
      } catch (error: any) {
        console.error('[generate-image] ❌ Ideogram failed:', error.message)
        console.log('[generate-image] Falling back to DALL-E 3')
        imageBase64 = await generateImage(imagePrompt)
        generatorUsed = 'dall-e-3-fallback'
      }
    } else {
      console.log('[generate-image] Using DALL-E 3 for', imageType)
      imageBase64 = await generateImage(imagePrompt)
      generatorUsed = 'dall-e-3'
    }
    
    console.log('[generate-image] Final generator used:', generatorUsed)
    
    // Only perform text detection if text is NOT allowed (checkbox unchecked)
    // When allowText=true, user wants text, so skip detection to save API calls
    if (!allowText) {
      const ocrStartTime = Date.now()
      const textCheck = await detectTextInImage(imageBase64)
      telemetry.ocrDuration = Date.now() - ocrStartTime
      telemetry.textDetected = textCheck.hasText
      telemetry.firstAttemptText = textCheck.detectedText
      
      console.log('[generate-image] Vision API result:', {
        hasText: textCheck.hasText,
        wordCount: textCheck.wordCount,
        hasNonEnglish: textCheck.hasNonEnglish,
        isAcceptable: textCheck.isAcceptable,
        detectedText: textCheck.detectedText.substring(0, 100)
      })
      
      // If text is detected and not acceptable, retry with strict mode
      if (textCheck.hasText && !textCheck.isAcceptable) {
      console.log('[generate-image] Text not acceptable, retrying with strict mode...')
      telemetry.retry = true
      
      // Generate strict prompt
      let strictPrompt: string
      if (validatedRequest.post_headline && validatedRequest.post_text) {
        strictPrompt = await generateImagePrompt({
          type: imageType,
          postHeadline: validatedRequest.post_headline,
          postText: validatedRequest.post_text,
          allowText: false,
          strictMode: true
        })
      } else {
        strictPrompt = imagePrompt + `\n\nSTRICT OVERRIDE: Do not include any letters, words, or text of any kind. Render blank signs/labels with shapes only.`
      }
      
      // Retry generation with appropriate generator
      if (imageType === 'photo-real') {
        try {
          imageBase64 = await generateFluxProImage(strictPrompt)
          generatorUsed = 'flux-pro-1.1-retry'
        } catch (error: any) {
          console.error('[generate-image] ❌ Flux Pro retry failed:', error.message)
          imageBase64 = await generateImage(strictPrompt)
          generatorUsed = 'dall-e-3-fallback-retry'
        }
      } else if (imageType === 'infographic') {
        try {
          imageBase64 = await generateIdeogramImage(strictPrompt)
          generatorUsed = 'ideogram-v3-turbo-retry'
        } catch (error: any) {
          console.error('[generate-image] ❌ Ideogram retry failed:', error.message)
          imageBase64 = await generateImage(strictPrompt)
          generatorUsed = 'dall-e-3-fallback-retry'
        }
      } else {
        imageBase64 = await generateImage(strictPrompt)
        generatorUsed = 'dall-e-3-retry'
      }
      
      // Check again
      const secondCheck = await detectTextInImage(imageBase64)
      telemetry.secondAttemptText = secondCheck.detectedText
      telemetry.finalHasText = secondCheck.hasText
      
        console.log('[generate-image] Second attempt Vision API result:', {
          hasText: secondCheck.hasText,
          wordCount: secondCheck.wordCount,
          detectedText: secondCheck.detectedText.substring(0, 100)
        })
      } else {
        telemetry.finalHasText = textCheck.hasText
      }
    } else {
      // Text is allowed, skip detection
      console.log('[generate-image] Text detection skipped (allowText=true)')
      telemetry.finalHasText = false
    }
    
    telemetry.totalDuration = Date.now() - startTime
    
    // Log telemetry
    console.log('[generate-image] Telemetry:', telemetry)
    
    const response: ImageGenerationResponse = {
      image_base64: imageBase64,
      image_type: imageType,
      generator: generatorUsed // Add for debugging
    }
    
    return NextResponse.json(response)
    
  } catch (error: any) {
    console.error('[generate-image] Error:', error)
    telemetry.totalDuration = Date.now() - startTime
    console.log('[generate-image] Telemetry (error):', telemetry)
    
    // Better error messages
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    // Handle OpenAI content policy violations
    if (error.code === 'content_policy_violation' || error.type === 'image_generation_user_error') {
      return NextResponse.json(
        { 
          error: error.error?.message || error.message || 'Content policy violation: Your image prompt was rejected by the safety system. Try adjusting your content or generating a new post.',
          code: 'content_policy_violation'
        },
        { status: 400 }
      )
    }
    
    // Generic error with details
    return NextResponse.json(
      { error: error.message || 'Failed to generate image' },
      { status: 500 }
    )
  }
}

