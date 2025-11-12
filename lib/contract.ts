import { z } from 'zod'

export const TextGenerationRequestSchema = z.object({
  business_name: z.string().min(1),
  industry: z.string().min(1),
  tone: z.enum(['professional', 'casual', 'funny', 'bold']),
  products_services: z.string().min(1),
  target_audience: z.string().min(1),
  usp: z.string().optional().default(''),
  keywords: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((v) => {
      if (!v) return '';
      return Array.isArray(v) ? v.filter(Boolean).join(', ') : v;
    })
    .default(''),
  rotation: z.enum(['serious', 'quirky']),
  // Accept both canonical (v8.8) and legacy types for backward compatibility
  post_type: z.enum(['selling', 'information_advice', 'random', 'news', 'informational', 'advice'])
    .transform((val) => {
      // Normalize legacy types to canonical
      if (val === 'informational' || val === 'advice') {
        return 'information_advice';
      }
      return val;
    }),
  platform: z.enum(['linkedin', 'facebook']).optional().default('linkedin'),
  user_prompt: z.string().optional().default(''),
})

export const TextGenerationResponseSchema = z.object({
  headline_options: z.array(z.string()).length(3),
  post_text: z.string(),
  hashtags: z.array(z.string()).min(3).max(5),
  visual_prompt: z.string(),
  best_time_uk: z.string().regex(/^\d{2}:\d{2}$/),
  postId: z.string().optional(), // Post ID for feedback
})

export const ImageGenerationRequestSchema = z.object({
  visual_prompt: z.string().min(1),
  industry: z.string().min(1),
  tone: z.string().min(1),
  style: z.enum(['meme', 'illustration', 'photo-real', 'funny', 'controversial', 'conceptual', 'infographic']).optional(),
  // New fields for context-aware generation
  // Accept both canonical (v8.8) and legacy types for backward compatibility
  post_type: z.enum(['selling', 'information_advice', 'random', 'news', 'informational', 'advice'])
    .transform((val) => {
      // Normalize legacy types to canonical
      if (val === 'informational' || val === 'advice') {
        return 'information_advice';
      }
      return val;
    })
    .optional(),
  post_headline: z.string().optional(),
  post_text: z.string().optional(),
  // Text inclusion option (default: false)
  allow_text: z.boolean().optional().default(false),
  // Custom description flag (when user provides their own description)
  is_custom_description: z.boolean().optional().default(false),
  // Logo overlay option (default: false)
  apply_logo: z.boolean().optional().default(false),
})

export const ImageGenerationResponseSchema = z.object({
  image_base64: z.string().startsWith('data:image/'),
  image_type: z.string().optional(), // The actual type used (for feedback)
  generator: z.string().optional(), // Which generator was used (for debugging)
  original_image_base64: z.string().startsWith('data:image/').optional(), // Original image without logo (for re-applying logo)
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
