/**
 * Learning Signals Service
 * 
 * Analyzes user feedback to derive actionable learning signals that influence AI generation.
 * This is the core of the Feedback-to-Training Loop.
 */

import { prisma } from '../prisma'
import type { LearningSignals } from './ai-service'

export interface FeedbackWithPost {
  id: string
  userId: string
  postId: string
  feedback: string  // 'up' | 'down'
  note: string | null
  postType: string
  tone: string
  keywords: string[]
  hashtags: string[]
  createdAt: Date
  post: {
    id: string
    postText: string
  }
}

/**
 * Get default learning signals for users with no feedback
 */
function getDefaultSignals(): LearningSignals {
  return {
    preferredTerms: [],
    avoidedTerms: [],
    preferredTone: null,
    preferredPostTypes: [],
    confidence: 0,
    totalFeedback: 0,
    upvoteRate: 0,
    lastCalculated: new Date(),
    feedbackSince: null
  }
}

/**
 * Calculate confidence level based on feedback count
 * 
 * Confidence grows logarithmically:
 * - 0 feedback = 0%
 * - 5 feedback = 30%
 * - 10 feedback = 50%
 * - 20 feedback = 70%
 * - 50+ feedback = 100%
 */
export function calculateConfidence(feedbackCount: number): number {
  if (feedbackCount === 0) return 0
  if (feedbackCount >= 50) return 100
  if (feedbackCount >= 20) return 70 + ((feedbackCount - 20) / 30) * 30
  if (feedbackCount >= 10) return 50 + ((feedbackCount - 10) / 10) * 20
  if (feedbackCount >= 5) return 30 + ((feedbackCount - 5) / 5) * 20
  
  return Math.round((feedbackCount / 5) * 30)
}

/**
 * Extract terms from feedback (keywords + hashtags)
 * 
 * @param feedback - Array of feedback items
 * @param minFrequency - Minimum times a term must appear to be included
 * @returns Array of terms sorted by frequency (most common first)
 */
