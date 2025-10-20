'use client'

import { getPostHistory, getFeedbackStats, UserProfile, PostType } from './localstore'

export interface LearningInsights {
  // Tone adjustments
  tonePreference: {
    current: UserProfile['tone']
    suggested?: UserProfile['tone']
    confidence: number // 0-1
    reason: string
  }
  
  // Keyword adjustments
  keywordSuggestions: {
    add: string[] // Keywords user frequently adds
    remove: string[] // Keywords user frequently removes
    confidence: number
  }
  
  // Hashtag adjustments
  hashtagPreference: {
    preferredCount: number // Average number user keeps
    confidence: number
  }
  
  // Post type performance
  postTypePerformance: Record<PostType, {
    upvotes: number
    downvotes: number
    score: number // (upvotes - downvotes) / total
  }>
  
  // Overall learning status
  totalFeedback: number
  learningStage: 'cold-start' | 'learning' | 'confident'
}

/**
 * Analyzes user feedback history and generates learning insights
 */
export function analyzeFeedback(profile: UserProfile): LearningInsights {
  const history = getPostHistory()
  const stats = getFeedbackStats()
  
  const insights: LearningInsights = {
    tonePreference: {
      current: profile.tone,
      confidence: 0,
      reason: 'Not enough feedback yet'
    },
    keywordSuggestions: {
      add: [],
      remove: [],
      confidence: 0
    },
    hashtagPreference: {
      preferredCount: 8, // Default
      confidence: 0
    },
    postTypePerformance: {
      selling: { upvotes: 0, downvotes: 0, score: 0 },
      informational: { upvotes: 0, downvotes: 0, score: 0 },
      advice: { upvotes: 0, downvotes: 0, score: 0 },
      news: { upvotes: 0, downvotes: 0, score: 0 }
    },
    totalFeedback: stats.totalFeedback,
    learningStage: stats.totalFeedback < 3 ? 'cold-start' : stats.totalFeedback < 10 ? 'learning' : 'confident'
  }
  
  // Calculate post type performance
  Object.keys(stats.byPostType).forEach(type => {
    const postType = type as PostType
    const { up, down } = stats.byPostType[postType]
    const total = up + down
    insights.postTypePerformance[postType] = {
      upvotes: up,
      downvotes: down,
      score: total > 0 ? (up - down) / total : 0
    }
  })
  
  // Analyze tone preference
  if (stats.totalFeedback >= 5) {
    const toneScores = Object.entries(stats.byTone).map(([tone, { up, down }]) => ({
      tone: tone as UserProfile['tone'],
      score: up - down,
      total: up + down
    }))
    
    const bestTone = toneScores.reduce((best, current) => 
      current.score > best.score ? current : best
    )
    
    if (bestTone.tone !== profile.tone && bestTone.total >= 3) {
      insights.tonePreference = {
        current: profile.tone,
        suggested: bestTone.tone,
        confidence: Math.min(bestTone.total / 10, 1),
        reason: `Your posts with "${bestTone.tone}" tone received ${bestTone.score > 0 ? 'more positive' : 'better'} feedback`
      }
    } else {
      insights.tonePreference = {
        current: profile.tone,
        confidence: 0.7,
        reason: `Current tone is working well`
      }
    }
  }
  
  // Analyze hashtag preferences
  const postsWithFeedback = history.filter(p => p.feedback)
  if (postsWithFeedback.length >= 3) {
    const upvotedPosts = postsWithFeedback.filter(p => p.feedback?.feedback === 'up')
    if (upvotedPosts.length > 0) {
      const avgHashtags = upvotedPosts.reduce((sum, p) => sum + p.hashtags.length, 0) / upvotedPosts.length
      insights.hashtagPreference = {
        preferredCount: Math.round(avgHashtags),
        confidence: Math.min(upvotedPosts.length / 10, 1)
      }
    }
  }
  
  // Analyze feedback notes for keyword patterns
  const feedbackNotes = postsWithFeedback
    .map(p => p.feedback?.note)
    .filter((note): note is string => note !== null && note !== undefined)
  
  if (feedbackNotes.length >= 3) {
    // Extract common words from negative feedback
    const downvotedNotes = postsWithFeedback
      .filter(p => p.feedback?.feedback === 'down')
      .map(p => p.feedback?.note)
      .filter((note): note is string => note !== null && note !== undefined)
    
    // Simple keyword extraction (can be enhanced)
    const commonWords = extractCommonWords(downvotedNotes)
    insights.keywordSuggestions = {
      add: [], // Would need more sophisticated analysis
      remove: commonWords.slice(0, 3),
      confidence: Math.min(downvotedNotes.length / 5, 1)
    }
  }
  
  return insights
}

