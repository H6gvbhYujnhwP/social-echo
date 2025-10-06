/**
 * AI Service - Centralized Draft Generation
 * 
 * Single entry point for all AI generation logic.
 * Loads configuration from database, applies learning signals,
 * builds prompts, and calls OpenAI or Anthropic.
 */

import { prisma } from '../prisma'
import { AiGlobalConfig, DEFAULT_AI_GLOBALS, PostType } from './ai-config'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

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
    console.error('[ai-service] Failed to load config from DB:', error)
  }
  
  // Fallback to defaults
  return DEFAULT_AI_GLOBALS
}

/**
 * Bust the config cache (call after admin saves new config)
 */
export function bustConfigCache() {
  configCache = null
}

/**
 * Learning signals from feedback analysis
 */
export type LearningSignals = {
  preferredTerms?: string[]
  downvotedTones?: string[]
  reduceHashtags?: boolean
  preferredHashtagCount?: number
}

/**
 * Customization twists (user overrides)
 */
export type GenerationTwists = {
  toneOverride?: string
  extraKeywords?: string[]
  note?: string
}

/**
 * Profile data (from database)
 */
export type ProfileData = {
  business_name: string
  industry: string
  tone: string
  products_services: string
  target_audience: string
  usp: string
  keywords: string[]
  website?: string | null
  rotation?: string | null
}

/**
 * Generated draft (canonical shape)
 */
export type GeneratedDraft = {
  headline_options: string[]
  post_text: string
  hashtags: string[]
  visual_prompt: string
  best_time_uk: string
}

/**
 * Build and generate a LinkedIn post draft
 * 
 * This is the single entry point for all generation logic.
 */