export function extractTermsFromFeedback(
  feedback: FeedbackWithPost[], 
  minFrequency: number = 2
): string[] {
  const termCounts = new Map<string, number>()
  
  feedback.forEach(f => {
    // Extract from keywords
    f.keywords.forEach(keyword => {
      const normalized = keyword.toLowerCase().trim()
      if (normalized.length > 0) {
        termCounts.set(normalized, (termCounts.get(normalized) || 0) + 1)
      }
    })
    
    // Extract from hashtags (remove # symbol)
    f.hashtags.forEach(hashtag => {
      const normalized = hashtag.replace(/^#/, '').toLowerCase().trim()
      if (normalized.length > 0) {
        termCounts.set(normalized, (termCounts.get(normalized) || 0) + 1)
      }
    })
  })
  
  // Filter by minimum frequency and sort by count
  return Array.from(termCounts.entries())
    .filter(([_, count]) => count >= minFrequency)
    .sort((a, b) => b[1] - a[1])
    .map(([term, _]) => term)
    .slice(0, 20) // Top 20 terms
}

/**
 * Calculate preferred tone based on success rates
 * 
 * @param feedback - Array of feedback items
 * @returns Preferred tone or null if not enough data
 */
export function calculatePreferredTone(feedback: FeedbackWithPost[]): string | null {
  const toneStats = new Map<string, { up: number; down: number }>()
  
  feedback.forEach(f => {
    if (!toneStats.has(f.tone)) {
      toneStats.set(f.tone, { up: 0, down: 0 })
    }
    
    const stats = toneStats.get(f.tone)!
    if (f.feedback === 'up') {
      stats.up++
    } else {
      stats.down++
    }
  })
  
  // Calculate success rate for each tone
  const toneRates = Array.from(toneStats.entries()).map(([tone, stats]) => {
    const total = stats.up + stats.down
    const successRate = total > 0 ? (stats.up / total) * 100 : 0
    return { tone, successRate, total }
  })
  
  // Require at least 3 feedback items for a tone to be preferred
  const validTones = toneRates.filter(t => t.total >= 3)
  
  if (validTones.length === 0) return null
  
  // Return tone with highest success rate (must be at least 60%)
  validTones.sort((a, b) => b.successRate - a.successRate)
  return validTones[0].successRate >= 60 ? validTones[0].tone : null
}

/**
 * Calculate preferred post types based on success rates
 * 
 * @param feedback - Array of feedback items
 * @returns Array of preferred post types sorted by success rate
 */
export function calculatePreferredPostTypes(feedback: FeedbackWithPost[]): string[] {
  const typeStats = new Map<string, { up: number; down: number }>()
  
  feedback.forEach(f => {
    if (!typeStats.has(f.postType)) {
      typeStats.set(f.postType, { up: 0, down: 0 })
    }
    
    const stats = typeStats.get(f.postType)!
    if (f.feedback === 'up') {
      stats.up++
    } else {
      stats.down++
    }
  })
  
  // Calculate success rate for each type
  const typeRates = Array.from(typeStats.entries()).map(([type, stats]) => {
    const total = stats.up + stats.down
    const successRate = total > 0 ? (stats.up / total) * 100 : 0
    return { type, successRate, total }
  })
  
  // Require at least 3 feedback items for a type to be preferred (60% success rate)
  const validTypes = typeRates.filter(t => t.total >= 3 && t.successRate >= 60)
  
  // Sort by success rate
  validTypes.sort((a, b) => b.successRate - a.successRate)
  
  return validTypes.map(t => t.type)
}

/**
 * Derive learning signals from user feedback
 * 
 * This is the main function that analyzes all feedback and produces actionable signals
 * for the AI generation system.
 * 
 * @param userId - User ID to derive signals for
 * @param maxFeedbackItems - Maximum number of recent feedback items to analyze (default: 100)
 * @returns Learning signals object
 */
export async function deriveLearningSignals(
  userId: string,
  maxFeedbackItems: number = 100
): Promise<LearningSignals> {
  console.log('[learning-signals] Deriving signals for user:', userId)
  
  // 1. Fetch recent feedback for user
  const allFeedback = await prisma.feedback.findMany({
    where: { userId },
    include: { 
      post: {
        select: {
          id: true,
          postText: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: maxFeedbackItems
  }) as FeedbackWithPost[]
  
  console.log('[learning-signals] Found feedback items:', allFeedback.length)
  
  if (allFeedback.length === 0) {
    console.log('[learning-signals] No feedback found, returning default signals')
    return getDefaultSignals()
  }
  
  // 2. Separate by rating
  const upvoted = allFeedback.filter(f => f.feedback === 'up')
  const downvoted = allFeedback.filter(f => f.feedback === 'down')
  
  console.log('[learning-signals] Upvoted:', upvoted.length, 'Downvoted:', downvoted.length)
  
  // 3. Extract terms
  const preferredTerms = extractTermsFromFeedback(upvoted, 2)
  const avoidedTerms = extractTermsFromFeedback(downvoted, 2)
  
  console.log('[learning-signals] Preferred terms:', preferredTerms.length)
  console.log('[learning-signals] Avoided terms:', avoidedTerms.length)
  
  // 4. Calculate preferred tone
  const preferredTone = calculatePreferredTone(allFeedback)
  console.log('[learning-signals] Preferred tone:', preferredTone || 'none')
  
  // 5. Calculate preferred post types
  const preferredPostTypes = calculatePreferredPostTypes(allFeedback)
  console.log('[learning-signals] Preferred post types:', preferredPostTypes.length)
  
  // 6. Calculate confidence
  const confidence = calculateConfidence(allFeedback.length)
  console.log('[learning-signals] Confidence:', confidence + '%')
  
  // 7. Calculate upvote rate
  const upvoteRate = Math.round((upvoted.length / allFeedback.length) * 100)
  
  // 8. Get oldest feedback date
  const feedbackSince = allFeedback.length > 0 
    ? allFeedback[allFeedback.length - 1].createdAt 
    : null
  
  const signals: LearningSignals = {
    preferredTerms,
    avoidedTerms,
    preferredTone,
    preferredPostTypes,
    confidence,
    totalFeedback: allFeedback.length,
    upvoteRate,
    lastCalculated: new Date(),
    feedbackSince
  }
  
  console.log('[learning-signals] Signals derived successfully:', {
    confidence: signals.confidence,
    preferredTermsCount: signals.preferredTerms.length,
    avoidedTermsCount: signals.avoidedTerms.length,
    preferredTone: signals.preferredTone,
    preferredPostTypesCount: signals.preferredPostTypes.length
  })
  
  return signals
}

/**
 * Build prompt enhancement text based on learning signals and confidence
 * 
 * @param signals - Learning signals to enhance prompt with
 * @returns Prompt enhancement text or empty string if confidence too low
 */
export function buildPromptEnhancement(signals: LearningSignals): string {
  // Don't enhance if confidence is too low
  if (signals.confidence < 20) {
    return ''
  }
  
  let enhancement = '\n\n'
  
  // Determine influence level based on confidence
  if (signals.confidence >= 80) {
    enhancement += `CRITICAL LEARNING SIGNALS (Confidence: ${signals.confidence}% - High Priority):\n`
  } else if (signals.confidence >= 60) {
    enhancement += `IMPORTANT LEARNING SIGNALS (Confidence: ${signals.confidence}%):\n`
  } else if (signals.confidence >= 40) {
    enhancement += `LEARNING SIGNALS (Confidence: ${signals.confidence}%):\n`
  } else {
    enhancement += `Subtle Learning Signals (Confidence: ${signals.confidence}%):\n`
  }
  
  // Add preferred terms
  if (signals.preferredTerms.length > 0) {
    const verb = signals.confidence >= 60 ? 'MUST include' : 'Try to include'
    enhancement += `- ${verb} these user-preferred terms: ${signals.preferredTerms.slice(0, 10).join(', ')}\n`
  }
  
  // Add avoided terms
  if (signals.avoidedTerms.length > 0) {
    const verb = signals.confidence >= 60 ? 'MUST AVOID' : 'Try to avoid'
    enhancement += `- ${verb} these terms: ${signals.avoidedTerms.slice(0, 10).join(', ')}\n`
  }
  
  // Add preferred tone
  if (signals.preferredTone) {
    const verb = signals.confidence >= 60 ? 'MUST use' : 'Prefer'
    enhancement += `- ${verb} a "${signals.preferredTone}" tone (user's strong preference)\n`
  }
  
  // Add preferred post types
  if (signals.preferredPostTypes.length > 0) {
    const verb = signals.confidence >= 60 ? 'MUST follow' : 'Prefer'
    enhancement += `- ${verb} "${signals.preferredPostTypes[0]}" post structure (user's favorite type)\n`
  }
  
  // Add learning context for high confidence
  if (signals.confidence >= 60) {
    enhancement += `\nThis user has provided ${signals.totalFeedback} pieces of feedback. Prioritize their learned preferences heavily.\n`
  }
  
  return enhancement
}
