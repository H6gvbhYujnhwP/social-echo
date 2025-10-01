import { z } from 'zod'

export const TextGenerationRequestSchema = z.object({
  business_name: z.string().min(1),
  industry: z.string().min(1),
  tone: z.enum(['professional', 'casual', 'funny', 'bold']),
  products_services: z.string().min(1),
  target_audience: z.string().min(1),
  keywords: z.string().optional().default(''),
  rotation: z.enum(['serious', 'quirky']),
  post_type: z.enum(['selling', 'informational', 'advice']),
  platform: z.enum(['linkedin', 'facebook']).optional().default('linkedin'),
})

export const TextGenerationResponseSchema = z.object({
  headline_options: z.array(z.string()).length(3),
  post_text: z.string(),
  hashtags: z.array(z.string()).min(6).max(8),
  visual_prompt: z.string(),
  best_time_uk: z.string().regex(/^\d{2}:\d{2}$/),
})

export const ImageGenerationRequestSchema = z.object({
  visual_prompt: z.string().min(1),
  industry: z.string().min(1),
  tone: z.string().min(1),
  style: z.enum(['meme', 'illustration', 'photo-real']).optional(),
})

export const ImageGenerationResponseSchema = z.object({
  image_base64: z.string().startsWith('data:image/'),
})

export type TextGenerationRequest = z.infer<typeof TextGenerationRequestSchema>
export type TextGenerationResponse = z.infer<typeof TextGenerationResponseSchema>
export type ImageGenerationRequest = z.infer<typeof ImageGenerationRequestSchema>
export type ImageGenerationResponse = z.infer<typeof ImageGenerationResponseSchema>

export function parseTextGenerationResponse(jsonString: string): TextGenerationResponse {
  try {
    const parsed = JSON.parse(jsonString)
    return TextGenerationResponseSchema.parse(parsed)
  } catch (error) {
    throw new Error(`Invalid text generation response: ${error}`)
  }
}
