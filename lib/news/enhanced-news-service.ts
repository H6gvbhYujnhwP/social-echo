/**
 * Enhanced News Service
 * 
 * Fetches real sector-based news using Google News RSS feeds
 * with relevance scoring and graceful fallback to creative generation.
 */

import Parser from 'rss-parser'

const parser = new Parser()

export type Headline = {
  title: string
  link?: string
  pubDate?: string
  source?: string
  relevanceScore?: number
}

export type ProfileData = {
  industry: string
  products_services: string
  keywords: string[]
  target_audience: string
  business_name: string
}

/**
 * Calculate relevance score for a headline based on user's profile
 */
function calculateRelevanceScore(headline: Headline, profile: ProfileData): number {
  let score = 0
  const titleLower = headline.title.toLowerCase()
  
  // Industry match (highest weight)
  const industryTerms = profile.industry.toLowerCase().split(/\s+/)
  for (const term of industryTerms) {
    if (term.length > 3 && titleLower.includes(term)) {
      score += 10
    }
  }
  
  // Products/services match
  const productTerms = profile.products_services.toLowerCase().split(/\s+/)
  for (const term of productTerms) {
    if (term.length > 3 && titleLower.includes(term)) {
      score += 8
    }
  }
  
  // Keywords match
  for (const keyword of profile.keywords) {
    if (keyword.length > 2 && titleLower.includes(keyword.toLowerCase())) {
      score += 6
    }
  }
  
  // Target audience match
  const audienceTerms = profile.target_audience.toLowerCase().split(/\s+/)
  for (const term of audienceTerms) {
    if (term.length > 3 && titleLower.includes(term)) {
      score += 5
    }
  }
  
  // Recency bonus (if published in last 7 days)
  if (headline.pubDate) {
    const pubDate = new Date(headline.pubDate)
    const now = new Date()
    const daysDiff = (now.getTime() - pubDate.getTime()) / (1000 * 60 * 60 * 24)
    
    if (daysDiff <= 7) {
      score += 5
    } else if (daysDiff <= 14) {
      score += 3
    } else if (daysDiff <= 30) {
      score += 1
    }
  }
  
  return score
}

/**
 * Build search queries from user profile
 */
function buildSearchQueries(profile: ProfileData): string[] {
  const queries: string[] = []
  
  // Primary query: Industry + UK
  queries.push(`${profile.industry} UK`)
  
  // Secondary query: Industry + SME/business
  queries.push(`${profile.industry} SME business`)
  
  // Tertiary query: Industry + innovation/technology
  queries.push(`${profile.industry} innovation technology`)
  
  // If keywords exist, add specific queries
  if (profile.keywords.length > 0) {
    const topKeywords = profile.keywords.slice(0, 3).join(' ')
    queries.push(`${topKeywords} ${profile.industry}`)
  }
  
  // Products/services specific
  const productKeywords = profile.products_services.split(/\s+/).slice(0, 3).join(' ')
  if (productKeywords) {
    queries.push(`${productKeywords} news`)
  }
  
  return queries
}

/**
 * Check if headline is within date range (last 30 days)
 */
function isRecent(headline: Headline, maxDays: number = 30): boolean {
  if (!headline.pubDate) return true // Include if no date available
  
  try {
    const pubDate = new Date(headline.pubDate)
    const now = new Date()
    const daysDiff = (now.getTime() - pubDate.getTime()) / (1000 * 60 * 60 * 24)
    
    return daysDiff <= maxDays
  } catch {
    return true // Include if date parsing fails
  }
}

/**
 * Fetch sector-relevant headlines with relevance scoring
 */
export async function fetchSectorNews(
  profile: ProfileData,
  options: {
    limit?: number
    minRelevanceScore?: number
    maxDays?: number
  } = {}
): Promise<{
  headlines: Headline[]
  hasRelevantNews: boolean
  fallbackReason?: string
}> {
  const {
    limit = 6,
    minRelevanceScore = 5,
    maxDays = 30
  } = options
  
  console.log('[news-service] Fetching news for:', {
    industry: profile.industry,
    keywords: profile.keywords.slice(0, 3)
  })
  
  // Build search queries
  const queries = buildSearchQueries(profile)
  console.log('[news-service] Search queries:', queries)
  
  // Fetch headlines from all queries
  const allHeadlines: Headline[] = []
  
  for (const query of queries) {
    const feedUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-GB&gl=GB&ceid=GB:en`
    
    try {
      const feed = await parser.parseURL(feedUrl)
      
      for (const item of feed.items || []) {
        const title = (item.title || '').trim()
        if (!title) continue
        
        const headline: Headline = {
          title,
          link: item.link,
          pubDate: item.pubDate,
          source: (item as any).creator || (item as any).source || 'News'
        }
        
        // Filter by date
        if (!isRecent(headline, maxDays)) {
          continue
        }
        
        // Calculate relevance score
        headline.relevanceScore = calculateRelevanceScore(headline, profile)
        
        allHeadlines.push(headline)
      }
    } catch (error) {
      console.error(`[news-service] Failed to fetch from query "${query}":`, error)
      // Continue with other queries
    }
  }
  
  console.log('[news-service] Total headlines fetched:', allHeadlines.length)
  
  // Deduplicate by title
  const dedup = new Map<string, Headline>()
  for (const headline of allHeadlines) {
    const existing = dedup.get(headline.title)
    if (!existing || (headline.relevanceScore || 0) > (existing.relevanceScore || 0)) {
      dedup.set(headline.title, headline)
    }
  }
  
  // Sort by relevance score (highest first)
  const sortedHeadlines = Array.from(dedup.values())
    .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
  
  console.log('[news-service] Top headlines by relevance:', 
    sortedHeadlines.slice(0, 3).map(h => ({
      title: h.title.substring(0, 60) + '...',
      score: h.relevanceScore
    }))
  )
  
  // Filter by minimum relevance score
  const relevantHeadlines = sortedHeadlines.filter(
    h => (h.relevanceScore || 0) >= minRelevanceScore
  )
  
  // Determine if we have relevant news
  const hasRelevantNews = relevantHeadlines.length > 0
  
  let fallbackReason: string | undefined
  if (!hasRelevantNews) {
    if (allHeadlines.length === 0) {
      fallbackReason = 'No news headlines found for sector'
    } else if (relevantHeadlines.length === 0) {
      fallbackReason = `No headlines met minimum relevance score (${minRelevanceScore})`
    }
  }
  
  console.log('[news-service] Result:', {
    hasRelevantNews,
    relevantCount: relevantHeadlines.length,
    fallbackReason
  })
  
  return {
    headlines: relevantHeadlines.slice(0, limit),
    hasRelevantNews,
    fallbackReason
  }
}

/**
 * Legacy function for backward compatibility
 */
export async function fetchHeadlines(sector: string, limit = 6): Promise<Headline[]> {
  const feedUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(sector + ' UK')}&hl=en-GB&gl=GB&ceid=GB:en`
  
  try {
    const feed = await parser.parseURL(feedUrl)
    const headlines: Headline[] = []
    
    for (const item of feed.items || []) {
      const title = (item.title || '').trim()
      if (!title) continue
      
      headlines.push({
        title,
        link: item.link,
        pubDate: item.pubDate,
        source: (item as any).creator || (item as any).source || 'News'
      })
      
      if (headlines.length >= limit) break
    }
    
    return headlines
  } catch (error) {
    console.error('[news-service] Failed to fetch headlines:', error)
    return []
  }
}

