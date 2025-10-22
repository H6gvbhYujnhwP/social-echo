/**
 * News Provider - Curated News Snippets by Sector + Country
 * 
 * Provides curated news snippets for the News post type.
 * Designed to be easily replaced with a live news API in the future.
 */

export type NewsSnippet = {
  headline: string
  summary: string
  whyItMatters: string
  regionTag: string // 'UK', 'US', 'CA', 'AU', 'world'
  sectorTags: string[]
  recencyTag: 'recent' | 'evergreen'
}

/**
 * Curated news snippets (can be replaced with live API)
 */
const NEWS_SNIPPETS: NewsSnippet[] = [
  // UK Tech/Business
  {
    headline: 'UK SMEs Embrace AI Tools at Record Pace',
    summary: 'Small and medium enterprises across the UK are adopting AI productivity tools faster than expected, with 40% now using some form of AI assistance.',
    whyItMatters: 'Early adopters are seeing 20-30% productivity gains, creating competitive pressure for others to follow suit.',
    regionTag: 'UK',
    sectorTags: ['technology', 'SME', 'AI', 'productivity'],
    recencyTag: 'evergreen'
  },
  {
    headline: 'Remote Work Becomes Permanent for UK Tech Sector',
    summary: 'Major UK tech firms are making remote work permanent, with hybrid models becoming the new standard.',
    whyItMatters: 'This shift is changing talent acquisition strategies and office space requirements across the sector.',
    regionTag: 'UK',
    sectorTags: ['technology', 'remote work', 'HR'],
    recencyTag: 'evergreen'
  },
  {
    headline: 'UK Cybersecurity Spending Hits All-Time High',
    summary: 'British businesses are investing record amounts in cybersecurity following a surge in ransomware attacks.',
    whyItMatters: 'SMEs are particularly vulnerable, with 60% lacking basic security protocols.',
    regionTag: 'UK',
    sectorTags: ['cybersecurity', 'technology', 'SME'],
    recencyTag: 'evergreen'
  },
  
  // US Tech/Business
  {
    headline: 'US Small Businesses Face Talent Shortage',
    summary: 'American SMEs report difficulty finding skilled workers, with 70% citing hiring as their top challenge.',
    whyItMatters: 'Companies are turning to automation and AI to fill gaps, accelerating digital transformation.',
    regionTag: 'US',
    sectorTags: ['HR', 'SME', 'technology'],
    recencyTag: 'evergreen'
  },
  {
    headline: 'E-commerce Sales Surge for US Small Retailers',
    summary: 'Small retailers in the US are seeing online sales grow 45% year-over-year as consumer habits shift.',
    whyItMatters: 'Brick-and-mortar businesses must adapt or risk losing market share to digital-first competitors.',
    regionTag: 'US',
    sectorTags: ['e-commerce', 'retail', 'SME'],
    recencyTag: 'evergreen'
  },
  {
    headline: 'US Businesses Prioritize Customer Experience Over Price',
    summary: 'A new study shows 80% of US consumers will pay more for better customer service.',
    whyItMatters: 'This shift is forcing businesses to invest in CX technology and training.',
    regionTag: 'US',
    sectorTags: ['customer service', 'CX', 'business'],
    recencyTag: 'evergreen'
  },
  
  // World/Global
  {
    headline: 'Global Supply Chain Disruptions Continue',
    summary: 'Businesses worldwide are still facing supply chain challenges, forcing them to diversify suppliers.',
    whyItMatters: 'Companies that build resilient supply chains now will have a competitive advantage.',
    regionTag: 'world',
    sectorTags: ['supply chain', 'logistics', 'business'],
    recencyTag: 'evergreen'
  },
  {
    headline: 'Sustainability Becomes Business Priority Worldwide',
    summary: 'Companies globally are investing in sustainable practices as consumers demand environmental responsibility.',
    whyItMatters: 'Businesses that ignore sustainability risk losing customers and investors.',
    regionTag: 'world',
    sectorTags: ['sustainability', 'business', 'ESG'],
    recencyTag: 'evergreen'
  },
  {
    headline: 'Social Media Marketing ROI Questioned by Businesses',
    summary: 'Companies are reassessing their social media strategies as organic reach declines and ad costs rise.',
    whyItMatters: 'Businesses need to focus on quality content and community building over vanity metrics.',
    regionTag: 'world',
    sectorTags: ['marketing', 'social media', 'business'],
    recencyTag: 'evergreen'
  },
  {
    headline: 'Four-Day Work Week Trials Show Promising Results',
    summary: 'Global trials of the four-day work week report maintained productivity with improved employee wellbeing.',
    whyItMatters: 'Forward-thinking companies are exploring flexible work arrangements to attract and retain talent.',
    regionTag: 'world',
    sectorTags: ['HR', 'workplace', 'productivity'],
    recencyTag: 'evergreen'
  },
  {
    headline: 'Video Content Dominates Business Marketing',
    summary: 'Short-form video is now the most effective content format, with 85% of businesses using it.',
    whyItMatters: 'Companies without a video strategy are missing opportunities to engage their audience.',
    regionTag: 'world',
    sectorTags: ['marketing', 'content', 'video'],
    recencyTag: 'evergreen'
  },
  {
    headline: 'Data Privacy Regulations Tighten Globally',
    summary: 'New data protection laws are being introduced worldwide, following GDPR\'s lead.',
    whyItMatters: 'Businesses must ensure compliance or face significant fines and reputational damage.',
    regionTag: 'world',
    sectorTags: ['data privacy', 'compliance', 'business'],
    recencyTag: 'evergreen'
  }
]

