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
  
  // Industry-specific POSITIVE keywords boost
  // Boost regulatory, compliance, and industry-specific terms
  const industryLower = profile.industry.toLowerCase()
  
  // Financial Services specific boosts
  if (industryLower.includes('financial') || industryLower.includes('finance') || 
      industryLower.includes('leasing') || industryLower.includes('lending')) {
    const financialBoostKeywords = [
      'fca', 'financial conduct authority', 'regulation', 'compliance',
      'lending', 'loan', 'credit', 'asset finance', 'leasing',
      'fintech regulation', 'banking rules', 'consumer credit',
      'prudential', 'capital requirements', 'financial services act',
      'mortgage', 'interest rate', 'bank of england', 'monetary policy'
    ]
    
    for (const boostKeyword of financialBoostKeywords) {
      if (titleLower.includes(boostKeyword)) {
        score += 15 // Strong positive boost for industry-specific terms
      }
    }
  }
  
  // Healthcare specific boosts
  if (industryLower.includes('health') || industryLower.includes('medical') || 
      industryLower.includes('pharmaceutical')) {
    const healthBoostKeywords = [
      'nhs', 'nice', 'mhra', 'cqc', 'clinical', 'patient',
      'healthcare regulation', 'medical device', 'drug approval',
      'health and social care', 'gp', 'hospital', 'prescription'
    ]
    
    for (const boostKeyword of healthBoostKeywords) {
      if (titleLower.includes(boostKeyword)) {
        score += 15
      }
    }
  }
  
  // Legal specific boosts
  if (industryLower.includes('legal') || industryLower.includes('law')) {
    const legalBoostKeywords = [
      'court', 'legislation', 'statute', 'case law', 'solicitor',
      'barrister', 'tribunal', 'legal aid', 'law society', 'sra'
    ]
    
    for (const boostKeyword of legalBoostKeywords) {
      if (titleLower.includes(boostKeyword)) {
        score += 15
      }
    }
  }
  
  // Industry-specific negative keywords penalty
  // Tech companies WANT AI news, traditional industries DON'T
  const isTechCompany = 
    industryLower.includes('software') ||
    industryLower.includes('technology') ||
    industryLower.includes('it services') ||
    industryLower.includes('saas') ||
    industryLower.includes('tech') ||
    industryLower.includes('startup') ||
    industryLower.includes('digital') ||
    industryLower.includes('ai ') ||
    industryLower.includes('data analytics') ||
    industryLower.includes('automation')
  
  // Only apply AI/tech penalty for NON-tech companies
  if (!isTechCompany) {
    const negativeKeywords = [
      'artificial intelligence', 'ai adoption', 'ai tools', 'ai revolution',
      'machine learning', 'chatgpt', 'generative ai', 'ai-powered',
      'automation software', 'tech startup', 'software development',
      'digital transformation', 'ai integration', 'embracing ai',
      'ai technology', 'adopt ai', 'ai solutions', 'ai innovation'
    ]
    
    for (const negKeyword of negativeKeywords) {
      if (titleLower.includes(negKeyword)) {
        // STRONG penalty for traditional industries - increased from -5 to -25
        score -= 25
      }
    }
    
    // Additional penalty for generic "SME adopts tech" stories
    if ((titleLower.includes('sme') || titleLower.includes('small business')) && 
        (titleLower.includes('adopt') || titleLower.includes('embrace') || titleLower.includes('integrate'))) {
      score -= 15
    }
  }
  // Tech companies get NO penalty - AI news is relevant to them
  
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
 * Build industry-specific search queries
 */
