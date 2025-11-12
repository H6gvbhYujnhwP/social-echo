import sharp from 'sharp'

export type PhotoPosition = 'left' | 'center' | 'right'
export type PhotoSize = 'small' | 'medium' | 'large'
export type PhotoPlacement = 'foreground' | 'background'
export type PhotoRotation = 0 | 90 | 180 | 270

interface CompositeOptions {
  backdropBase64: string
  photoBase64: string
  position: PhotoPosition
  size: PhotoSize
  placement: PhotoPlacement
  rotation?: PhotoRotation
}

/**
 * Composite a user photo onto an AI-generated backdrop
 * @param options Compositing configuration
 * @returns Base64 encoded composite image
 */
export async function compositeImages(options: CompositeOptions): Promise<string> {
  const { backdropBase64, photoBase64, position, size, placement, rotation = 0 } = options

  // Remove data URI prefix if present
  const backdropData = backdropBase64.replace(/^data:image\/\w+;base64,/, '')
  const photoData = photoBase64.replace(/^data:image\/\w+;base64,/, '')

  // Convert base64 to buffers
  const backdropBuffer = Buffer.from(backdropData, 'base64')
  const photoBuffer = Buffer.from(photoData, 'base64')

  // Get backdrop dimensions
  const backdrop = sharp(backdropBuffer)
  const backdropMetadata = await backdrop.metadata()
  const backdropWidth = backdropMetadata.width || 1024
  const backdropHeight = backdropMetadata.height || 1024

  // Calculate photo dimensions based on size setting
  const sizeMultipliers = {
    small: 0.25,  // 25% of backdrop width
    medium: 0.4,  // 40% of backdrop width
    large: 0.6    // 60% of backdrop width
  }
  const photoWidth = Math.floor(backdropWidth * sizeMultipliers[size])

  // Rotate and resize photo
  let photoSharp = sharp(photoBuffer)
  
  // Apply rotation if specified
  if (rotation !== 0) {
    photoSharp = photoSharp.rotate(rotation)
  }
  
  // Resize photo maintaining aspect ratio
  const resizedPhoto = await photoSharp
    .resize(photoWidth, null, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .toBuffer()

  // Get resized photo dimensions
  const photoMetadata = await sharp(resizedPhoto).metadata()
  const photoHeight = photoMetadata.height || 0

  // Calculate position
  let left = 0
  const top = Math.floor((backdropHeight - photoHeight) / 2) // Vertically centered

  switch (position) {
    case 'left':
      left = Math.floor(backdropWidth * 0.1) // 10% from left
      break
    case 'center':
      left = Math.floor((backdropWidth - photoWidth) / 2) // Horizontally centered
      break
    case 'right':
      left = Math.floor(backdropWidth * 0.9 - photoWidth) // 10% from right
      break
  }

  // Composite photo onto backdrop (no shadow/border)
  let composite

  if (placement === 'foreground') {
    // Photo in front of backdrop
    composite = await backdrop
      .composite([{
        input: resizedPhoto,
        top: top,
        left: left
      }])
      .toBuffer()
  } else {
    // Photo behind backdrop (blend mode)
    composite = await backdrop
      .composite([{
        input: resizedPhoto,
        top: top,
        left: left,
        blend: 'multiply' // Blend into background
      }])
      .toBuffer()
  }

  // Convert to base64
  const base64 = composite.toString('base64')
  return `data:image/png;base64,${base64}`
}

/**
 * Generate a backdrop prompt optimized for immersive photo compositing
 * @param userDescription User's backdrop description
 * @param position Where the photo will be placed
 * @returns Optimized DALL-E prompt
 */
export function generateBackdropPrompt(
  userDescription: string,
  position: PhotoPosition
): string {
  const positionHints = {
    left: 'with open space on the left third of the frame',
    center: 'with a clear central focus area',
    right: 'with open space on the right third of the frame'
  }

  // Create an immersive environment prompt that blends naturally with composited photos
  return `A photorealistic scene: ${userDescription}. ${positionHints[position]}. Cinematic lighting, professional photography quality, depth of field, atmospheric perspective. Wide angle view showing the full environment. No people, no faces, no text. Ultra detailed, 8K quality.`
}
