/**
 * Background removal service using remove.bg API
 * Falls back to original image if API key not configured or removal fails
 */

export async function removeBackground(imageBase64: string): Promise<string> {
  const apiKey = process.env.REMOVEBG_API_KEY
  
  if (!apiKey) {
    console.warn('[background-removal] REMOVEBG_API_KEY not configured, skipping background removal')
    return imageBase64
  }

  try {
    // Remove data URI prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    
    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image_file_b64: base64Data,
        size: 'auto',
        format: 'png'
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('[background-removal] API error:', error)
      return imageBase64 // Return original on error
    }

    // Get the result as a buffer
    const resultBuffer = await response.arrayBuffer()
    const base64Result = Buffer.from(resultBuffer).toString('base64')
    
    console.log('[background-removal] Background removed successfully')
    return `data:image/png;base64,${base64Result}`
    
  } catch (error) {
    console.error('[background-removal] Error removing background:', error)
    return imageBase64 // Return original on error
  }
}