export async function buildAndGenerateDraft(opts: {
  userId: string
  postType: PostType
  profile: ProfileData
  plannerType?: string  // 'auto' resolves to today's planner type
  learningSignals?: LearningSignals
  twists?: GenerationTwists
}): Promise<GeneratedDraft> {
  
  console.log('[ai-service] Starting generation for user:', opts.userId)
  
  // 1. Load AI configuration
  const config = await loadAiConfig()
  console.log('[ai-service] Loaded config:', { model: config.textModel, temp: config.temperature })
  
  // 2. Resolve post type (handle 'auto' from planner)
  let effectivePostType = opts.postType
  if (opts.plannerType === 'auto') {
    // This should already be resolved by the caller, but just in case
    effectivePostType = opts.postType
  }
  
  // Check if post type is allowed
  if (!config.allowedPostTypes.includes(effectivePostType)) {
    throw new Error(`Post type "${effectivePostType}" is not enabled in AI config`)
  }
  
  // 3. Determine effective tone (with learning and twists)
  let effectiveTone = opts.profile.tone
  
  // Apply twist override
  if (opts.twists?.toneOverride) {
    effectiveTone = opts.twists.toneOverride
  }
  
  // Avoid downvoted tones (if learning signals present)
  if (opts.learningSignals?.downvotedTones && 
      opts.learningSignals.downvotedTones.includes(effectiveTone) &&
      config.weightDownvotedTones > 0.5) {
    console.log('[ai-service] Avoiding downvoted tone:', effectiveTone)
    // Don't override - just log for now (could pick alternative tone)
  }
  
  // 4. Determine hashtag count
  let hashtagCount = config.hashtagCountDefault
  if (opts.learningSignals?.reduceHashtags) {
    hashtagCount = Math.max(3, hashtagCount - 2)
  }
  if (opts.learningSignals?.preferredHashtagCount) {
    hashtagCount = opts.learningSignals.preferredHashtagCount
  }
  
  // 5. Merge keywords (profile + learning + twists)
  const allKeywords = [
    ...opts.profile.keywords,
    ...(opts.learningSignals?.preferredTerms || []),
    ...(opts.twists?.extraKeywords || [])
  ]
  const uniqueKeywords = [...new Set(allKeywords)]
  
  // 6. Build system prompt
  const systemPrompt = buildSystemPrompt(config, effectivePostType)
  
  // 7. Build user prompt
  const userPrompt = buildUserPrompt({
    config,
    profile: opts.profile,
    postType: effectivePostType,
    tone: effectiveTone,
    keywords: uniqueKeywords,
    hashtagCount,
    note: opts.twists?.note
  })
  
  // 8. Map model label to actual API ID
  const { getModelId, getModelInfo } = await import('./model-mapping')
  const { calculateTemperature, calculateMaxTokens, trimPromptIfNeeded, formatDuration } = await import('./generation-utils')
  const { withRetry, extractErrorCode } = await import('./retry-utils')
  
  let modelId: string
  let modelInfo: any
  
  try {
    modelId = getModelId(config.textModel)
    modelInfo = getModelInfo(config.textModel)
    console.log('[ai-service] Model mapping:', { label: config.textModel, id: modelId, provider: modelInfo.provider })
  } catch (error: any) {
    console.error('[ai-service] Model mapping error:', error.message)
    throw error // This will be caught by the route handler
  }
  
  // 9. Calculate temperature with jitter
  const tempInfo = calculateTemperature(config)
  console.log('[ai-service] Temperature:', {
    final: tempInfo.finalTemp.toFixed(3),
    base: tempInfo.baseTemp,
    jitter: tempInfo.jitterRange,
    applied: tempInfo.jitterApplied
  })
  
  // 10. Calculate token budget
  const tokenBudget = calculateMaxTokens({
    modelMaxTokens: modelInfo.maxTokens,
    systemPrompt,
    userPrompt,
    safetyMargin: 500
  })
  
  console.log('[ai-service] Token budget:', {
    input: tokenBudget.inputTokens,
    maxOutput: tokenBudget.maxTokens,
    budgetUsed: `${tokenBudget.budgetUsed.toFixed(1)}%`,
    trimRequired: tokenBudget.trimRequired
  })
  
  // 11. Trim prompts if needed
  let finalSystemPrompt = systemPrompt
  let finalUserPrompt = userPrompt
  
  if (tokenBudget.trimRequired || tokenBudget.budgetUsed > 70) {
    const trimResult = trimPromptIfNeeded({
      systemPrompt,
      userPrompt,
      maxInputTokens: modelInfo.maxTokens - 1000 // Reserve 1000 for output
    })
    
    if (trimResult.trimmed) {
      console.log('[ai-service] PROMPT_TRIM_APPLIED:', {
        original: trimResult.originalLength,
        new: trimResult.newLength,
        saved: trimResult.originalLength - trimResult.newLength
      })
      finalSystemPrompt = trimResult.systemPrompt
      finalUserPrompt = trimResult.userPrompt
    }
  }
  
  // 12. Call AI model with retry logic
  const generationStartTime = Date.now()
  console.log('[generate-text] START - userId:', opts.userId, 'postType:', effectivePostType, 'model:', modelId)
  
  const result = await withRetry(async (attempt, useFallback) => {
    // Use fallback model if needed (always use OpenAI's mini model as fallback)
    let attemptModel = modelId
    let attemptProvider = modelInfo.provider
    
    if (useFallback) {
      try {
        const fallbackModelInfo = getModelInfo('gpt-4o-mini')
        attemptModel = fallbackModelInfo.id
        attemptProvider = fallbackModelInfo.provider
      } catch {
        // If mapping fails, use hardcoded fallback
        attemptModel = 'gpt-4o-mini'
        attemptProvider = 'openai'
      }
    }
    
    const attemptTemp = useFallback ? 0.7 : tempInfo.finalTemp
    
    console.log(`[ai-service] Attempt ${attempt + 1} - model: ${attemptModel}, temp: ${attemptTemp.toFixed(3)}, provider: ${attemptProvider}`)
    
    if (attemptProvider === 'anthropic') {
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
      })
      
      const message = await anthropic.messages.create({
        model: attemptModel,
        max_tokens: tokenBudget.maxTokens,
        temperature: attemptTemp,
        messages: [
          {
            role: 'user',
            content: `${finalSystemPrompt}\n\n${finalUserPrompt}`
          }
        ]
      })
      
      const content = message.content[0]
      if (content.type === 'text') {
        return content.text
      } else {
        throw new Error('Unexpected response type from Anthropic')
      }
    } else {
      // OpenAI
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      })
      
      const completion = await openai.chat.completions.create({
        model: attemptModel,
        temperature: attemptTemp,
        max_tokens: tokenBudget.maxTokens,
        messages: [
          { role: 'system', content: finalSystemPrompt },
          { role: 'user', content: finalUserPrompt }
        ]
      })
      
      return completion.choices[0]?.message?.content || ''
    }
  }, {
    maxRetries: 2,
    timeoutMs: 45000,
    backoffMultiplier: 2,
    fallbackModel: 'gpt-4o-mini'
  })
  
  const generationEndTime = Date.now()
  const durationMs = generationEndTime - generationStartTime
  
  // 13. Log generation result
  console.log('[generate-text] END -', {
    success: result.success,
    duration: formatDuration(durationMs),
    attempts: result.attempts,
    fallbackUsed: result.fallbackUsed,
    errorCode: result.error ? extractErrorCode(result.error) : null
  })
  
  // 14. Handle failure
  if (!result.success || !result.data) {
    const errorCode = result.error ? extractErrorCode(result.error) : 'UNKNOWN_ERROR'
    console.error('[ai-service] Generation failed after', result.attempts, 'attempts:', result.error?.message)
    
    throw new Error(`AI_GENERATION_FAILED: ${errorCode} - ${result.error?.message || 'Unknown error'}`)
  }
  
  // 15. Parse JSON response
  const responseText = result.data
  const draft = parseAiResponse(responseText, config)
  
  console.log('[ai-service] Generation complete - parsed draft successfully')
  
  return draft
}

