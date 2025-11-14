import sharp from 'sharp'
import { readFile } from 'fs/promises'
import { join } from 'path'

export type LogoPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
export type LogoSize = 'small' | 'medium' | 'large'

interface OverlayOptions {
  logoPath: string
  position: LogoPosition
  size: LogoSize
  offsetX?: number  // Horizontal offset in pixels (default: 0)
  offsetY?: number  // Vertical offset in pixels (default: 0)
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
  position: LogoPosition,
  offsetX: number = 0,
  offsetY: number = 0
): { left: number; top: number } {
  const padding = Math.floor(Math.min(imageWidth, imageHeight) * 0.05) // 5% padding

  let basePosition: { left: number; top: number }
  
  switch (position) {
    case 'top-left':
      basePosition = { left: padding, top: padding }
      break
    
    case 'top-right':
      basePosition = { left: imageWidth - logoWidth - padding, top: padding }
      break
    
    case 'bottom-left':
      basePosition = { left: padding, top: imageHeight - logoHeight - padding }
      break
    
    case 'bottom-right':
      basePosition = { left: imageWidth - logoWidth - padding, top: imageHeight - logoHeight - padding }
      break
    
    case 'center':
      basePosition = {
        left: Math.floor((imageWidth - logoWidth) / 2),
        top: Math.floor((imageHeight - logoHeight) / 2)
      }
      break
    
    default:
      basePosition = { left: imageWidth - logoWidth - padding, top: imageHeight - logoHeight - padding }
  }
  
  // Apply offsets and clamp to image bounds
  const finalLeft = Math.max(0, Math.min(imageWidth - logoWidth, basePosition.left + offsetX))
  const finalTop = Math.max(0, Math.min(imageHeight - logoHeight, basePosition.top + offsetY))
  
  return { left: finalLeft, top: finalTop }
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

    // Read logo - handle both file paths and base64 data URIs
    let logoBuffer: Buffer
    
    if (options.logoPath.startsWith('data:image/')) {
      // Base64 data URI - extract and convert
      const base64Data = options.logoPath.replace(/^data:image\/\w+;base64,/, '')
      logoBuffer = Buffer.from(base64Data, 'base64')
    } else {
      // File path - read from public directory
      const logoPath = join(process.cwd(), 'public', options.logoPath)
      logoBuffer = await readFile(logoPath)
    }

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

    // Calculate position with offsets
    const position = calculatePosition(
      metadata.width,
      metadata.height,
      logoMetadata.width,
      logoMetadata.height,
      options.position,
      options.offsetX || 0,
      options.offsetY || 0
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
