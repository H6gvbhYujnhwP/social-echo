import sharp from 'sharp'
import { readFile } from 'fs/promises'
import { join } from 'path'

export type LogoPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
export type LogoSize = 'small' | 'medium' | 'large'

interface OverlayOptions {
  logoPath: string
  position: LogoPosition
  size: LogoSize
}

/**
 * Calculate logo dimensions based on image size and logo size setting
 */
function calculateLogoDimensions(imageWidth: number, imageHeight: number, size: LogoSize): { width: number; height: number } {
  const basePercentage = {
    small: 0.15,  // 15% of image width
    medium: 0.25, // 25% of image width
    large: 0.35   // 35% of image width
  }[size]

  const targetWidth = Math.floor(imageWidth * basePercentage)
  
  return {
    width: targetWidth,
    height: targetWidth // Keep aspect ratio by letting Sharp handle it
  }
}

/**
 * Calculate logo position coordinates with padding
 */
function calculatePosition(
  imageWidth: number,
  imageHeight: number,
  logoWidth: number,
  logoHeight: number,
  position: LogoPosition
): { left: number; top: number } {
  const padding = Math.floor(Math.min(imageWidth, imageHeight) * 0.05) // 5% padding

  switch (position) {
    case 'top-left':
      return { left: padding, top: padding }
    
    case 'top-right':
      return { left: imageWidth - logoWidth - padding, top: padding }
    
    case 'bottom-left':
      return { left: padding, top: imageHeight - logoHeight - padding }
    
    case 'bottom-right':
      return { left: imageWidth - logoWidth - padding, top: imageHeight - logoHeight - padding }
    
    case 'center':
      return {
        left: Math.floor((imageWidth - logoWidth) / 2),
        top: Math.floor((imageHeight - logoHeight) / 2)
      }
    
    default:
      return { left: imageWidth - logoWidth - padding, top: imageHeight - logoHeight - padding }
  }
}

/**
 * Overlay logo onto a base64 image
 * @param imageBase64 - Base64 encoded image (with or without data URI prefix)
 * @param options - Logo overlay options
 * @returns Base64 encoded image with logo overlay
 */
export async function overlayLogo(
  imageBase64: string,
  options: OverlayOptions
): Promise<string> {
  try {
    // Remove data URI prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    const imageBuffer = Buffer.from(base64Data, 'base64')

    // Load the base image
    const image = sharp(imageBuffer)
    const metadata = await image.metadata()

    if (!metadata.width || !metadata.height) {
      throw new Error('Could not determine image dimensions')
    }

    // Read logo file
    const logoPath = join(process.cwd(), 'public', options.logoPath)
    const logoBuffer = await readFile(logoPath)

    // Calculate logo dimensions
    const logoDimensions = calculateLogoDimensions(
      metadata.width,
      metadata.height,
      options.size
    )

    // Resize logo
    const resizedLogo = await sharp(logoBuffer)
      .resize(logoDimensions.width, null, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .toBuffer()

    // Get resized logo metadata
    const logoMetadata = await sharp(resizedLogo).metadata()
    
    if (!logoMetadata.width || !logoMetadata.height) {
      throw new Error('Could not determine logo dimensions')
    }

    // Calculate position
    const position = calculatePosition(
      metadata.width,
      metadata.height,
      logoMetadata.width,
      logoMetadata.height,
      options.position
    )

    // Composite logo onto image
    const result = await image
      .composite([
        {
          input: resizedLogo,
          top: position.top,
          left: position.left
        }
      ])
      .toBuffer()

    // Convert back to base64
    const resultBase64 = result.toString('base64')
    const mimeType = metadata.format === 'png' ? 'image/png' : 'image/jpeg'
    
    return `data:${mimeType};base64,${resultBase64}`
  } catch (error) {
    console.error('[image-overlay] Error overlaying logo:', error)
    throw new Error('Failed to overlay logo on image')
  }
}

/**
 * Check if logo overlay should be applied based on user settings
 */
export function shouldApplyLogo(profile: {
  logoUrl: string | null
  logoEnabled: boolean
}): boolean {
  return !!(profile.logoUrl && profile.logoEnabled)
}
