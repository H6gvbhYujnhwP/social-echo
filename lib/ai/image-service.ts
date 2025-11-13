/**
 * Image Generation Service v2
 * Intelligent visual style selection and context-aware prompt generation
 * With strict no-text rules and English-only constraint
 */

/**
 * Extract meaningful keywords from a headline
 * Filters out common words and returns important terms
 */
function extractKeywords(headline: string): string[] {
  const commonWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'be', 'been',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
    'your', 'you', 'need', 'think', 'when', 'how', 'why', 'what', 'who'
  ])
  
  return headline
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.has(word))
    .slice(0, 3) // Max 3 keywords
}

export const IMAGE_BRIEFS: Record<string, string> = {
  "photo-real": `
Generate a PHOTOREALISTIC image that looks like an actual photograph taken with a professional camera.
Use natural lighting, realistic textures, depth of field, and authentic details.
The image MUST look like real photography - NOT illustration, NOT 3D render, NOT digital art, NOT cartoon.
Think: Canon 5D Mark IV, professional lens, natural light, shallow depth of field, authentic moment.
Capture the SUBJECT from the post content - whether it's a workspace, office environment, product, scene, or person.
Style: Documentary photography, corporate photojournalism, professional quality.
Tone: Authentic, believable, real-world, professional photography that matches the post's topic.
`,

  "illustration": `
Generate a clean, vector-style digital illustration in modern flat or semi-3D aesthetic. 
Use bold colors, clear shapes, and expressive composition. 
Communicate an abstract idea through metaphor, not literal realism. 
Tone: intelligent, creative, concept-driven.
`,

  "meme": `
Generate a meme-style image suitable for LinkedIn or Facebook. 
Use recognizable meme templates, expressive faces, or ironic juxtapositions. 
Make it instantly funny and workplace-relatable. 
Avoid explicit or political content. Tone: witty, light, viral.
`,

  "funny": `
Generate a humorous, exaggerated, or self-deprecating image about workplace or business life. 
Use expressive characters or ironic contrast to create laughter and connection. 
Tone: playful, friendly, universally funny.
`,

  "controversial": `
Generate a visually weird, bold, or provocative image that grabs attention. 
Blend surreal and realistic elements to create tension or intrigue. 
Keep it thought-provoking but safe (no explicit or offensive content). 
Think surreal corporate metaphors like "melting briefcase" or "robot handshake." 
Tone: edgy, smart, scroll-stopping.
`,

  "conceptual": `
Generate a minimalist, conceptual artwork that represents an abstract business idea. 
Use symbolism — e.g., maze for challenge, ladder for growth, lightbulb for insight. 
Clean composition, limited palette, modern aesthetic. 
Tone: elegant, intellectual, visually simple.
`,

  "infographic": `
Generate a sleek, data-driven infographic visualizing key business or financial metrics. 
Use simple icons, charts, bars, graphs, or visual data representations — not cluttered dashboards. 
Focus on one striking stat or comparison using VISUAL elements only (colored bars, pie charts, icons, arrows).
When text is NOT allowed: render charts with colored segments, height differences, or visual proportions ONLY - no labels, no numbers, no axis text.
When text IS allowed: include ONLY the specific text provided, rendered clearly as chart labels or key statistics.
Tone: factual, insightful, visually digestible, clean modern design.
`,
}

/**
 * Strict no-text composition rules
 */
export const NO_TEXT_RULES = `
STRICT NO-TEXT RULES:
- ABSOLUTELY NO text, letters, words, numbers, logos, watermarks, handwriting, signage, captions, labels, or typographic elements of ANY kind.
- If a sign, screen, chart, or label would normally contain text, render it COMPLETELY BLANK or as abstract shapes/colors only.
- NO exceptions - even if text seems "natural" or "necessary", DO NOT include it.
- NO pseudo-text, NO gibberish, NO lorem ipsum, NO foreign characters, NO symbols that resemble letters.
- Render a completely text-free visual suitable for social media.
- This is a HARD REQUIREMENT - any text will be rejected.
`

/**
 * Strict override for retry when text is detected
 */
export const STRICT_NO_TEXT_OVERRIDE = `
STRICT OVERRIDE: Do not include any letters, words, or text of any kind. 
Render blank signs/labels with shapes only. No typographic elements whatsoever.
`

/**
 * Generate a context-aware image prompt based on post content
 */
