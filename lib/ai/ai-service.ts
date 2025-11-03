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
import { fetchSectorNews, type ProfileData as NewsProfileData } from '../news/enhanced-news-service'
import { pickPain } from './pains'
import { getBucketOfTheDay, getBucketInfo } from './generation-helpers'

/**
 * Helper: Extract sector from profile
 */
function sectorFrom(profile: ProfileData) {
  return [profile.industry, profile.products_services].filter(Boolean).join(' ')
}

/**
 * Helper: Pick informational mode
 */
function pickInfMode() {
  const modes = ['fun', 'quirky', 'serious'] as const
  return modes[Math.floor(Math.random() * modes.length)]
}

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
 * This is the core of the Feedback-to-Training Loop.
 */
export type LearningSignals = {
  // Derived from feedback analysis
  preferredTerms: string[]        // Terms from upvoted posts (keywords + hashtags)
  avoidedTerms: string[]          // Terms from downvoted posts
  preferredTone: string | null    // Tone with highest success rate
  preferredPostTypes: string[]    // Post types with highest success rate
  
  // Metadata
  confidence: number              // 0-100, based on feedback count
  totalFeedback: number           // Total feedback items
  upvoteRate: number              // Percentage of upvotes
  
  // Timestamps
  lastCalculated: Date            // When signals were last derived
  feedbackSince: Date | null      // Date of oldest feedback used
}

/**
 * Customization twists (user overrides)
 */
