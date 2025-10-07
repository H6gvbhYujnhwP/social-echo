/**
 * Generation Helpers
 * 
 * Utilities for daily topic rotation and temperature randomness
 */

import { AiGlobalConfig } from './ai-config'
import { prisma } from '../prisma'

/**
 * Get the bucket-of-the-day based on rotation config
 * 
 * @param config - AI configuration with rotation settings
 * @param userId - User ID for tracking post history
 * @returns The chosen bucket for today
 */
export async function getDailyBucket(
  config: AiGlobalConfig,
  userId?: string
): Promise<string> {
  if (!config.rotation.enabled || config.rotation.buckets.length === 0) {
    return config.rotation.buckets[0] || 'default'
  }

  const { buckets, timezone, diversityWindowDays } = config.rotation

  // Calculate day index based on timezone
  const now = new Date()
  const localDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }))
  const daysSinceEpoch = Math.floor(localDate.getTime() / (1000 * 60 * 60 * 24))
  
  // Calculate base bucket index
  let bucketIndex = daysSinceEpoch % buckets.length
  let chosenBucket = buckets[bucketIndex]

  // Diversity checking disabled for now (requires metadata field in PostHistory)
  // Can be re-enabled after adding metadata field to Prisma schema
  // For now, simple day-based rotation provides sufficient variety

  return chosenBucket
}

/**
 * Alias for getDailyBucket for backward compatibility
 */
export async function getBucketOfTheDay(
  config: AiGlobalConfig,
  userId: string
): Promise<string> {
  return getDailyBucket(config, userId)
}

/**
 * Get a randomized temperature value within configured range
 * 
 * @param config - AI configuration with randomness settings
 * @returns Temperature value to use for generation
 */
export function getRandomTemperature(config: AiGlobalConfig): number {
  if (!config.randomness.enabled) {
    return config.temperature
  }

  const { temperatureMin, temperatureMax } = config.randomness

  // Validate range
  const min = Math.max(0, Math.min(2, temperatureMin))
  const max = Math.max(0, Math.min(2, temperatureMax))

  // Ensure min <= max
  if (min > max) {
    console.warn('[generation-helpers] temperatureMin > temperatureMax, using base temperature')
    return config.temperature
  }

  // Generate random temperature within range
  const randomTemp = min + Math.random() * (max - min)
  
  // Clamp to valid range [0, 2]
  return Math.max(0, Math.min(2, randomTemp))
}

/**
 * Build the system prompt with master template and bucket context
 * 
 * @param config - AI configuration
 * @param bucket - Current bucket for topic rotation
 * @param additionalContext - Any additional context to include
 * @returns Complete system prompt
 */
export function buildSystemPrompt(
  config: AiGlobalConfig,
  bucket: string,
  additionalContext?: string
): string {
  let prompt = config.masterPromptTemplate

  // Add bucket context if rotation is enabled
  if (config.rotation.enabled) {
    prompt += `\n\nCurrent content focus: ${bucket}`
  }

  // Add any additional context
  if (additionalContext) {
    prompt += `\n\n${additionalContext}`
  }

  return prompt
}

/**
 * Get bucket information for logging/debugging
 * 
 * @param bucket - The bucket used for this generation
 * @returns Object with bucket info and description
 */
export function getBucketInfo(bucket: string): { bucket: string; description: string; timestamp: string } {
  const bucketDescriptions: Record<string, string> = {
    'serious_sme_finance': 'Serious SME Finance (cashflow, staff, late payments, growth)',
    'funny_finance_story': 'Funny/Quirky Finance Story (weird leases, unusual loans, absurd expenses)',
    'serious': 'Serious Business Content',
    'quirky': 'Quirky/Fun Business Content',
    'default': 'Default Content Mix'
  }
  
  return {
    bucket,
    description: bucketDescriptions[bucket] || bucket,
    timestamp: new Date().toISOString()
  }
}