/**
 * Get keywords for sector and country
 */
export function getKeywordsFor(sector: string, country?: string): string[] {
  const sectorLower = sector.toLowerCase()
  const keywords: string[] = []
  
  // Sector-based keywords
  if (sectorLower.includes('tech') || sectorLower.includes('it') || sectorLower.includes('software')) {
    keywords.push('technology', 'AI', 'cybersecurity', 'software')
  }
  if (sectorLower.includes('retail') || sectorLower.includes('shop') || sectorLower.includes('store')) {
    keywords.push('retail', 'e-commerce', 'customer service')
  }
  if (sectorLower.includes('market') || sectorLower.includes('advertis')) {
    keywords.push('marketing', 'social media', 'content', 'video')
  }
  if (sectorLower.includes('hr') || sectorLower.includes('recruit') || sectorLower.includes('talent')) {
    keywords.push('HR', 'workplace', 'remote work', 'talent')
  }
  if (sectorLower.includes('finance') || sectorLower.includes('account')) {
    keywords.push('finance', 'business', 'compliance')
  }
  
  // Generic business keywords
  keywords.push('business', 'SME', 'productivity')
  
  // Country-specific
  if (country) {
    keywords.push(country)
  }
  
  return keywords
}

/**
 * Score a news snippet's relevance to sector and country
 */
function scoreRelevance(snippet: NewsSnippet, keywords: string[], country?: string): number {
  let score = 0
  
  // Country match (high priority)
  if (country && snippet.regionTag === country) {
    score += 10
  } else if (snippet.regionTag === 'world') {
    score += 5 // World news is always somewhat relevant
  }
  
  // Sector tag matches
  const keywordsLower = keywords.map(k => k.toLowerCase())
  for (const tag of snippet.sectorTags) {
    if (keywordsLower.includes(tag.toLowerCase())) {
      score += 3
    }
  }
  
  // Recency bonus
  if (snippet.recencyTag === 'recent') {
    score += 2
  }
  
  return score
}

/**
 * Get curated news snippets for sector and country
 */
export function getCuratedNews(
  sector: string,
  country?: string,
  options: {
    limit?: number
    minScore?: number
  } = {}
): {
  snippets: NewsSnippet[]
  hasRelevant: boolean
  fallbackReason?: string
} {
  const { limit = 6, minScore = 5 } = options
  
  // Get keywords for sector and country
  const keywords = getKeywordsFor(sector, country)
  
  // Score and sort snippets
  const scored = NEWS_SNIPPETS.map(snippet => ({
    snippet,
    score: scoreRelevance(snippet, keywords, country)
  }))
  
  // Sort by score (highest first)
  scored.sort((a, b) => b.score - a.score)
  
  // Filter by minimum score
  const relevant = scored.filter(s => s.score >= minScore)
  
  if (relevant.length === 0) {
    return {
      snippets: [],
      hasRelevant: false,
      fallbackReason: `No news snippets found with relevance score >= ${minScore} for sector "${sector}" and country "${country || 'world'}"`
    }
  }
  
  // Take top N
  const snippets = relevant.slice(0, limit).map(s => s.snippet)
  
  return {
    snippets,
    hasRelevant: true
  }
}

/**
 * Format news snippets for prompt
 */
export function formatNewsForPrompt(snippets: NewsSnippet[]): string[] {
  return snippets.map(s => 
    `- ${s.headline}\n  Summary: ${s.summary}\n  Why it matters: ${s.whyItMatters}\n  Region: ${s.regionTag}`
  )
}

/**
 * Get stats for debugging
 */
export function getNewsStats(): {
  total: number
  byRegion: Record<string, number>
  bySector: Record<string, number>
} {
  const byRegion: Record<string, number> = {}
  const bySector: Record<string, number> = {}
  
  for (const snippet of NEWS_SNIPPETS) {
    byRegion[snippet.regionTag] = (byRegion[snippet.regionTag] || 0) + 1
    
    for (const tag of snippet.sectorTags) {
      bySector[tag] = (bySector[tag] || 0) + 1
    }
  }
  
  return {
    total: NEWS_SNIPPETS.length,
    byRegion,
    bySector
  }
}