/**
 * Generates prompt adjustments based on learning insights
 */
export function generatePromptAdjustments(insights: LearningInsights): {
  toneOverride?: UserProfile['tone']
  hashtagCount?: number
  additionalInstructions: string[]
} {
  const adjustments: {
    toneOverride?: UserProfile['tone']
    hashtagCount?: number
    additionalInstructions: string[]
  } = {
    additionalInstructions: []
  }
  
  // Apply tone adjustment if confidence is high enough
  if (insights.tonePreference.suggested && insights.tonePreference.confidence >= 0.6) {
    adjustments.toneOverride = insights.tonePreference.suggested
    adjustments.additionalInstructions.push(
      `User has shown preference for ${insights.tonePreference.suggested} tone in past feedback.`
    )
  }
  
  // Apply hashtag count adjustment
  if (insights.hashtagPreference.confidence >= 0.5) {
    adjustments.hashtagCount = insights.hashtagPreference.preferredCount
    adjustments.additionalInstructions.push(
      `Generate approximately ${insights.hashtagPreference.preferredCount} hashtags based on user preference.`
    )
  }
  
  // Add post type performance insights
  const bestPerformingType = Object.entries(insights.postTypePerformance)
    .filter(([_, perf]) => perf.upvotes + perf.downvotes >= 2)
    .sort(([_, a], [__, b]) => b.score - a.score)[0]
  
  if (bestPerformingType && bestPerformingType[1].score > 0.5) {
    adjustments.additionalInstructions.push(
      `User's "${bestPerformingType[0]}" posts have performed well. Maintain similar style and structure.`
    )
  }
  
  // Add keyword removal suggestions
  if (insights.keywordSuggestions.remove.length > 0 && insights.keywordSuggestions.confidence >= 0.5) {
    adjustments.additionalInstructions.push(
      `Avoid overusing these themes: ${insights.keywordSuggestions.remove.join(', ')}`
    )
  }
  
  return adjustments
}

/**
 * Extract common words from feedback notes (simple implementation)
 */
function extractCommonWords(notes: string[]): string[] {
  if (notes.length === 0) return []
  
  const wordCounts: Record<string, number> = {}
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'was', 'are', 'were', 'too', 'very', 'add', 'remove', 'more', 'less'])
  
  notes.forEach(note => {
    const words = note.toLowerCase().match(/\b\w+\b/g) || []
    words.forEach(word => {
      if (word.length > 3 && !stopWords.has(word)) {
        wordCounts[word] = (wordCounts[word] || 0) + 1
      }
    })
  })
  
  return Object.entries(wordCounts)
    .filter(([_, count]) => count >= 2)
    .sort(([_, a], [__, b]) => b - a)
    .map(([word]) => word)
}

/**
 * Check if profile should be auto-updated based on consistent feedback
 */
export function shouldAutoUpdateProfile(insights: LearningInsights): {
  shouldUpdate: boolean
  updates: Partial<UserProfile>
  reason: string
} {
  const result = {
    shouldUpdate: false,
    updates: {} as Partial<UserProfile>,
    reason: ''
  }
  
  // Auto-update tone if confidence is very high
  if (insights.tonePreference.suggested && insights.tonePreference.confidence >= 0.8) {
    result.shouldUpdate = true
    result.updates.tone = insights.tonePreference.suggested
    result.reason = `Your posts consistently perform better with "${insights.tonePreference.suggested}" tone. We've updated your profile to match your preference.`
  }
  
  return result
}
