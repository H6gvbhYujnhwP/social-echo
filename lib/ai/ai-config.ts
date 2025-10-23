/**
 * AI Global Configuration
 * 
 * This file defines the configuration schema for AI generation.
 * Values are stored in the database (AdminConfig table) and can be
 * edited via the Master Admin panel at /admin/ai
 */

// PostType includes both canonical (v8.8) and legacy types for backward compatibility
// Canonical: selling, information_advice, random, news
// Legacy: informational, advice (normalized to information_advice at runtime)
export type PostType = 'selling' | 'information_advice' | 'random' | 'news' | 'informational' | 'advice'

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
  
  // Master Prompt Template
  masterPromptTemplate: string   // Long-form instruction prompt for generation
  
  // Daily Topic Rotation
  rotation: {
    enabled: boolean
    mode: 'daily'
    buckets: string[]            // e.g., ['serious_sme_finance', 'funny_finance_story']
    timezone: string             // e.g., 'Europe/London'
    diversityWindowDays: number  // Days to check for recent bucket usage
  }
  
  // Randomness (Temperature Jitter)
  randomness: {
    enabled: boolean
    temperatureMin: number       // Min temperature (0.0-2.0)
    temperatureMax: number       // Max temperature (0.0-2.0)
  }
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
  
  // Master Prompt Template
  masterPromptTemplate: `Task: Create a LinkedIn post in the style of Chris Donnelly — direct, tactical, problem-led, story-first.

Steps:
1. Provide 3 headline/title options (hooks).
2. Write the full LinkedIn post draft with double spacing between sentences, ending in a reflection or question.
3. Add hashtags at the foot of the post (6–8, mixing broad SME finance reach and niche targeting).
4. Suggest 1 strong image concept that pairs with the post.
5. Suggest the best time to post that day (UK time).

Content rotation: Alternate between:
- A serious SME finance post (cashflow, staff, late payments, interest rates, growth, resilience).
- A funny/quirky finance industry story (weird leases, unusual loans, absurd expenses, strange finance deals).

Output format:
- Headline options
- LinkedIn post draft
- Hashtags
- Visual concept
- Best time to post today`,
  
  // Daily Topic Rotation
  rotation: {
    enabled: true,
    mode: 'daily',
    buckets: ['serious_sme_finance', 'funny_finance_story'],
    timezone: 'Europe/London',
    diversityWindowDays: 7
  },
  
  // Randomness (Temperature Jitter)
  randomness: {
    enabled: true,
    temperatureMin: 0.6,
    temperatureMax: 0.9
  }
}

/**
 * Zod schema for validation (used in admin API)
 */
import { z } from 'zod'

export const AiGlobalConfigSchema = z.object({
  textModel: z.string().min(1),
  temperature: z.number().min(0).max(2),
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
  
  // New fields
  masterPromptTemplate: z.string().min(10),
  rotation: z.object({
    enabled: z.boolean(),
    mode: z.literal('daily'),
    buckets: z.array(z.string()).min(1),
    timezone: z.string(),
    diversityWindowDays: z.number().int().min(1).max(30)
  }),
  randomness: z.object({
    enabled: z.boolean(),
    temperatureMin: z.number().min(0).max(2),
    temperatureMax: z.number().min(0).max(2)
  }).refine(data => data.temperatureMin <= data.temperatureMax, {
    message: "temperatureMin must be less than or equal to temperatureMax"
  })
})
