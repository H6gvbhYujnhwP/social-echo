/**
 * Post Type Mapping - Backward Compatible Display Labels
 * 
 * Maps legacy post type keys to new display labels without rewriting database.
 * Supports the v8.8 post type restructure:
 * - 'informational' + 'advice' → "Information & Advice"
 * - 'random' → "Random / Fun Facts" (new)
 * - 'selling' → "Selling" (unchanged)
 * - 'news' → "News" (unchanged)
 */

/**
 * Post type keys (internal, stored in database)
 * Includes both canonical and legacy types for backward compatibility
 */
export type PostTypeKey = 'selling' | 'information_advice' | 'random' | 'news' | 'informational' | 'advice'

/**
 * Canonical post type keys (v8.8)
 * These are the only types used in the application after normalization
 */
export type CanonicalPostTypeKey = 'selling' | 'information_advice' | 'random' | 'news'

/**
 * Post type display labels (shown in UI)
 */
export type PostTypeDisplay = 'Selling' | 'Information & Advice' | 'Random / Fun Facts' | 'News'

/**
 * Post type configuration
 */
export type PostTypeConfig = {
  key: PostTypeKey
  display: PostTypeDisplay
  description: string
  icon: string
  legacyKeys?: PostTypeKey[] // For backward compatibility
}

/**
 * All post type configurations
 */
export const POST_TYPE_CONFIGS: PostTypeConfig[] = [
  {
    key: 'selling',
    display: 'Selling',
    description: 'Persuasive posts with clear CTAs to drive action',
    icon: '💰',
  },
  {
    key: 'information_advice',
    display: 'Information & Advice',
    description: 'Actionable tips and insights for your audience',
    icon: '💡',
    legacyKeys: ['informational', 'advice']
  },
  {
    key: 'random',
    display: 'Random / Fun Facts',
    description: 'Engaging content bridging interesting facts to business value',
    icon: '🎲',
  },
  {
    key: 'news',
    display: 'News',
    description: 'Timely commentary on sector-relevant news and trends',
    icon: '📰',
  }
]

/**
 * Map post type key to display label
 */
export function postTypeDisplay(postType: string): PostTypeDisplay {
  // Handle legacy keys
  if (postType === 'informational' || postType === 'advice') {
    return 'Information & Advice'
  }
  
  // Find matching config
  const config = POST_TYPE_CONFIGS.find(c => c.key === postType)
  if (config) {
    return config.display
  }
  
  // Fallback for unknown types
  console.warn(`Unknown post type: ${postType}`)
  return 'Information & Advice' // Safe default
}

/**
 * Alias for postTypeDisplay (for backward compatibility)
 */
export const getPostTypeDisplayLabel = postTypeDisplay

/**
 * Map display label to post type key
 */
export function displayToPostType(display: PostTypeDisplay): PostTypeKey {
  const config = POST_TYPE_CONFIGS.find(c => c.display === display)
  return config?.key || 'information_advice'
}

/**
 * Get post type config by key (handles legacy keys)
 */
export function getPostTypeConfig(postType: string): PostTypeConfig | undefined {
  // Direct match
  let config = POST_TYPE_CONFIGS.find(c => c.key === postType)
  if (config) return config
  
  // Check legacy keys
  config = POST_TYPE_CONFIGS.find(c => c.legacyKeys?.includes(postType as PostTypeKey))
  return config
}

/**
 * Get all active post type keys (for generation)
 */
export function getActivePostTypeKeys(): PostTypeKey[] {
  return POST_TYPE_CONFIGS.map(c => c.key)
}

/**
 * Get all post type display labels (for UI)
 */
export function getAllPostTypeDisplays(): PostTypeDisplay[] {
  return POST_TYPE_CONFIGS.map(c => c.display)
}

/**
 * Check if a post type key is valid (including legacy)
 */
export function isValidPostType(postType: string): boolean {
  return getPostTypeConfig(postType) !== undefined
}

/**
 * Normalize post type key (convert legacy to current)
 * Always returns a canonical post type
 */
export function normalizePostType(postType: string): CanonicalPostTypeKey {
  if (postType === 'informational' || postType === 'advice') {
    return 'information_advice'
  }
  
  const config = POST_TYPE_CONFIGS.find(c => c.key === postType)
  const key = config?.key as CanonicalPostTypeKey | undefined
  return key || 'information_advice'
}

/**
 * Get post type icon
 */
export function getPostTypeIcon(postType: string): string {
  const config = getPostTypeConfig(postType)
  return config?.icon || '💡'
}

/**
 * Get post type description
 */
export function getPostTypeDescription(postType: string): string {
  const config = getPostTypeConfig(postType)
  return config?.description || 'Actionable tips and insights for your audience'
}

/**
 * Filter post history by post type (handles legacy keys)
 */
export function filterByPostType(posts: any[], postType: PostTypeKey): any[] {
  const config = getPostTypeConfig(postType)
  if (!config) return []
  
  return posts.filter(post => {
    // Direct match
    if (post.postType === postType) return true
    
    // Legacy match
    if (config.legacyKeys?.includes(post.postType as PostTypeKey)) return true
    
    return false
  })
}

/**
 * Group post history by normalized post type
 */
export function groupByPostType(posts: any[]): Record<PostTypeDisplay, any[]> {
  const groups: Record<string, any[]> = {}
  
  for (const display of getAllPostTypeDisplays()) {
    groups[display] = []
  }
  
  for (const post of posts) {
    const display = postTypeDisplay(post.postType)
    if (!groups[display]) {
      groups[display] = []
    }
    groups[display].push(post)
  }
  
  return groups as Record<PostTypeDisplay, any[]>
}

