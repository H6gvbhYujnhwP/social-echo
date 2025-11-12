import sharp from 'sharp'

export type PhotoPosition = 'left' | 'center' | 'right'
export type PhotoSize = 'small' | 'medium' | 'large'
export type PhotoPlacement = 'foreground' | 'background'

interface CompositeOptions {
  backdropBase64: string
  photoBase64: string
  position: PhotoPosition
  size: PhotoSize
  placement: PhotoPlacement
}

/**
 * Composite a user photo onto an AI-generated backdrop
 * @param options Compositing configuration
 * @returns Base64 encoded composite image
 */
export async function compositeImages(options: CompositeOptions): Promise<string> {
  const { backdropBase64, photoBase64, position, size, placement } = options

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

  // Resize photo maintaining aspect ratio
  const resizedPhoto = await sharp(photoBuffer)
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

  // Create shadow/glow effect for depth
  const photoWithShadow = await sharp(resizedPhoto)
    .extend({
      top: 10,
      bottom: 10,
      left: 10,
      right: 10,
      background: { r: 0, g: 0, b: 0, alpha: 0.3 }
    })
    .blur(5)
    .composite([{
      input: resizedPhoto,
      top: 10,
      left: 10
    }])
    .toBuffer()

  // Composite photo onto backdrop
  let composite

  if (placement === 'foreground') {
    // Photo in front of backdrop
    composite = await backdrop
      .composite([{
        input: photoWithShadow,
        top: top - 10, // Adjust for shadow
        left: left - 10
      }])
      .toBuffer()
  } else {
    // Photo behind backdrop (blend mode)
    composite = await backdrop
      .composite([{
        input: photoWithShadow,
        top: top - 10,
        left: left - 10,
        blend: 'multiply' // Blend into background
      }])
      .toBuffer()
  }

  // Convert to base64
  const base64 = composite.toString('base64')
  return `data:image/png;base64,${base64}`
}

/**
 * Generate a backdrop prompt optimized for photo compositing
 * @param userDescription User's backdrop description
 * @param position Where the photo will be placed
 * @returns Optimized DALL-E prompt
 */
export function generateBackdropPrompt(
  userDescription: string,
  position: PhotoPosition
): string {
  const positionHints = {
    left: 'with open space on the left side',
    center: 'with a clear central area',
    right: 'with open space on the right side'
  }

  return `Professional photography backdrop: ${userDescription}. ${positionHints[position]}. High quality, well-lit, suitable for product or portrait photography. No people or faces. Clean composition.`
}
