/**
 * Generation Utilities
 * 
 * Temperature clamping, token budgeting, and other generation helpers.
 */

import { AiGlobalConfig } from './ai-config'

/**
 * Clamp a number between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * Calculate final temperature with jitter
 */
export function calculateTemperature(config: AiGlobalConfig): {
  finalTemp: number
  baseTemp: number
  jitterRange: string
  jitterApplied: boolean
} {
  const baseTemp = config.temperature
  
  // If randomness is disabled, use base temperature
  if (!config.randomness.enabled) {
    return {
      finalTemp: clamp(baseTemp, 0, 2),
      baseTemp,
      jitterRange: 'none',
      jitterApplied: false
    }
  }
  
  // Calculate jitter range
  const minTemp = config.randomness.temperatureMin
  const maxTemp = config.randomness.temperatureMax
  
  // Random temperature within the configured range
  const randomTemp = minTemp + Math.random() * (maxTemp - minTemp)
  
  // Clamp to valid OpenAI range (0-2)
  const finalTemp = clamp(randomTemp, 0, 2)
  
  return {
    finalTemp,
    baseTemp,
    jitterRange: `${minTemp.toFixed(2)}-${maxTemp.toFixed(2)}`,
    jitterApplied: true
  }
}

/**
 * Estimate token count (rough approximation)
 * 1 token ≈ 4 characters for English text
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

/**
 * Calculate safe max_tokens for output
 */
export function calculateMaxTokens(opts: {
  modelMaxTokens: number
  systemPrompt: string
  userPrompt: string
  safetyMargin?: number
}): {
  maxTokens: number
  inputTokens: number
  budgetUsed: number
  trimRequired: boolean
} {
  const safetyMargin = opts.safetyMargin || 500
  
  // Estimate input tokens
  const systemTokens = estimateTokens(opts.systemPrompt)
  const userTokens = estimateTokens(opts.userPrompt)
  const inputTokens = systemTokens + userTokens
  
  // Calculate available tokens for output
  const availableForOutput = opts.modelMaxTokens - inputTokens - safetyMargin
  
  // Cap output at reasonable length for LinkedIn posts (2000 tokens ≈ 8000 chars)
  // Increased to accommodate 140-160 word posts + JSON structure + headlines + hashtags
  const maxTokens = Math.min(availableForOutput, 2000)
  
  // Check if we're over budget
  const budgetUsed = (inputTokens / opts.modelMaxTokens) * 100
  const trimRequired = maxTokens < 500 // Less than 500 tokens for output is problematic
  
  return {
    maxTokens: Math.max(500, maxTokens), // Ensure at least 500 tokens
    inputTokens,
    budgetUsed,
    trimRequired
  }
}

/**
 * Trim prompt if it's too long
 */
export function trimPromptIfNeeded(opts: {
  systemPrompt: string
  userPrompt: string
  maxInputTokens: number
}): {
  systemPrompt: string
  userPrompt: string
  trimmed: boolean
  originalLength: number
  newLength: number
} {
  const originalSystemTokens = estimateTokens(opts.systemPrompt)
  const originalUserTokens = estimateTokens(opts.userPrompt)
  const totalTokens = originalSystemTokens + originalUserTokens
  
  // If within budget, no trimming needed
  if (totalTokens <= opts.maxInputTokens) {
    return {
      systemPrompt: opts.systemPrompt,
      userPrompt: opts.userPrompt,
      trimmed: false,
      originalLength: totalTokens,
      newLength: totalTokens
    }
  }
  
  // Trim system prompt (keep first 70% and last 30%)
  const systemLines = opts.systemPrompt.split('\n')
  const keepFirst = Math.floor(systemLines.length * 0.7)
  const keepLast = Math.floor(systemLines.length * 0.3)
  const trimmedSystem = [
    ...systemLines.slice(0, keepFirst),
    '\n[... middle section trimmed for token budget ...]\n',
    ...systemLines.slice(-keepLast)
  ].join('\n')
  
  // User prompt stays mostly intact (just trim historical notes if present)
  let trimmedUser = opts.userPrompt
  if (opts.userPrompt.includes('Historical context:')) {
    trimmedUser = opts.userPrompt.replace(/Historical context:.*?(?=\n\n|$)/s, 'Historical context: [trimmed]')
  }
  
  const newLength = estimateTokens(trimmedSystem) + estimateTokens(trimmedUser)
  
  return {
    systemPrompt: trimmedSystem,
    userPrompt: trimmedUser,
    trimmed: true,
    originalLength: totalTokens,
    newLength
  }
}

/**
 * Format duration in milliseconds to human-readable string
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`
  return `${(ms / 60000).toFixed(2)}m`
}
