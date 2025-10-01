import OpenAI from "openai";

// Initialize OpenAI client with error guard
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("Missing OPENAI_API_KEY environment variable");
    }
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
    return completion.choices?.[0]?.message?.content ?? "";
  } catch (error) {
    console.error("Text generation error:", error);
    throw error;
  }
}

export async function generateImage(prompt: string): Promise<string> {
  try {
    const client = getOpenAIClient();
    const res = await client.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024",
      response_format: "b64_json",
    });
    const b64 = res.data?.[0]?.b64_json;
    if (!b64) throw new Error("Failed to generate image");
    return `data:image/png;base64,${b64}`;
  } catch (error) {
    console.error("Image generation error:", error);
    throw error;
  }
}
