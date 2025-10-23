/**
 * Prompt Builder - Country-Aware Post Type Prompts
 * 
 * Centralized prompt building for all post types with country localization.
 * Supports: Selling, Information & Advice, Random / Fun Facts, News
 */

export type GenInputs = {
  businessName: string
  sector: string
  audience: string
  country?: string
  brandTone?: 'friendly' | 'witty' | 'professional' | 'bold'
  notes?: string
  keywords?: string[]
  usp?: string
  productsServices?: string
  website?: string
}

/**
 * Parse products/services text into individual items
 */
function parseProductsServices(text?: string): string[] {
  if (!text) return []
  
  // Split by common delimiters: periods, commas, "and", newlines
  const items = text
    .split(/[.,]|\band\b|\n/)
    .map(item => item.trim())
    .filter(item => item.length > 10) // Filter out very short fragments
    .filter(item => !item.toLowerCase().startsWith('we '))
  
  return items.length > 0 ? items : [text]
}

/**
 * Parse USP text into individual selling points
 */
function parseUSPs(text?: string): string[] {
  if (!text) return []
  
  // Split by common delimiters
  const points = text
    .split(/[.,]|\band\b|\n/)
    .map(point => point.trim())
    .filter(point => point.length > 10)
  
  return points.length > 0 ? points : [text]
}

/**
 * Randomly select item(s) from array
 */
