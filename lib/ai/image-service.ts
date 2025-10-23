/**
 * Image Generation Service v2
 * Intelligent visual style selection and context-aware prompt generation
 * With strict no-text rules and English-only constraint
 */

export const IMAGE_BRIEFS: Record<string, string> = {
  "photo-real": `
Generate a PHOTOREALISTIC image that looks like an actual photograph taken with a professional camera.
Use natural lighting, realistic textures, depth of field, and authentic human expressions.
The image MUST look like real photography - NOT illustration, NOT 3D render, NOT digital art, NOT cartoon.
Think: Canon 5D Mark IV, 50mm lens, natural light, shallow depth of field, authentic moment.
Style: Documentary photography, corporate photojournalism, professional headshot quality.
Tone: Authentic, believable, real-world, professional photography.
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
Use simple icons, charts, or bars — not cluttered dashboards. 
Focus on one striking stat or comparison. 
Tone: factual, insightful, visually digestible.
`,
}

/**
 * Strict no-text composition rules
 */
export const NO_TEXT_RULES = `
IMPORTANT COMPOSITION RULES:
- Do NOT include any text, letters, words, logos, watermarks, handwriting, signage, captions, or typographic elements inside the image.
- If a sign, label, or screen would normally show text, render it blank or suggestive without readable lettering.
- If text is absolutely unavoidable, use natural English only, at most 3-5 words, and keep it legible and clean.
- Avoid non-English, pseudo-letters, lorem ipsum, or gibberish text entirely.
- Render a clean, high-quality visual suitable for social media.
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
    textRules = `
TEXT RULES - STRICT QUALITY REQUIREMENTS:
- You MAY include text, but ONLY if it adds value to the image.
- Maximum 5 words of text total.
- Text MUST be in correct, properly-spelled English with NO spelling errors.
- Text MUST be legible, clear, and professionally rendered.
- Use clean, sans-serif fonts that are easy to read.
- FORBIDDEN: Gibberish, pseudo-letters, misspelled words, lorem ipsum, non-English characters.
- FORBIDDEN: Blurry, distorted, or illegible text.
- If you cannot render text correctly, DO NOT include any text at all.
- Examples of GOOD text: "BUDGET", "GROWTH", "SUCCESS", "INNOVATION"
- Examples of BAD text: "BUDGT", "GRWOTH", "INSRUCCTION", "GPASABLE"
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

