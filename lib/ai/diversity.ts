/**
 * Diversity Engine - Reduce Repetition and Increase Freshness
 * 
 * Provides style rotation, hook templates, phrase banning, and n-gram de-duplication
 * to ensure generated content stays fresh across multiple generations.
 */

import { prisma } from '../prisma'

/**
 * Style variations for tone rotation
 */
export const STYLE_VARIATIONS = [
  'friendly',
  'witty',
  'professional',
  'bold'
] as const

export type StyleVariation = typeof STYLE_VARIATIONS[number]

/**
 * Hook templates for opening lines
 */
export const HOOK_TEMPLATES = [
  'Did you know...',
  'Pro tip:',
  'Here\'s what most people miss:',
  'The truth about',
  'Stop doing this:',
  'Quick win:',
  'Unpopular opinion:',
  'Real talk:',
  'Here\'s the thing:',
  'Let me be blunt:',
  'Myth:',
  'Confession:',
  'Hot take:',
  'Plot twist:',
  'Fun fact:'
]

/**
 * Banned phrases to avoid generic/overused language
 */
export const PHRASE_BAN_LIST = [
  'game changer',
  'paradigm shift',
  'synergy',
  'leverage',
  'circle back',
  'touch base',
  'low-hanging fruit',
  'think outside the box',
  'move the needle',
  'at the end of the day',
  'it is what it is',
  'take it to the next level',
  'win-win',
  'best practices',
  'thought leader',
  'deep dive',
  'reach out',
  'ping me',
  'let\'s unpack',
  'double-click on'
]

/**
 * Post structures for variety
 */
export const POST_STRUCTURES = [
  'hook + insight + CTA',
  'myth + truth + action',
  'story + lesson + invitation',
  'question + answer + reflection',
  'problem + solution + next step',
  'stat + context + takeaway'
]

/**
 * Select a style variation based on seed and avoid recent styles
 */
export function selectStyle(seed: number, recentStyles: string[] = []): StyleVariation {
  // Filter out recently used styles
  const availableStyles = STYLE_VARIATIONS.filter(s => !recentStyles.includes(s))
  
  if (availableStyles.length === 0) {
    // All styles used recently, reset
    return STYLE_VARIATIONS[seed % STYLE_VARIATIONS.length]
  }
  
  return availableStyles[seed % availableStyles.length]
}

/**
 * Select a hook template based on seed
 */
export function selectHook(seed: number): string {
  return HOOK_TEMPLATES[seed % HOOK_TEMPLATES.length]
}

/**
 * Select a post structure based on seed
 */
export function selectStructure(seed: number): string {
  return POST_STRUCTURES[seed % POST_STRUCTURES.length]
}

/**
 * Check if text contains banned phrases
 */
export function containsBannedPhrases(text: string): { hasBanned: boolean; found: string[] } {
  const lowerText = text.toLowerCase()
  const found = PHRASE_BAN_LIST.filter(phrase => lowerText.includes(phrase.toLowerCase()))
  
  return {
    hasBanned: found.length > 0,
    found
  }
}

/**
 * Extract trigrams (3-word sequences) from text
 */
function extractTrigrams(text: string): Set<string> {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .split(/\s+/)
    .filter(w => w.length > 0)
  
  const trigrams = new Set<string>()
  
  for (let i = 0; i < words.length - 2; i++) {
    const trigram = `${words[i]} ${words[i + 1]} ${words[i + 2]}`
    trigrams.add(trigram)
  }
  
  return trigrams
}

/**
 * Calculate trigram overlap between two texts
 */
function calculateTrigramOverlap(text1: string, text2: string): number {
  const trigrams1 = extractTrigrams(text1)
  const trigrams2 = extractTrigrams(text2)
  
  if (trigrams1.size === 0 || trigrams2.size === 0) {
    return 0
  }
  
  let overlap = 0
  for (const trigram of trigrams1) {
    if (trigrams2.has(trigram)) {
      overlap++
    }
  }
  
  // Return percentage overlap relative to smaller set
  const minSize = Math.min(trigrams1.size, trigrams2.size)
  return (overlap / minSize) * 100
}

/**
 * Check for repetition against recent posts
 */
