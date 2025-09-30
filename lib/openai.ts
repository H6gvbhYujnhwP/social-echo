import OpenAI from "openai";

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function assertKey() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY");
  }
}

export async function generateText(prompt: string): Promise<string> {
  assertKey();
  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    temperature: 0.6,
    messages: [
      { role: "system", content: "Return STRICT JSON only." },
      { role: "user", content: prompt },
    ],
  });
  return completion.choices?.[0]?.message?.content ?? "";
}

export async function generateImage(prompt: string): Promise<string> {
  assertKey();
  const res = await openai.images.generate({
    model: "dall-e-3",
    prompt,
    size: "1024x1024",
    response_format: "b64_json",
  });
  const b64 = res.data?.[0]?.b64_json;
  if (!b64) throw new Error("Failed to generate image");
  return `data:image/png;base64,${b64}`;
}
