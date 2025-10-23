/**
 * AI Service v8.8 - Country-Aware Generation with Diversity Engine
 * 
 * New generation service that integrates:
 * - Country-aware prompt building
 * - Diversity engine for reduced repetition
 * - Random data and news providers
 * - Post type restructure (information_advice, random)
 */

import { prisma } from '../prisma'
import { AiGlobalConfig, DEFAULT_AI_GLOBALS, PostType } from './ai-config'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { 
  buildSellingPrompt, 
  buildInfoAdvicePrompt, 
  buildRandomPrompt, 
  buildNewsPrompt,
  type GenInputs 
} from './prompt-builder'
import { 
  generateDiversityParams, 
  checkRepetition, 
  containsBannedPhrases,
  type StyleVariation
} from './diversity'
import { pickRandomSource } from './random-data'
import { getCuratedNews, formatNewsForPrompt } from './news-provider'
import { normalizePostType } from '../post-type-mapping'
import type { ProfileData, GeneratedDraft, LearningSignals, GenerationTwists } from './ai-service'

// Re-export types for convenience
export type { ProfileData, GeneratedDraft, LearningSignals, GenerationTwists }

// In-memory cache for config (5-minute TTL)
let configCache: { config: AiGlobalConfig; timestamp: number } | null = null
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Load AI configuration from database with caching
 */
async function loadAiConfig(): Promise<AiGlobalConfig> {
  // Check cache
  if (configCache && Date.now() - configCache.timestamp < CACHE_TTL) {
    return configCache.config
  }
  
  try {
    // Load from database
    const adminConfig = await prisma.adminConfig.findUnique({
      where: { key: 'ai_globals' }
    })
    
    if (adminConfig && adminConfig.json) {
      const config = adminConfig.json as AiGlobalConfig
      configCache = { config, timestamp: Date.now() }
      return config
    }
  } catch (error) {
    console.error('[ai-service-v8.8] Failed to load config from DB:', error)
  }
  
  // Fallback to defaults
  return DEFAULT_AI_GLOBALS
}

/**
 * Build generation inputs from profile
 */
function buildGenInputs(
  profile: ProfileData,
  tone: string,
  keywords: string[],
  twists?: GenerationTwists
): GenInputs {
  return {
    businessName: profile.business_name,
    sector: profile.industry,
    audience: profile.target_audience,
    country: profile.country || undefined,
    brandTone: tone as StyleVariation,
    keywords,
    usp: profile.usp,
    productsServices: profile.products_services,
    website: profile.website || undefined,
    notes: twists?.note,
    originalPost: twists?.originalPost
  }
}

/**
 * Build and generate a LinkedIn post draft (v8.8)
 * 
 * New generation logic with country awareness and diversity engine.
 */
