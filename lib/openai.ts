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
