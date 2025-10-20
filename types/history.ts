/**
 * History types for Social Echo
 * Centralized type definitions for draft and image history
 */

export type HistoryItem = {
  id: string
  kind: 'draft' | 'image'
  postType?: string
  createdAt: string
  text?: string
  headlines?: string[]
  hashtags?: string[]
  imageUrl?: string
  imageStyle?: string
  imagePrompt?: string
  visualPrompt?: string
  tone?: string
  // For restore functionality
  headlineOptions?: string[]
  postText?: string
  customisationsUsed?: number
}

export type HistoryResponse = {
  items: HistoryItem[]
  nextCursor?: string
  hasMore: boolean
}

