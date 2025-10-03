/**
 * AI Global Configuration
 * 
 * This file defines the configuration schema for AI generation.
 * Values are stored in the database (AdminConfig table) and can be
 * edited via the Master Admin panel at /admin/ai
 */

export type PostType = 'selling' | 'informational' | 'advice' | 'news'

export type AiGlobalConfig = {
  // Model settings
  textModel: string              // e.g., "gpt-4.1-mini", "gpt-4o-mini"
  temperature: number            // 0..1 (creativity vs consistency)
  
  // Generation defaults
  hashtagCountDefault: number    // Default number of hashtags (e.g., 8)
  allowedPostTypes: PostType[]   // Which post types are enabled
  ukPostingTimeHint: boolean     // Include best_time_uk in response?
  
  // Feature toggles
  includeHeadlineOptions: boolean  // Generate 3 headline options?
  includeVisualPrompt: boolean     // Generate image prompt?
  includeHashtags: boolean         // Generate hashtags?
  
  // Learning system weights
  weightPreferredTerms: number   // 0..1 - How much to weight user's preferred keywords
  weightDownvotedTones: number   // 0..1 - How much to avoid downvoted tones
  
  // News mode
  enableNewsMode: boolean        // Allow "news" post type?
  newsFallbackToInsight: boolean // If no news, generate insight instead?
}

export const DEFAULT_AI_GLOBALS: AiGlobalConfig = {
  // Model settings
  textModel: 'gpt-4.1-mini',
  temperature: 0.7,
  
  // Generation defaults
  hashtagCountDefault: 8,
  allowedPostTypes: ['selling', 'informational', 'advice', 'news'],
  ukPostingTimeHint: true,
  
  // Feature toggles
  includeHeadlineOptions: true,
  includeVisualPrompt: true,
  includeHashtags: true,
  
  // Learning weights
  weightPreferredTerms: 0.6,
  weightDownvotedTones: 0.5,
  
  // News mode
  enableNewsMode: true,
  newsFallbackToInsight: true,
}

/**
 * Zod schema for validation (used in admin API)
 */
import { z } from 'zod'

export const AiGlobalConfigSchema = z.object({
  textModel: z.string().min(1),
  temperature: z.number().min(0).max(1),
  hashtagCountDefault: z.number().int().min(3).max(12),
  allowedPostTypes: z.array(z.enum(['selling', 'informational', 'advice', 'news'])),
  ukPostingTimeHint: z.boolean(),
  includeHeadlineOptions: z.boolean(),
  includeVisualPrompt: z.boolean(),
  includeHashtags: z.boolean(),
  weightPreferredTerms: z.number().min(0).max(1),
  weightDownvotedTones: z.number().min(0).max(1),
  enableNewsMode: z.boolean(),
  newsFallbackToInsight: z.boolean(),
})
