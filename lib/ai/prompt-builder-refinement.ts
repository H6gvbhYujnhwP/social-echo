/**
 * Refinement Prompt Builder
 * 
 * Builds prompts for refining/modifying existing posts based on user instructions.
 */

import type { GenInputs } from './prompt-builder'

/**
 * Build refinement prompt for any post type
 * 
 * This prompt instructs the AI to MODIFY the existing post rather than generate a new one.
 */
export function buildRefinementPrompt(inputs: GenInputs, postType: string): string {
  if (!inputs.originalPost) {
    throw new Error('originalPost is required for refinement')
  }
  
  const userInstructions = inputs.notes || 'Make the post better'
  
  return `You are refining an EXISTING LinkedIn post. Your task is to MODIFY the post based on the user's instructions while keeping the core structure and message intact.

⚠️ CRITICAL: This is a REFINEMENT, not a new post generation.
- Keep the original post's main topic and structure
- Apply the user's requested changes
- Make targeted improvements, not wholesale rewrites
- Preserve what's working well in the original

ORIGINAL POST:
"""
${inputs.originalPost}
"""

USER'S REFINEMENT INSTRUCTIONS:
"""
${userInstructions}
"""

Business Context (for reference):
- Business: ${inputs.businessName}
- Sector: ${inputs.sector}
- Target Audience: ${inputs.audience}
- Tone: ${inputs.brandTone || 'professional'}
- Post Type: ${postType}

REFINEMENT GUIDELINES:
1. **Read the original post carefully** - understand its structure, message, and tone
2. **Apply the user's instructions** - make the specific changes they requested
3. **Keep the core intact** - don't change the fundamental topic or message unless explicitly asked
4. **Preserve good elements** - if something works well, keep it
5. **Make surgical edits** - targeted improvements, not complete rewrites
6. **Maintain length** - aim for similar word count (140-160 words)
7. **Keep the same post type** - maintain ${postType} characteristics

WHAT TO PRESERVE:
- The main topic and angle
- The overall structure (unless user asks to change it)
- Key facts, statistics, or examples (unless user asks to change them)
- The professional tone and style

WHAT TO MODIFY:
- Apply the specific changes the user requested
- Improve clarity or flow if needed
- Fix any issues the user mentioned
- Add elements the user specifically asked for

Return STRICT JSON with fields:
- "headline_options": array of 3 refined headline variations
- "post_text": the refined post text
- "hashtags": array of 5-8 relevant hashtags (can be same or improved)
- "visual_prompt": updated visual prompt if needed
- "best_time_uk": optimal posting time in UK timezone (HH:MM, 24-hour)

Respond ONLY with valid JSON (no markdown, no commentary).`
}