export type GenerationTwists = {
  toneOverride?: string
  extraKeywords?: string[]
  note?: string
  originalPost?: string  // For refinement: the original post text to modify
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
  country?: string | null  // User's country for localized content
  documents?: Array<{filename: string; content: string; uploadedAt: string; fileType: string}> | null  // Uploaded technical documents
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

  
  // 4. Determine hashtag count
  let hashtagCount = config.hashtagCountDefault
  
  // 5. Merge keywords (profile + learning + twists)
  const allKeywords = [
    ...opts.profile.keywords,
    ...(opts.learningSignals?.preferredTerms || []),
    ...(opts.twists?.extraKeywords || [])
  ]
  const uniqueKeywords = [...new Set(allKeywords)]
  
  // 6. Get bucket of the day for rotation
  const bucket = await getBucketOfTheDay(config, opts.userId)
  console.log('[rotation]', getBucketInfo(bucket))
  
  // 7. Build system prompt
  const systemPrompt = buildSystemPrompt(config, effectivePostType)
  
  // 8. Build user prompt
  let userPrompt = buildUserPrompt({
    config,
    profile: opts.profile,
    postType: effectivePostType,
    tone: effectiveTone,
    keywords: uniqueKeywords,
    hashtagCount,
    note: opts.twists?.note
  })
  
  // 9. Add bucket context
  userPrompt += `\n\nToday's content bucket: ${bucket}`
  
  // 10. Add post-type specific logic
  
  // NEWS: fetch real sector-based headlines with fallback to creative generation
  if (effectivePostType === 'news') {
    // Prepare profile data for news service
    const newsProfile: NewsProfileData = {
      industry: opts.profile.industry,
      products_services: opts.profile.products_services,
      keywords: opts.profile.keywords,
      target_audience: opts.profile.target_audience,
      business_name: opts.profile.business_name
    }
    
    // Fetch sector-relevant news with relevance scoring
    const newsResult = await fetchSectorNews(newsProfile, {
      limit: 6,
      minRelevanceScore: 5,
      maxDays: 30
    })
    
    console.log('[ai-service] News fetch result:', {
      hasRelevantNews: newsResult.hasRelevantNews,
      headlineCount: newsResult.headlines.length,
      fallbackReason: newsResult.fallbackReason
    })
    
    if (newsResult.hasRelevantNews && newsResult.headlines.length > 0) {
      // Use real news headlines
      userPrompt += `\n\nREAL SECTOR NEWS (pick 1 and craft a professional take):\n` +
        newsResult.headlines.map(h => 
          `- ${h.title} ${h.source ? `(${h.source})` : ''} ${h.link ? `[${h.link}]` : ''} [Relevance: ${h.relevanceScore || 0}]`
        ).join('\n') +
        `\n\nRules for real news posts:\n` +
        `- Open with a spiky hook that grabs attention\n` +
        `- 1–2 lines summarising the story accurately (NO hallucinations or fabrications)\n` +
        `- 1 specific implication for ${opts.profile.target_audience}\n` +
        `- 1 actionable takeaway or question\n` +
        `- Cite the source inline like: (Source: ${newsResult.headlines[0]?.source || 'Publisher'})\n` +
        `- Keep it professional and credible - this is REAL news`
    } else {
      // Fallback to creative news-style generation
      console.log('[ai-service] Falling back to creative news generation:', newsResult.fallbackReason)
      
      userPrompt += `\n\nCREATIVE NEWS-STYLE POST (no real headlines available):\n` +
        `Since no significant sector news was found, generate a forward-looking news-style post inspired by:\n` +
        `- Current trends in ${opts.profile.industry}\n` +
        `- Innovations relevant to ${opts.profile.target_audience}\n` +
        `- Industry insights about ${opts.profile.products_services}\n\n` +
        `Frame it as:\n` +
        `- "Industry Watch" or "Sector Spotlight" style\n` +
        `- Focus on emerging trends or common challenges\n` +
        `- Include a thought-provoking question or insight\n` +
        `- Make it feel timely and relevant even without a specific news hook\n` +
        `- DO NOT fabricate specific news events or cite fake sources\n` +
        `- Keep the tone professional and forward-looking`
    }
  }
  
  // SELLING: PAS structure with a random industry pain
  if (effectivePostType === 'selling') {
    const pain = pickPain(opts.profile.industry)
    userPrompt += `\n\nSELLING FRAME:\n- Use PAS (Problem → Agitate → Solution).\n- Real pain: "${pain}"\n- Include a realistic, anonymised mini-story.\n- Present our solution (${opts.profile.products_services}) with 1 crisp benefit and 1 outcome metric.\n- Soft CTA (comment/DM for checklist/demo).`
  }
  
  // ADVICE: practical steps and a measurable target
  if (effectivePostType === 'advice') {
    userPrompt += `\n\nADVICE FRAME:\n- Pick 1 concrete problem ${opts.profile.target_audience} faces.\n- Give 3 steps they can do THIS WEEK.\n- Include 1 small template/checklist line.\n- Include 1 measurable target (e.g., "cut response time from 2d → 2h").\n- Close with: "Reply 'GUIDE' and I'll DM the checklist."`
  }
  
  // INFORMATIONAL: switch among fun/quirky/serious and include a wow stat
  if (effectivePostType === 'informational') {
    const mode = pickInfMode()
    userPrompt += `\n\nINFO MODE: ${mode.toUpperCase()}\nRules:\n- Include one "wow" stat (source if possible).\n- ${mode === 'serious' ? 'Use authoritative tone.' : ''}\n- ${mode === 'fun' ? 'Use playful language, metaphor or analogy.' : ''}\n- ${mode === 'quirky' ? 'Tell a strange-but-true micro-story.' : ''}\n- Keep it skimmable with short lines.\n- One "so what" for ${opts.profile.target_audience}.`
  }
  
  // 11. Map model label to actual API ID
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
        presence_penalty: 0.4,
        frequency_penalty: 0.2,
        top_p: 0.95,
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
  let prompt = `You are a high-signal LinkedIn ghostwriter. Write spiky, contrarian, story-first posts with short lines and a clear point of view. Keep it LinkedIn-safe.`
  
  prompt += `\n\nReturn STRICT JSON with fields:`
  
  if (config.includeHeadlineOptions) {
    prompt += `\n- "headline_options": array of 3 hooks (1 contrarian, 1 data-led, 1 story-first)`
  }
  
  prompt += `\n- "post_text": full post. Short lines. Bold POV. 1 vivid example/mini-anecdote. End with a provocative question.`
  
  if (config.includeHashtags) {
    prompt += `\n- "hashtags": array of relevant hashtags`
  }
  
  if (config.includeVisualPrompt) {
    prompt += `\n- "visual_prompt": a detailed prompt for generating an accompanying image`
  }
  
  if (config.ukPostingTimeHint) {
    prompt += `\n- "best_time_uk": optimal posting time in UK timezone (HH:MM, 24-hour)`
  }
  
  prompt += `\n\nGuardrails: no slurs/personal attacks; no fabricated facts. Opinions are fine.`
  prompt += `\nRespond ONLY with valid JSON (no markdown, no commentary).`
  
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
  
  prompt += `\nStyle directives:
- Lead with tension (surprise, myth-bust, or "most people get this wrong").
- Sentences 4–12 words. Use blank lines generously.
- One vivid detail beats three vague claims.
- UK audience.`
  
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
