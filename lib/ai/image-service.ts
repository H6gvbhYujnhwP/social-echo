/**
 * Image Generation Service v2
 * Intelligent visual style selection and context-aware prompt generation
 */

export const IMAGE_BRIEFS: Record<string, string> = {
  "photo-real": `
Generate a high-resolution, photo-realistic image with natural lighting and detail. 
The scene should feel authentic, candid, and visually credible — as if taken by a professional photographer. 
Avoid cartoonish or 3D rendering. Tone: believable, clean, professional.
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
 * Generate a context-aware image prompt based on post content
 */
export async function generateImagePrompt({
  type,
  postHeadline,
  postText,
}: {
  type: string
  postHeadline: string
  postText: string
}): Promise<string> {
  const style = type.toLowerCase()
  const brief = IMAGE_BRIEFS[style] || IMAGE_BRIEFS["photo-real"]

  // Extract first 60 words for context
  const shortSummary = postText
    .split(/\s+/)
    .slice(0, 60)
    .join(" ")
    .replace(/\n+/g, " ")

  return `
${brief}

Topic: ${postHeadline}

Context from Post:
"${shortSummary}"

Goal: Create a visual that complements this post's story, tone, and emotion. 
Ensure the image feels like a natural visual partner to the text.
Create a scroll-stopping LinkedIn visual. High-contrast, witty, minimal text, clean composition, room for overlay.
Orientation: square or 4:5 portrait. High resolution. Avoid brand logos or real people.
`
}

/**
 * Auto-select image type based on post type and content
 */
export function getDefaultImageTypeForPostType(postType: string, postText: string): string {
  const textLower = postText.toLowerCase()

  if (postType === 'selling') {
    if (textLower.includes('problem') || textLower.includes('solution') || textLower.includes('pain'))
      return 'photo-real'
    return 'conceptual'
  }

  if (postType === 'advice') {
    if (textLower.includes('steps') || textLower.includes('how to') || textLower.includes('guide'))
      return 'illustration'
    return 'conceptual'
  }

  if (postType === 'informational') {
    if (textLower.includes('data') || textLower.includes('percent') || textLower.includes('stat'))
      return 'infographic'
    if (textLower.includes('funny') || textLower.includes('quirky'))
      return 'funny'
    return 'conceptual'
  }

  if (postType === 'news') {
    return 'photo-real'
  }

  // Fallbacks for general creative styles
  if (textLower.includes('absurd') || textLower.includes('strange'))
    return 'controversial'
  if (textLower.includes('joke') || textLower.includes('laugh'))
    return 'funny'

  return 'photo-real'
}

/**
 * Get all available image types
 */
export function getAvailableImageTypes() {
  return [
    { value: "photo-real", label: "Photo-Real", description: "Professional, authentic photography" },
    { value: "illustration", label: "Illustration", description: "Modern flat or semi-3D digital art" },
    { value: "meme", label: "Meme", description: "Funny, relatable workplace humor" },
    { value: "funny", label: "Funny / Hilarious", description: "Exaggerated, humorous business scenes" },
    { value: "controversial", label: "Controversial / Weird", description: "Bold, surreal, attention-grabbing" },
    { value: "conceptual", label: "Conceptual / Abstract", description: "Minimalist symbolic artwork" },
    { value: "infographic", label: "Infographic / Data Insight", description: "Clean data visualization" },
  ]
}
