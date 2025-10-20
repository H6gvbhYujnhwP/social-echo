import * as QRCode from 'qrcode';

/**
 * Generate a QR code as a data URL
 * @param text - The text to encode in the QR code
 * @returns Promise<string> - Data URL of the QR code image
 */
export async function qrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text);
}

/**
 * Generate a QR code as a string (ASCII art, SVG, etc.)
 * @param text - The text to encode in the QR code
 * @param options - QRCode options
 * @returns Promise<string> - String representation of the QR code
 */
export async function qrString(text: string, options?: unknown): Promise<string> {
  return QRCode.toString(text, options);
}