/**
 * Build system prompt based on config
 */
function buildSystemPrompt(config: AiGlobalConfig, postType: PostType): string {
  let prompt = `You are an expert LinkedIn content creator specializing in ${postType} posts for UK businesses.`
  
  prompt += `\n\nYour task is to generate a professional LinkedIn post in JSON format with the following fields:`
  
  if (config.includeHeadlineOptions) {
    prompt += `\n- "headline_options": array of 3 compelling headline options`
  }
  
  prompt += `\n- "post_text": the main post body (2-3 paragraphs, engaging and professional)`
  
  if (config.includeHashtags) {
    prompt += `\n- "hashtags": array of relevant hashtags`
  }
  
  if (config.includeVisualPrompt) {
    prompt += `\n- "visual_prompt": a detailed prompt for generating an accompanying image`
  }
  
  if (config.ukPostingTimeHint) {
    prompt += `\n- "best_time_uk": optimal posting time in UK timezone (HH:MM format, 24-hour)`
  }
  
  prompt += `\n\nRespond ONLY with valid JSON. No markdown, no explanations, just the JSON object.`
  
  return prompt
}

/**
 * Build user prompt with all context
 */
function buildUserPrompt(opts: {
  config: AiGlobalConfig
  profile: ProfileData
  postType: PostType
  tone: string
  keywords: string[]
  hashtagCount: number
  note?: string
}): string {
  let prompt = `Generate a ${opts.postType} LinkedIn post with the following details:\n\n`
  
  prompt += `Business: ${opts.profile.business_name}\n`
  prompt += `Industry: ${opts.profile.industry}\n`
  prompt += `Products/Services: ${opts.profile.products_services}\n`
  prompt += `Target Audience: ${opts.profile.target_audience}\n`
  prompt += `USP: ${opts.profile.usp}\n`
  prompt += `Tone: ${opts.tone} (obey this voice consistently)\n`
  
  if (opts.keywords.length > 0) {
    prompt += `Keywords to emphasize: ${opts.keywords.join(', ')}\n`
  }
  
  if (opts.config.includeHashtags) {
    prompt += `\nGenerate approximately ${opts.hashtagCount} relevant hashtags.\n`
  }
  
  if (opts.note) {
    prompt += `\nAdditional guidance: ${opts.note}\n`
  }
  
  prompt += `\nMake it engaging, professional, and tailored to the UK market.`
  
  return prompt
}

/**
 * Parse AI response into canonical shape
 */
function parseAiResponse(responseText: string, config: AiGlobalConfig): GeneratedDraft {
  // Remove markdown code blocks if present
  let jsonText = responseText.trim()
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
  }
  
  let parsed: any
  try {
    parsed = JSON.parse(jsonText)
  } catch (error) {
    console.error('[ai-service] Failed to parse JSON:', responseText)
    throw new Error('Failed to parse AI response as JSON')
  }
  
  // Build canonical shape (with defaults for disabled features)
  const draft: GeneratedDraft = {
    headline_options: config.includeHeadlineOptions 
      ? (parsed.headline_options || []) 
      : [],
    post_text: parsed.post_text || '',
    hashtags: config.includeHashtags 
      ? (parsed.hashtags || []) 
      : [],
    visual_prompt: config.includeVisualPrompt 
      ? (parsed.visual_prompt || '') 
      : '',
    best_time_uk: config.ukPostingTimeHint 
      ? (parsed.best_time_uk || '10:00') 
      : '10:00'
  }
  
  return draft
}
