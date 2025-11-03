/**
 * Custom RSS Feed Service
 * 
 * Fetches and parses user-defined RSS feeds to provide personalized
 * content sources for AI-generated posts.
 */

import Parser from 'rss-parser'
import { prisma } from '@/lib/prisma'

const parser = new Parser({
  timeout: 10000, // 10 second timeout
  headers: {
    'User-Agent': 'SocialEcho/1.0'
  }
})

export type RssArticle = {
  title: string
  link?: string
  pubDate?: string
  source: string
  contentSnippet?: string
  content?: string
}

/**
 * Check if article is recent (within specified days)
 */
function isRecent(article: RssArticle, maxDays: number = 30): boolean {
  if (!article.pubDate) return true // Include if no date available
  
  try {
    const pubDate = new Date(article.pubDate)
    const now = new Date()
    const daysDiff = (now.getTime() - pubDate.getTime()) / (1000 * 60 * 60 * 24)
    
    return daysDiff <= maxDays
  } catch {
    return true // Include if date parsing fails
  }
}

/**
 * Fetch and parse all RSS feeds for a user
 */
export async function fetchUserRssFeeds(
  userId: string,
  options: {
    maxDays?: number
    maxArticlesPerFeed?: number
  } = {}
): Promise<RssArticle[]> {
  const {
    maxDays = 30,
    maxArticlesPerFeed = 10
  } = options
  
  console.log('[custom-rss-service] Fetching RSS feeds for user:', userId)
  
  // Get user's custom RSS feeds from database
  const userFeeds = await prisma.customRssFeed.findMany({
    where: { userId },
    select: {
      url: true,
      name: true
    }
  })
  
  if (userFeeds.length === 0) {
    console.log('[custom-rss-service] No custom RSS feeds found for user')
    return []
  }
  
  console.log('[custom-rss-service] Found', userFeeds.length, 'feeds to fetch')
  
  const allArticles: RssArticle[] = []
  
  // Fetch articles from each feed
  for (const feed of userFeeds) {
    try {
      console.log('[custom-rss-service] Fetching feed:', feed.url)
      
      const parsedFeed = await parser.parseURL(feed.url)
      const feedName = feed.name || parsedFeed.title || 'RSS Feed'
      
      let articlesAdded = 0
      
      for (const item of parsedFeed.items || []) {
        if (articlesAdded >= maxArticlesPerFeed) break
        
        const title = (item.title || '').trim()
        if (!title) continue
        
        const article: RssArticle = {
          title,
          link: item.link,
          pubDate: item.pubDate,
          source: feedName,
          contentSnippet: item.contentSnippet || item.content?.substring(0, 500),
          content: item.content
        }
        
        // Filter by date
        if (!isRecent(article, maxDays)) {
          continue
        }
        
        allArticles.push(article)
        articlesAdded++
      }
      
      console.log('[custom-rss-service] Added', articlesAdded, 'articles from', feedName)
      
    } catch (error) {
      console.error(`[custom-rss-service] Failed to fetch feed "${feed.url}":`, error)
      // Continue with other feeds
    }
  }
  
  console.log('[custom-rss-service] Total articles fetched:', allArticles.length)
  
  return allArticles
}

/**
 * Get a random article from user's RSS feeds
 * This is the primary function used by the AI service
 */
export async function getRandomRssArticle(userId: string): Promise<RssArticle | null> {
  try {
    const articles = await fetchUserRssFeeds(userId, {
      maxDays: 30,
      maxArticlesPerFeed: 10
    })
    
    if (articles.length === 0) {
      return null
    }
    
    // Select a random article
    const randomIndex = Math.floor(Math.random() * articles.length)
    const selectedArticle = articles[randomIndex]
    
    console.log('[custom-rss-service] Selected random article:', {
      title: selectedArticle.title.substring(0, 60) + '...',
      source: selectedArticle.source
    })
    
    return selectedArticle
  } catch (error) {
    console.error('[custom-rss-service] Error getting random article:', error)
    return null
  }
}

/**
 * Validate an RSS feed URL by attempting to parse it
 */
export async function validateRssFeedUrl(url: string): Promise<{
  valid: boolean
  feedTitle?: string
  error?: string
}> {
  try {
    const feed = await parser.parseURL(url)
    
    if (!feed.items || feed.items.length === 0) {
      return {
        valid: false,
        error: 'Feed appears to be empty or invalid'
      }
    }
    
    return {
      valid: true,
      feedTitle: feed.title || 'RSS Feed'
    }
  } catch (error: any) {
    console.error('[custom-rss-service] Feed validation error:', error)
    return {
      valid: false,
      error: error.message || 'Failed to parse RSS feed'
    }
  }
}