export async function checkRepetition(
  userId: string,
  newText: string,
  maxPosts: number = 20
): Promise<{
  isRepetitive: boolean
  maxOverlap: number
  averageOverlap: number
  recentPosts: number
}> {
  // Fetch recent posts
  const recentPosts = await prisma.postHistory.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: maxPosts,
    select: { postText: true }
  })
  
  if (recentPosts.length === 0) {
    return {
      isRepetitive: false,
      maxOverlap: 0,
      averageOverlap: 0,
      recentPosts: 0
    }
  }
  
  // Calculate overlap with each recent post
  const overlaps = recentPosts.map(post => calculateTrigramOverlap(newText, post.postText))
  
  const maxOverlap = Math.max(...overlaps)
  const averageOverlap = overlaps.reduce((sum, val) => sum + val, 0) / overlaps.length
  
  // Consider repetitive if max overlap > 30% or average > 15%
  const isRepetitive = maxOverlap > 30 || averageOverlap > 15
  
  return {
    isRepetitive,
    maxOverlap,
    averageOverlap,
    recentPosts: recentPosts.length
  }
}

/**
 * Get recent styles used by user
 */
export async function getRecentStyles(userId: string, maxPosts: number = 10): Promise<string[]> {
  const recentPosts = await prisma.postHistory.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: maxPosts,
    select: { tone: true }
  })
  
  return recentPosts.map(p => p.tone)
}

/**
 * Generate diversity parameters for a post
 */
export async function generateDiversityParams(userId: string, seed: number): Promise<{
  style: StyleVariation
  hook: string
  structure: string
  temperature: number
  topP: number
}> {
  // Get recent styles to avoid repetition
  const recentStyles = await getRecentStyles(userId, 5)
  
  // Select style avoiding recent ones
  const style = selectStyle(seed, recentStyles)
  
  // Select hook and structure
  const hook = selectHook(seed)
  const structure = selectStructure(seed + 1) // Offset seed for variety
  
  // Vary temperature and top_p based on seed
  const temperature = 0.7 + (seed % 5) * 0.05 // Range: 0.7 - 0.9
  const topP = 0.90 + (seed % 3) * 0.03 // Range: 0.90 - 0.96
  
  return {
    style,
    hook,
    structure,
    temperature,
    topP
  }
}

/**
 * 3-Variant Generation Mode
 * Generate 3 variants with different seeds and pick the best
 */
export async function generateVariants(
  basePrompt: string,
  userId: string,
  generateFn: (prompt: string, temp: number, topP: number) => Promise<string>
): Promise<{
  variants: Array<{ text: string; score: number; params: any }>
  best: string
}> {
  const seeds = [Date.now() % 1000, (Date.now() + 333) % 1000, (Date.now() + 666) % 1000]
  
  const variants = await Promise.all(
    seeds.map(async (seed, index) => {
      const params = await generateDiversityParams(userId, seed)
      
      // Add diversity instructions to prompt
      const enhancedPrompt = `${basePrompt}\n\nDIVERSITY INSTRUCTIONS:\n- Use a ${params.style} tone\n- Consider this structure: ${params.structure}\n- Avoid these banned phrases: ${PHRASE_BAN_LIST.slice(0, 10).join(', ')}`
      
      const text = await generateFn(enhancedPrompt, params.temperature, params.topP)
      
      // Score the variant
      const bannedCheck = containsBannedPhrases(text)
      const repCheck = await checkRepetition(userId, text, 20)
      
      // Simple scoring: lower is better
      const score = 
        (bannedCheck.found.length * 10) + // Penalize banned phrases heavily
        (repCheck.maxOverlap * 2) + // Penalize high overlap
        (repCheck.averageOverlap) // Penalize average overlap
      
      return { text, score, params }
    })
  )
  
  // Sort by score (lower is better)
  variants.sort((a, b) => a.score - b.score)
  
  return {
    variants,
    best: variants[0].text
  }
}

/**
 * Apply diversity checks and provide feedback
 */
export async function applyDiversityChecks(
  userId: string,
  text: string
): Promise<{
  passed: boolean
  issues: string[]
  suggestions: string[]
}> {
  const issues: string[] = []
  const suggestions: string[] = []
  
  // Check for banned phrases
  const bannedCheck = containsBannedPhrases(text)
  if (bannedCheck.hasBanned) {
    issues.push(`Contains overused phrases: ${bannedCheck.found.join(', ')}`)
    suggestions.push('Rephrase to avoid clichés and buzzwords')
  }
  
  // Check for repetition
  const repCheck = await checkRepetition(userId, text, 20)
  if (repCheck.isRepetitive) {
    issues.push(`High similarity to recent posts (${repCheck.maxOverlap.toFixed(1)}% overlap)`)
    suggestions.push('Try a different structure or angle')
  }
  
  return {
    passed: issues.length === 0,
    issues,
    suggestions
  }
}

