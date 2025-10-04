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

  // Check diversity window if user ID is provided
  if (userId && diversityWindowDays > 0) {
    try {
      // Get recent posts within diversity window
      const windowStart = new Date()
      windowStart.setDate(windowStart.getDate() - diversityWindowDays)

      const recentPosts = await prisma.postHistory.findMany({
        where: {
          userId,
          createdAt: {
            gte: windowStart
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10,
        select: {
          metadata: true
        }
      })

      // Extract buckets from recent posts
      const recentBuckets = recentPosts
        .map(post => {
          if (post.metadata && typeof post.metadata === 'object') {
            return (post.metadata as any).bucket
          }
          return null
        })
        .filter(Boolean)

      // If the most recent post used the same bucket, try the next one
      if (recentBuckets.length > 0 && recentBuckets[0] === chosenBucket) {
        bucketIndex = (bucketIndex + 1) % buckets.length
        chosenBucket = buckets[bucketIndex]
      }
    } catch (error) {
      console.error('[generation-helpers] Error checking diversity window:', error)
      // Continue with original bucket if error
    }
  }

  return chosenBucket
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
 * Store bucket information in post metadata for diversity tracking
 * 
 * @param bucket - The bucket used for this generation
 * @returns Metadata object to store with post
 */
export function createPostMetadata(bucket: string): Record<string, any> {
  return {
    bucket,
    generatedAt: new Date().toISOString()
  }
}