export async function generateImagePrompt({
  type,
  postHeadline,
  postText,
  allowText = false,
  strictMode = false,
}: {
  type: string
  postHeadline: string
  postText: string
  allowText?: boolean
  strictMode?: boolean
}): Promise<string> {
  const style = type.toLowerCase()
  const brief = IMAGE_BRIEFS[style] || IMAGE_BRIEFS["photo-real"]

  // Extract first 60 words for context
  const shortSummary = postText
    .split(/\s+/)
    .slice(0, 60)
    .join(" ")
    .replace(/\n+/g, " ")

  // Choose text rules based on mode
  let textRules = NO_TEXT_RULES
  if (strictMode) {
    textRules = STRICT_NO_TEXT_OVERRIDE
  } else if (allowText) {
    // Extract key words from headline to provide exact text
    const keywords = extractKeywords(postHeadline)
    const suggestedText = keywords.slice(0, 2).join(" ").toUpperCase() // Max 2 words
    
    textRules = `
TEXT INCLUSION REQUIRED:

⚠️ CRITICAL: You MUST include text in this image. This is NOT optional.

📝 EXACT TEXT TO RENDER:
"${suggestedText}"

✅ SPELLING REQUIREMENTS:
- Render EXACTLY: "${suggestedText}" (letter-by-letter, no changes)
- DO NOT modify, abbreviate, or "improve" this text
- DO NOT add extra letters or remove letters
- DO NOT use similar-looking words
- Each letter must be correct: ${suggestedText.split('').join(', ')}

🎨 VISUAL REQUIREMENTS:
- Make the text PROMINENT and LARGE (at least 20% of image height)
- Use clean, bold, sans-serif font (like Arial Black, Helvetica Bold)
- High contrast: white text on dark background OR black text on light background
- Make text the FOCAL POINT of the image
- Position text in center or lower third for maximum visibility

❌ ABSOLUTELY FORBIDDEN:
- Misspelled versions like "${suggestedText.replace(/O/g, '0').replace(/I/g, '1')}" (WRONG!)
- Gibberish like "BUDGT", "GRWOTH", "INSRUCCTION"
- Blurry, distorted, or illegible text
- Text with missing or extra letters

✓ VERIFICATION:
Before finalizing, verify each letter matches: "${suggestedText}"
`
  }

  return `
${brief}

Topic: ${postHeadline}

Context from Post:
"${shortSummary}"

${textRules}

Goal: Create a visual that complements this post's story, tone, and emotion. 
Ensure the image feels like a natural visual partner to the text.
Create a scroll-stopping LinkedIn visual. High-contrast, witty, clean composition, room for overlay.
Orientation: square or 4:5 portrait. High resolution. Avoid brand logos or real people.
`
}

/**
 * Auto-select image type based on post type and content
 */
export function getDefaultImageTypeForPostType(postType: string, postText: string): string {
  const textLower = postText.toLowerCase()

  if (postType === 'selling') {
    if (textLower.includes('problem') || textLower.includes('solution') || textLower.includes('pain')) {
      return 'photo-real'
    }
    return 'illustration'
  }

  if (postType === 'advice') {
    if (textLower.includes('step') || textLower.includes('how to') || textLower.includes('guide')) {
      return 'illustration'
    }
    return 'conceptual'
  }

  if (postType === 'informational') {
    if (textLower.includes('data') || textLower.includes('stat') || textLower.includes('%')) {
      return 'infographic'
    }
    if (textLower.includes('funny') || textLower.includes('quirky') || textLower.includes('weird')) {
      return 'funny'
    }
    return 'illustration'
  }

  if (postType === 'news') {
    return 'photo-real'
  }

  // Check for controversial/weird content
  if (textLower.includes('absurd') || textLower.includes('strange') || textLower.includes('bizarre')) {
    return 'controversial'
  }

  // Default
  return 'illustration'
}




/**
 * Get available image types for UI selection
 */
export function getAvailableImageTypes() {
  return [
    { value: 'photo-real', label: 'Photo-Real', description: 'Authentic, professional photography' },
    { value: 'illustration', label: 'Illustration', description: 'Modern flat/semi-3D digital art' },
    { value: 'meme', label: 'Meme', description: 'Funny, workplace-relatable humor' },
    { value: 'funny', label: 'Funny / Hilarious', description: 'Exaggerated, humorous scenes' },
    { value: 'controversial', label: 'Controversial / Weird', description: 'Bold, surreal, attention-grabbing' },
    { value: 'conceptual', label: 'Conceptual / Abstract', description: 'Minimalist symbolic artwork' },
    { value: 'infographic', label: 'Infographic / Data Insight', description: 'Clean data visualization' },
  ]
}

