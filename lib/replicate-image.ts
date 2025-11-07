import Replicate from "replicate"

let replicate: Replicate | null = null

function getReplicateClient(): Replicate {
  if (!replicate) {
    if (!process.env.REPLICATE_API_TOKEN) {
      throw new Error("Missing REPLICATE_API_TOKEN environment variable")
    }
    replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    })
  }
  return replicate
}

/**
 * Generate image using Flux Pro 1.1 (photorealistic)
 */
export async function generateFluxProImage(prompt: string): Promise<string> {
  try {
    const client = getReplicateClient()
    
    const output = await client.run(
      "black-forest-labs/flux-1.1-pro",
      {
        input: {
          prompt,
          aspect_ratio: "1:1",
          output_format: "png",
          output_quality: 90,
          safety_tolerance: 2,
        }
      }
    ) as string | string[]

    // Replicate returns a URL or array of URLs
    const imageUrl = Array.isArray(output) ? output[0] : output
    
    if (!imageUrl) {
      throw new Error("Flux Pro returned no image data")
    }

    // Download the image and convert to base64
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`)
    }
    
    const arrayBuffer = await response.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    
    return `data:image/png;base64,${base64}`
  } catch (error: any) {
    console.error("[replicate] Flux Pro generation error:", error?.message, error?.stack)
    throw error
  }
}

/**
 * Generate image using Ideogram v3 Turbo (infographics with text)
 */
export async function generateIdeogramImage(prompt: string): Promise<string> {
  try {
    const client = getReplicateClient()
    
    const output = await client.run(
      "ideogram-ai/ideogram-v3-turbo",
      {
        input: {
          prompt,
          aspect_ratio: "1:1",
          magic_prompt_option: "Auto", // Enhances prompt automatically
          style_type: "Design", // Good for infographics
        }
      }
    ) as string | string[]

    // Replicate returns a URL or array of URLs
    const imageUrl = Array.isArray(output) ? output[0] : output
    
    if (!imageUrl) {
      throw new Error("Ideogram returned no image data")
    }

    // Download the image and convert to base64
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`)
    }
    
    const arrayBuffer = await response.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    
    return `data:image/png;base64,${base64}`
  } catch (error: any) {
    console.error("[replicate] Ideogram generation error:", error?.message, error?.stack)
    throw error
  }
}