function randomSelect<T>(arr: T[], count: number = 1): T[] {
  if (arr.length === 0) return []
  if (count >= arr.length) return arr
  
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

/**
 * Get country-specific guidance for prompts
 */
function getCountryGuidance(country?: string): string {
  if (!country) {
    return 'Use neutral international English. Avoid region-specific references unless globally relevant.'
  }
  
  const guidance: Record<string, string> = {
    'United Kingdom': 'Use UK English spelling (colour, favourite, organisation). Reference £ currency. Mention UK holidays/observances when relevant. Use British cultural references.',
    'United States': 'Use US English spelling (color, favorite, organization). Reference $ currency. Mention US holidays/observances when relevant. Use American cultural references.',
    'Canada': 'Use Canadian English (mix of UK/US spelling). Reference $ (CAD) currency. Mention Canadian holidays/observances when relevant.',
    'Australia': 'Use Australian English (UK-based spelling). Reference $ (AUD) currency. Mention Australian holidays/observances when relevant.',
    'Ireland': 'Use Irish English (UK-based spelling). Reference € currency. Mention Irish holidays/observances when relevant.',
    'New Zealand': 'Use New Zealand English (UK-based spelling). Reference $ (NZD) currency. Mention NZ holidays/observances when relevant.',
    'India': 'Use Indian English. Reference ₹ currency. Mention Indian holidays/observances when relevant. Consider diverse business landscape.',
    'South Africa': 'Use South African English. Reference R currency. Mention South African holidays/observances when relevant.',
  }
  
  return guidance[country] || `Generate content suitable for ${country}. Use appropriate local spelling, currency, and cultural references.`
}

/**
 * Build prompt for SELLING posts
 * PAS structure with clear CTA
 */
export function buildSellingPrompt(inputs: GenInputs): string {
  const countryGuidance = getCountryGuidance(inputs.country)
  
  // Parse and randomize products/services
  const allProducts = parseProductsServices(inputs.productsServices)
  const focusProduct = allProducts.length > 0 
    ? randomSelect(allProducts, 1)[0]
    : inputs.sector
  
  // Parse and randomize USPs
  const allUSPs = parseUSPs(inputs.usp)
  const focusUSPs = allUSPs.length > 0
    ? randomSelect(allUSPs, Math.min(2, allUSPs.length))
    : [inputs.usp || 'Not specified']
  
  // Random keywords (if provided)
  const focusKeywords = inputs.keywords && inputs.keywords.length > 0
    ? randomSelect(inputs.keywords, Math.min(3, inputs.keywords.length))
    : []
  
  return `Generate a SELLING LinkedIn post using the PAS (Problem → Agitate → Solution) structure.

Business Context:
- Business: ${inputs.businessName}
- Sector: ${inputs.sector}
- Target Audience: ${inputs.audience}
- Tone: ${inputs.brandTone || 'professional'}
${inputs.website ? `- Website: ${inputs.website} (use for additional context if needed)` : ''}

⚠️ CRITICAL RANDOMIZATION REQUIREMENTS:
This post MUST focus on a DIFFERENT product/service than previous posts to avoid repetition.

🎯 FOCUS FOR THIS POST:
- **Primary Product/Service**: ${focusProduct}
- **Key Selling Points**: ${focusUSPs.join('; ')}
${focusKeywords.length > 0 ? `- **Keywords to weave in**: ${focusKeywords.join(', ')}` : ''}

${allProducts.length > 1 ? `
📦 OTHER PRODUCTS/SERVICES AVAILABLE (for context, but DO NOT focus on these in this post):
${allProducts.filter(p => p !== focusProduct).map(p => `- ${p}`).join('\n')}
` : ''}

Country/Localization:
${countryGuidance}

SELLING POST REQUIREMENTS:
1. **Problem**: Start with a specific pain point related to ${focusProduct} that ${inputs.audience} faces
2. **Agitate**: Use a brief anonymized mini-story or stat to make it real
3. **Solution**: Present how ${focusProduct} solves it, emphasizing: ${focusUSPs.join(' and ')}
4. **CTA**: Soft call-to-action (e.g., "Comment 'GUIDE' for the checklist" or "DM for a demo")

Style Guidelines:
- Lead with tension or a surprising stat
- Short sentences (4-12 words)
- One vivid detail beats three vague claims
- Persuasive but not pushy
- Maximum 160 words (aim for 140-160 for depth)
- Use blank lines generously
- VARY your angle: Don't repeat the same problem/story as recent posts

${inputs.notes ? `\n🎯 USER'S CUSTOM BRIEF (HIGHEST PRIORITY):\n${inputs.notes}\n\nIf the user has provided specific instructions above, prioritize those over the randomized focus.` : ''}

Return STRICT JSON with fields:
- "headline_options": array of 3 hooks (1 contrarian, 1 data-led, 1 story-first)
- "post_text": full post following PAS structure, focused on ${focusProduct}
- "hashtags": array of 5-8 relevant hashtags
- "visual_prompt": detailed prompt for accompanying image showing ${focusProduct}
- "best_time_uk": optimal posting time in UK timezone (HH:MM, 24-hour)

Respond ONLY with valid JSON (no markdown, no commentary).`
}

/**
 * Build prompt for INFORMATION & ADVICE posts
 * Merged informational + advice: actionable tips with insights
 */
export function buildInfoAdvicePrompt(inputs: GenInputs): string {
  const countryGuidance = getCountryGuidance(inputs.country)
  
  // Randomize products/services to avoid repetition
  const allProducts = parseProductsServices(inputs.productsServices)
  const focusTopic = allProducts.length > 0 
    ? randomSelect(allProducts, 1)[0] 
    : inputs.sector
  
  // Randomize keywords
  const focusKeywords = inputs.keywords && inputs.keywords.length > 0
    ? randomSelect(inputs.keywords, 3)
    : []
  
  return `Generate an INFORMATION & ADVICE LinkedIn post that combines insight with actionable guidance.

Business Context:
- Business: ${inputs.businessName}
- Sector: ${inputs.sector}
- Target Audience: ${inputs.audience}
- Tone: ${inputs.brandTone || 'professional'}

🎯 FOCUS TOPIC FOR THIS POST: ${focusTopic}

⚠️ CRITICAL RANDOMIZATION REQUIREMENT:
This post MUST focus on "${focusTopic}" specifically.
DO NOT repeat topics from previous posts.
Provide educational content about THIS topic only.

All Products/Services (for context only, DO NOT cover all):
${allProducts.join(', ')}

${focusKeywords.length > 0 ? `Keywords to naturally weave in: ${focusKeywords.join(', ')}` : ''}
${inputs.keywords && inputs.keywords.length > 0 ? `
All available keywords (for context): ${inputs.keywords.join(', ')}` : ''}

Country/Localization:
${countryGuidance}

INFORMATION & ADVICE POST REQUIREMENTS:

⚠️ CRITICAL: This is EDUCATIONAL content, NOT selling. Provide value the reader can implement themselves.

✅ MUST INCLUDE:
1. **Pick 1 concrete problem** that ${inputs.audience} faces in ${inputs.sector}
2. **Provide 1 actionable tip, hack, or step-by-step guidance** that readers can DO THEMSELVES
3. **Specific tools, techniques, or methods** (free tools, keyboard shortcuts, process improvements)
4. **Real-life example or case study** showing the tip in action
5. **"So what" impact** - measurable benefit (time saved, errors reduced, efficiency gained)
6. **Optional**: Template, checklist, or specific metric to track

❌ ABSOLUTELY FORBIDDEN (This is NOT a selling post):
- DO NOT suggest "talk to your IT provider" or "contact a specialist"
- DO NOT include CTAs to buy services ("Book a consultation", "Get a quote")
- DO NOT use fear-based selling ("your systems could crash!")
- DO NOT emphasize money saved by buying services ("save £5,000 with our support")
- DO NOT pitch products or services
- DO NOT use benefit-focused language that implies buying ("our solution provides...")

✅ GOOD EXAMPLES:
- "Use Windows Task Scheduler to automate backups: Settings > System > Backup > Schedule"
- "Pro tip: Keep 2 offline backups in different physical locations (3-2-1 rule)"
- "Free tool alert: Use Ninite.com to batch-install software updates in one click"
- "Here's how to check your firewall status in 30 seconds: [specific steps]"

❌ BAD EXAMPLES (These are selling, not advice):
- "Regular IT audits could save you £5,000/year" (selling benefit)
- "Talk to your IT provider about quarterly check-ups" (CTA to buy)
- "Prevent disasters with proactive support" (selling fear)

Style Guidelines:
- Lead with a myth-bust, surprise, or "most people get this wrong"
- Sentences 4-12 words
- Use blank lines generously
- One vivid detail or specific example
- No generic fluff - be specific to ${inputs.sector}
- Maximum 160 words (aim for 140-160 for depth)
- Focus on TEACHING, not SELLING

${inputs.notes ? `\nAdditional Instructions:\n${inputs.notes}` : ''}

Return STRICT JSON with fields:
- "headline_options": array of 3 hooks (1 contrarian, 1 data-led, 1 story-first)
- "post_text": full post with actionable advice
- "hashtags": array of 5-8 relevant hashtags
- "visual_prompt": detailed prompt for accompanying image
- "best_time_uk": optimal posting time in UK timezone (HH:MM, 24-hour)

Respond ONLY with valid JSON (no markdown, no commentary).`
}

/**
 * Build prompt for RANDOM / FUN FACTS posts
 * Uses random data sources (observances, pop culture, science, history)
 */
export function buildRandomPrompt(inputs: GenInputs, randomSource: { title: string; blurb: string; tags: string[] }): string {
  const countryGuidance = getCountryGuidance(inputs.country)
  
  return `Generate a RANDOM / FUN FACTS LinkedIn post that bridges an interesting fact to business value.

Business Context:
- Business: ${inputs.businessName}
- Sector: ${inputs.sector}
- Target Audience: ${inputs.audience}
- Tone: ${inputs.brandTone || 'professional'}
${inputs.keywords ? `- Keywords: ${inputs.keywords.join(', ')}` : ''}

Country/Localization:
${countryGuidance}

RANDOM SOURCE (use this as your hook):
Title: ${randomSource.title}
Context: ${randomSource.blurb}
Tags: ${randomSource.tags.join(', ')}

RANDOM / FUN FACTS POST REQUIREMENTS:
1. **Start with the random fact/observance** - make it engaging and surprising
2. **Bridge to business**: Connect it to ${inputs.sector} or ${inputs.audience} with a playful but useful takeaway
3. **Keep it light but valuable**: Fun tone, but still provides insight or perspective
4. **Country-appropriate**: If the source is country-specific, lean into it; otherwise keep it universal
5. **Maximum 160 words** (aim for 140-160 for depth and context)

Style Guidelines:
- Playful, witty, or thought-provoking opening
- Short sentences with good rhythm
- Use blank lines for readability
- End with a question or reflection that invites engagement
- Balance fun with professional value

${inputs.notes ? `\nAdditional Instructions:\n${inputs.notes}` : ''}

Return STRICT JSON with fields:
- "headline_options": array of 3 hooks (1 playful, 1 curious, 1 thought-provoking)
- "post_text": full post bridging random fact to business insight
- "hashtags": array of 5-8 relevant hashtags (mix fun + professional)
- "visual_prompt": detailed prompt for accompanying image (can be playful/creative)
- "best_time_uk": optimal posting time in UK timezone (HH:MM, 24-hour)

Respond ONLY with valid JSON (no markdown, no commentary).`
}

/**
 * Build prompt for NEWS posts
 * Country + sector aware news commentary
 */
export function buildNewsPrompt(inputs: GenInputs, newsHeadlines: string[]): string {
  const countryGuidance = getCountryGuidance(inputs.country)
  
  const headlinesText = newsHeadlines.length > 0
    ? `REAL SECTOR NEWS (pick 1 and craft a professional take):\n${newsHeadlines.join('\n')}\n\nRules for real news posts:\n- Open with a spiky hook that grabs attention\n- 1–2 lines summarizing the story accurately (NO hallucinations)\n- 1 specific implication for ${inputs.audience}\n- 1 actionable takeaway or question\n- Cite the source inline\n- Keep it professional and credible`
    : `CREATIVE NEWS-STYLE POST (no specific headlines available):\nGenerate a forward-looking news-style post inspired by:\n- Current trends in ${inputs.sector}\n- Innovations relevant to ${inputs.audience}\n- Industry insights\n\nFrame as "Industry Watch" or "Sector Spotlight" style.\nFocus on emerging trends or common challenges.\nDO NOT fabricate specific news events or cite fake sources.`
  
  return `Generate a NEWS LinkedIn post that provides timely, sector-relevant commentary.

Business Context:
- Business: ${inputs.businessName}
- Sector: ${inputs.sector}
- Target Audience: ${inputs.audience}
- Tone: ${inputs.brandTone || 'professional'}
${inputs.keywords ? `- Keywords: ${inputs.keywords.join(', ')}` : ''}

Country/Localization:
${countryGuidance}
${inputs.country ? `Prefer news relevant to ${inputs.country} when available. Fall back to worldwide only if country-specific news is unavailable.` : ''}

${headlinesText}

NEWS POST REQUIREMENTS:
1. **Hook**: Start with attention-grabbing angle on the news
2. **Summary**: 1-2 lines on what happened (accurate, no fabrication)
3. **"What this means"**: Practical implication for ${inputs.audience}
4. **Next step**: Actionable takeaway or thought-provoking question
5. **Maximum 160 words** (aim for 140-160 for depth and analysis)
6. **Neutral, practical tone** - informative, not sensational

Style Guidelines:
- Lead with the news angle, not generic intro
- Short, punchy sentences
- Use blank lines for readability
- Professional and credible tone
- If using real news, cite source inline

${inputs.notes ? `\nAdditional Instructions:\n${inputs.notes}` : ''}

Return STRICT JSON with fields:
- "headline_options": array of 3 hooks (1 urgent, 1 analytical, 1 questioning)
- "post_text": full post with news commentary
- "hashtags": array of 5-8 relevant hashtags
- "visual_prompt": detailed prompt for accompanying image
- "best_time_uk": optimal posting time in UK timezone (HH:MM, 24-hour)

Respond ONLY with valid JSON (no markdown, no commentary).`
}

