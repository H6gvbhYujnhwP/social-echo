// lib/email/branding.ts
import { AgencyBranding } from './service';

/**
 * Apply agency branding to email HTML template
 */
export function applyAgencyBranding(html: string, branding?: AgencyBranding): string {
  if (!branding) {
    return html;
  }

  const color = branding.primaryColor || '#667eea';
  const logo = branding.logoUrl;

  // Replace default color with agency color
  let branded = html.replace(/#667eea/g, color);
  branded = branded.replace(/#764ba2/g, color);

  // If agency has a logo, add it to the header
  if (logo) {
    const logoHtml = `
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="${logo}" alt="${branding.name}" style="max-width: 200px; max-height: 80px; object-fit: contain;" />
      </div>
    `;
    // Insert logo before the main heading
    branded = branded.replace(
      /<h1[^>]*>/,
      `${logoHtml}<h1>`
    );
  }

  return branded;
}

/**
 * Apply agency branding to email text template
 */
export function applyAgencyBrandingText(text: string, branding?: AgencyBranding): string {
  if (!branding) {
    return text;
  }

  // Add agency name to the footer
  const footer = `\n\nProvided by ${branding.name} via Social Echo`;
  return text + footer;
}

/**
 * Get branded email subject
 */
export function getBrandedSubject(subject: string, branding?: AgencyBranding): string {
  if (!branding) {
    return subject;
  }

  // Don't modify the subject, keep it clean
  return subject;
}