export async function buildAndGenerateDraftV8(opts: {
  userId: string
  postType: PostType
  profile: ProfileData
  plannerType?: string
  learningSignals?: LearningSignals
  twists?: GenerationTwists
  useDiversityEngine?: boolean  // Default: true
}): Promise<GeneratedDraft> {
  
  console.log('[ai-service-v8.8] Starting generation for user:', opts.userId)
  console.log('[ai-service-v8.8] Post type:', opts.postType, 'Country:', opts.profile.country || 'none')
  
  // 1. Load AI configuration
  const config = await loadAiConfig()
  console.log('[ai-service-v8.8] Loaded config:', { model: config.textModel, temp: config.temperature })
  
  // 2. Normalize post type (handle legacy keys)
  const normalizedPostType = normalizePostType(opts.postType)
  console.log('[ai-service-v8.8] Normalized post type:', opts.postType, '→', normalizedPostType)
  
  // 3. Determine effective tone
  let effectiveTone = opts.profile.tone
  if (opts.twists?.toneOverride) {
    effectiveTone = opts.twists.toneOverride
  }
  
  // 4. Merge keywords
  const allKeywords = [
    ...opts.profile.keywords,
    ...(opts.learningSignals?.preferredTerms || []),
    ...(opts.twists?.extraKeywords || [])
  ]
  const uniqueKeywords = [...new Set(allKeywords)]
  
  // 5. Build generation inputs
  const genInputs = buildGenInputs(opts.profile, effectiveTone, uniqueKeywords, opts.twists)
  
  // 6. Get diversity parameters (if enabled)
  const useDiversity = opts.useDiversityEngine !== false
  let diversityParams: any = null
  
  if (useDiversity) {
    const seed = Date.now() % 1000
    diversityParams = await generateDiversityParams(opts.userId, seed)
    console.log('[ai-service-v8.8] Diversity params:', diversityParams)
    
    // Override tone with diversity style
    genInputs.brandTone = diversityParams.style
  }
  
  // 7. Build prompt based on post type
  let finalPrompt: string
  
  switch (normalizedPostType) {
    case 'selling':
      finalPrompt = buildSellingPrompt(genInputs)
      break
      
    case 'information_advice':
      finalPrompt = buildInfoAdvicePrompt(genInputs)
      break
      
    case 'random':
      // Get random source
      const randomSeed = Date.now() % 1000
      const randomSource = pickRandomSource(randomSeed, opts.profile.country || undefined)
      console.log('[ai-service-v8.8] Random source:', randomSource.title)
      finalPrompt = buildRandomPrompt(genInputs, randomSource)
      break
      
    case 'news':
      // Get curated news
      const newsResult = getCuratedNews(
        opts.profile.industry,
        opts.profile.country || undefined,
        { limit: 6, minScore: 5 }
      )
      
      console.log('[ai-service-v8.8] News result:', {
        hasRelevant: newsResult.hasRelevant,
        count: newsResult.snippets.length,
        fallbackReason: newsResult.fallbackReason
      })
      
      const newsHeadlines = newsResult.hasRelevant
        ? formatNewsForPrompt(newsResult.snippets)
        : []
      
      finalPrompt = buildNewsPrompt(genInputs, newsHeadlines)
      break
      
    default:
      // Fallback to information_advice for unknown types
      console.warn('[ai-service-v8.8] Unknown post type:', normalizedPostType, '- falling back to information_advice')
      finalPrompt = buildInfoAdvicePrompt(genInputs)
  }
  
  // 8. Load model mapping utilities
  const { getModelId, getModelInfo } = await import('./model-mapping')
  const { calculateTemperature, calculateMaxTokens } = await import('./generation-utils')
  const { withRetry } = await import('./retry-utils')
  
  let modelId: string
  let modelInfo: any
  
  try {
    modelId = getModelId(config.textModel)
    modelInfo = getModelInfo(config.textModel)
    console.log('[ai-service-v8.8] Model:', { label: config.textModel, id: modelId, provider: modelInfo.provider })
  } catch (error: any) {
    console.error('[ai-service-v8.8] Model mapping error:', error.message)
    throw error
  }
  
  // 9. Calculate temperature (use diversity params if available)
  const temperature = diversityParams?.temperature || config.temperature
  const topP = diversityParams?.topP || 0.92
  
  console.log('[ai-service-v8.8] Generation params:', {
    temperature: temperature.toFixed(3),
    topP: topP.toFixed(3)
  })
  
  // 10. Calculate token budget
  const systemPrompt = 'You are an expert LinkedIn content strategist. Generate engaging, professional posts that drive engagement.'
  const tokenBudget = calculateMaxTokens({
    modelMaxTokens: modelInfo.maxTokens,
    systemPrompt,
    userPrompt: finalPrompt,
    safetyMargin: 500
  })
  
  console.log('[ai-service-v8.8] Token budget:', {
    input: tokenBudget.inputTokens,
    maxOutput: tokenBudget.maxTokens,
    budgetUsed: `${tokenBudget.budgetUsed.toFixed(1)}%`
  })
  
  // 11. Call AI model with retry logic
  const generationStartTime = Date.now()
  
  const result = await withRetry(async (attempt, useFallback) => {
    let attemptModel = modelId
    let attemptProvider = modelInfo.provider
    
    if (useFallback) {
      attemptModel = 'gpt-4o-mini'
      attemptProvider = 'openai'
      console.log('[ai-service-v8.8] Using fallback model:', attemptModel)
    }
    
    console.log(`[ai-service-v8.8] Attempt ${attempt} with ${attemptProvider}:${attemptModel}`)
    
    let rawResponse: string
    
    if (attemptProvider === 'openai') {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      
      const completion = await openai.chat.completions.create({
        model: attemptModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: finalPrompt }
        ],
        temperature,
        top_p: topP,
        max_tokens: tokenBudget.maxTokens
      })
      
      rawResponse = completion.choices[0]?.message?.content || ''
      
    } else if (attemptProvider === 'anthropic') {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
      
      const message = await anthropic.messages.create({
        model: attemptModel,
        max_tokens: tokenBudget.maxTokens,
        temperature,
        top_p: topP,
        system: systemPrompt,
        messages: [
          { role: 'user', content: finalPrompt }
        ]
      })
      
      const content = message.content[0]
      rawResponse = content.type === 'text' ? content.text : ''
      
    } else {
      throw new Error(`Unsupported provider: ${attemptProvider}`)
    }
    
    // Parse JSON response
    const cleaned = rawResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim()
    const parsed = JSON.parse(cleaned)
    
    // Validate required fields
    if (!parsed.headline_options || !parsed.post_text || !parsed.hashtags || !parsed.visual_prompt) {
      throw new Error('Missing required fields in AI response')
    }
    
    return parsed as GeneratedDraft
    
  }, {
    maxRetries: 2,
    timeoutMs: 45000,
    backoffMultiplier: 2,
    fallbackModel: 'gpt-4o-mini'
  })
  
  // Check if generation succeeded
  if (!result.success || !result.data) {
    console.error('[ai-service-v8.8] Generation failed after all retries:', result.error?.message)
    throw result.error || new Error('Generation failed')
  }
  
  const draft = result.data
  console.log('[ai-service-v8.8] Generation completed in', result.totalDurationMs, 'ms')
  console.log('[ai-service-v8.8] Attempts:', result.attempts, 'Fallback used:', result.fallbackUsed)
  
  // 13. Apply diversity checks (if enabled)
  if (useDiversity) {
    const diversityCheck = await checkRepetition(opts.userId, draft.post_text, 20)
    console.log('[ai-service-v8.8] Diversity check:', {
      isRepetitive: diversityCheck.isRepetitive,
      maxOverlap: diversityCheck.maxOverlap.toFixed(1) + '%',
      avgOverlap: diversityCheck.averageOverlap.toFixed(1) + '%'
    })
    
    const bannedCheck = containsBannedPhrases(draft.post_text)
    if (bannedCheck.hasBanned) {
      console.warn('[ai-service-v8.8] Contains banned phrases:', bannedCheck.found)
    }
  }
  
  return draft
}

