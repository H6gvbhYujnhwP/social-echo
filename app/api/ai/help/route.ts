import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import OpenAI from 'openai'

export const runtime = 'nodejs'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Load training dataset
async function loadTrainingDataset() {
  try {
    const datasetPath = path.join(process.cwd(), 'public/ai/assistantTrainingDataset.json')
    const fileContent = await fs.readFile(datasetPath, 'utf-8')
    return JSON.parse(fileContent)
  } catch (error) {
    console.error('[ai-help] Failed to load training dataset:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Load training dataset
    const dataset = await loadTrainingDataset()

    if (!dataset) {
      return NextResponse.json(
        { error: 'Training dataset not available' },
        { status: 500 }
      )
    }

    // Build system prompt from dataset
    const systemPrompt = `You are the SocialEcho AI Help Assistant. 

${dataset.core.overview}

**Your Tone:** ${dataset.tone.style}. ${dataset.tone.emojis}.

**Product Modules:**
${dataset.core.modules.map((m: string) => `- ${m}`).join('\n')}

**Plans:** ${dataset.core.plans.join(', ')}

**Your Capabilities:**
Content Help:
${dataset.capabilities.content.map((c: string) => `- ${c}`).join('\n')}

Support:
${dataset.capabilities.support.map((s: string) => `- ${s}`).join('\n')}

**Important Guardrails:**
- ${dataset.guardrails.privacy}
- Never provide medical, legal, or financial advice

**Quick Answer Examples:**
${dataset.quickAnswers.map((qa: any) => `
Q: ${qa.user}
A: ${qa.reply}
`).join('\n')}

**Helpful Prompt Hints:**
${dataset.promptHints.map((hint: string) => `- ${hint}`).join('\n')}

When answering:
1. Be concise and actionable
2. Use markdown for emphasis (**bold**, *italic*)
3. Reference specific pages/tabs when relevant (e.g., "Go to **Account → Billing**")
4. If the question is about draft improvement, provide specific prompt suggestions
5. If unsure, guide them to support@socialecho.ai or the Help page

Answer the user's question below:`

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini', // Using the available model from secrets
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      max_tokens: 300,
    })

    const reply = completion.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response. Please try again.'

    console.log('[ai-help] Response generated', {
      userMessage: message.substring(0, 50),
      replyLength: reply.length,
    })

    return NextResponse.json({ reply })

  } catch (error: any) {
    console.error('[ai-help] Error:', error)

    return NextResponse.json(
      { 
        error: 'Failed to get AI response',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

