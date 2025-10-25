import OpenAI from "openai";

// Initialize OpenAI client with error guard
let openai: OpenAI | null = null;

// Export function to check API key at runtime (not import time)
export function assertOpenAIKey(): void {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY environment variable. Please set it in your deployment settings.");
  }
}

function getOpenAIClient(): OpenAI {
  if (!openai) {
    assertOpenAIKey(); // Check key before creating client
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

export async function generateText(prompt: string): Promise<string> {
  try {
    const client = getOpenAIClient();
    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.6,
      messages: [
        { role: "system", content: "Return STRICT JSON only." },
        { role: "user", content: prompt },
      ],
    });
    const content = completion.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("OpenAI returned empty response");
    }
    return content;
  } catch (error: any) {
    console.error("[openai] Text generation error:", error?.message, error?.stack);
    console.error("[openai] Error details:", JSON.stringify(error, null, 2));
    throw error;
  }
}

export async function generateImage(prompt: string): Promise<string> {
  try {
    const client = getOpenAIClient();
    const res = await client.images.generate({
      model: "dall-e-3",
      prompt,
      size: "1024x1024",
      quality: "standard",
      response_format: "b64_json",
    });
    const b64 = res.data?.[0]?.b64_json;
    if (!b64) {
      throw new Error("OpenAI returned no image data");
    }
    return `data:image/png;base64,${b64}`;
  } catch (error: any) {
    console.error("[openai] Image generation error:", error?.message, error?.stack);
    console.error("[openai] Error details:", JSON.stringify(error, null, 2));
    throw error;
  }
}


/**
 * Analyze image using OpenAI Vision API to detect text
 * Returns detected text and analysis
 */
export async function analyzeImageForText(imageBase64: string): Promise<{
  hasText: boolean
  detectedText: string
  isAcceptable: boolean
  wordCount: number
  hasNonEnglish: boolean
}> {
  try {
    const client = getOpenAIClient();
    
    // Remove data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this image and detect ANY text, letters, words, numbers, or typographic elements visible in it.

TASK:
1. List ALL text you can see (even partial, blurry, or stylized text)
2. Count the total number of words
3. Determine if the text is in English or contains non-English characters

RESPONSE FORMAT (JSON only):
{
  "hasText": true/false,
  "detectedText": "exact text you see",
  "wordCount": number,
  "hasNonEnglish": true/false,
  "confidence": "high/medium/low"
}

If you see NO text at all, return:
{
  "hasText": false,
  "detectedText": "",
  "wordCount": 0,
  "hasNonEnglish": false,
  "confidence": "high"
}`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${base64Data}`
              }
            }
          ]
        }
      ],
      max_tokens: 300,
      temperature: 0.1
    });

    const content = completion.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Vision API returned empty response");
    }

    // Parse JSON response
    const result = JSON.parse(content);
    
    // Text is acceptable if:
    // - It's English (no non-ASCII)
    // - It's 5 words or fewer
    const isAcceptable = result.hasText 
      ? (!result.hasNonEnglish && result.wordCount <= 5)
      : true;

    console.log('[vision-api] Text detection result:', {
      hasText: result.hasText,
      wordCount: result.wordCount,
      hasNonEnglish: result.hasNonEnglish,
      isAcceptable,
      confidence: result.confidence,
      detectedText: result.detectedText?.substring(0, 100)
    });

    return {
      hasText: result.hasText || false,
      detectedText: result.detectedText || '',
      isAcceptable,
      wordCount: result.wordCount || 0,
      hasNonEnglish: result.hasNonEnglish || false
    };
  } catch (error: any) {
    console.error('[vision-api] Error analyzing image:', error?.message);
    // On error, assume text is acceptable to avoid blocking generation
    return {
      hasText: false,
      detectedText: '',
      isAcceptable: true,
      wordCount: 0,
      hasNonEnglish: false
    };
  }
}

