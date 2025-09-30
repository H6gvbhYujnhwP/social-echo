import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required')
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateText(prompt: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.6,
  })

  return completion.choices[0]?.message?.content || ''
}

export async function generateImage(prompt: string): Promise<string> {
  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt,
    size: '1024x1024',
    quality: 'standard',
    response_format: 'b64_json',
  })

  const base64Image = response.data?.[0]?.b64_json
  if (!base64Image) {
    throw new Error('Failed to generate image')
  }

  return `data:image/png;base64,${base64Image}`
}
