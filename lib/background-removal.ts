/**
 * Background removal service using Replicate API
 * Uses BRIA background removal model
 * Cost: ~$0.018 per image (60x cheaper than remove.bg)
 */

import Replicate from 'replicate'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_API_KEY
})

export async function removeBackground(imageBase64: string): Promise<string> {
  const apiToken = process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_API_KEY
  
  if (!apiToken) {
    console.warn('[background-removal] REPLICATE_API_TOKEN not configured, skipping background removal')
    return imageBase64
  }

  try {
    console.log('[background-removal] Removing background with Replicate BRIA model')
    
    // Run the background removal model
    const output = await replicate.run(
      "bria/remove-background:a029dff38972b5fda4ec5d75d7d1cd25aeff621d2cf4946a41055d7db66b80bc",
      {
        input: {
          image: imageBase64
        }
      }
    ) as string

    if (!output) {
      console.error('[background-removal] No output from Replicate')
      return imageBase64
    }

    // Output is a URL to the processed image, fetch it and convert to base64
    console.log('[background-removal] Fetching processed image from Replicate')
    const response = await fetch(output)
    
    if (!response.ok) {
      console.error('[background-removal] Failed to fetch processed image')
      return imageBase64
    }

    const buffer = await response.arrayBuffer()
    const base64Result = Buffer.from(buffer).toString('base64')
    
    console.log('[background-removal] Background removed successfully')
    return `data:image/png;base64,${base64Result}`
    
  } catch (error) {
    console.error('[background-removal] Error removing background:', error)
    return imageBase64 // Return original on error
  }
}