function buildIndustrySpecificQueries(industry: string): string[] {
  const industryLower = industry.toLowerCase()
  const queries: string[] = []
  
  // Financial Services / Leasing / Lending
  if (industryLower.includes('financial') || industryLower.includes('finance') || 
      industryLower.includes('leasing') || industryLower.includes('lending') ||
      industryLower.includes('asset finance')) {
    queries.push('FCA regulations UK')
    queries.push('UK lending rules')
    queries.push('asset finance UK news')
    queries.push('leasing industry UK')
    queries.push('consumer credit UK')
    queries.push('financial services regulation UK')
    queries.push('UK banking compliance')
    queries.push('financial conduct authority news')
  }
  
  // Healthcare / Medical
  if (industryLower.includes('health') || industryLower.includes('medical') || 
      industryLower.includes('pharmaceutical')) {
    queries.push('NHS news UK')
    queries.push('healthcare regulation UK')
    queries.push('MHRA updates')
    queries.push('CQC inspection UK')
    queries.push('medical device regulation UK')
    queries.push('pharmaceutical industry UK')
  }
  
  // Legal Services
  if (industryLower.includes('legal') || industryLower.includes('law')) {
    queries.push('UK law changes')
    queries.push('legal sector UK news')
    queries.push('court ruling UK')
    queries.push('legislation UK')
    queries.push('Law Society news')
  }
  
  // Construction / Property
  if (industryLower.includes('construction') || industryLower.includes('property') || 
      industryLower.includes('real estate')) {
    queries.push('UK construction industry news')
    queries.push('building regulations UK')
    queries.push('property market UK')
    queries.push('housing development UK')
  }
  
  // Manufacturing
  if (industryLower.includes('manufacturing') || industryLower.includes('production')) {
    queries.push('UK manufacturing news')
    queries.push('supply chain UK')
    queries.push('industrial production UK')
    queries.push('factory output UK')
  }
  
  // Retail / E-commerce
  if (industryLower.includes('retail') || industryLower.includes('ecommerce') || 
      industryLower.includes('e-commerce')) {
    queries.push('UK retail news')
    queries.push('consumer spending UK')
    queries.push('high street UK')
    queries.push('online shopping UK')
  }
  
  // Hospitality / Tourism
  if (industryLower.includes('hospitality') || industryLower.includes('tourism') || 
      industryLower.includes('hotel') || industryLower.includes('restaurant')) {
    queries.push('UK hospitality industry')
    queries.push('tourism UK news')
    queries.push('restaurant sector UK')
    queries.push('hotel industry UK')
  }
  
  return queries
}

/**
 * Build search queries from user profile
 */
function buildSearchQueries(profile: ProfileData): string[] {
  const queries: string[] = []
  
  // Clean up industry string (trim whitespace)
  const industry = profile.industry.trim()
  
  // FIRST: Add highly specific industry queries (if available)
  const industrySpecificQueries = buildIndustrySpecificQueries(industry)
  queries.push(...industrySpecificQueries)
  
  // Primary query: Industry + UK (only if no specific queries added)
  if (industrySpecificQueries.length === 0) {
    queries.push(`${industry} UK`)
  }
  
  // Secondary query: Industry + news
  queries.push(`${industry} news UK`)
  
  // If keywords exist, add specific queries
  if (profile.keywords.length > 0) {
    const topKeywords = profile.keywords.slice(0, 3).join(' ')
    queries.push(`${topKeywords} ${industry}`)
  }
  
  // Products/services specific (extract key terms)
  const productTerms = profile.products_services
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 4 && !['provide', 'provides', 'offering', 'services'].includes(word))
    .slice(0, 3)
    .join(' ')
  
  if (productTerms) {
    queries.push(`${productTerms} UK`)
  }
  
  // Industry + regulation (for regulated industries)
  const industryLower = industry.toLowerCase()
  if (industryLower.includes('financial') || industryLower.includes('health') || 
      industryLower.includes('legal') || industryLower.includes('pharmaceutical')) {
    queries.push(`${industry} regulation UK`)
    queries.push(`${industry} compliance UK`)
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
    sortedHeadlines.slice(0, 5).map(h => ({
      title: h.title.substring(0, 80) + '...',
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
