/**
 * Agency Branding Context
 * 
 * Handles detection and retrieval of agency branding from:
 * - Subdomain (e.g., acme.socialecho.ai)
 * - Query parameter (e.g., ?brand=acme-agency)
 * - User's agency relationship
 */

import { prisma } from './prisma';

export interface AgencyBrandingContext {
  agencyId: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  primaryColor: string | null;
  subdomain: string | null;
  customDomain: string | null;
}

/**
 * Extract agency identifier from request
 * Returns subdomain or brand query parameter
 */
export function extractAgencyIdentifier(url: URL, host: string): string | null {
  // Check query parameter first
  const brandParam = url.searchParams.get('brand');
  if (brandParam) {
    return brandParam;
  }

  // Check subdomain
  const hostParts = host.split('.');
  
  // If host is like: acme.socialecho.ai or acme.localhost:3000
  if (hostParts.length >= 3 || (hostParts.length === 2 && host.includes('localhost'))) {
    const subdomain = hostParts[0];
    
    // Ignore www and common subdomains
    if (subdomain && subdomain !== 'www' && subdomain !== 'api' && subdomain !== 'admin') {
      return subdomain;
    }
  }

  return null;
}

/**
 * Get agency branding by slug or subdomain
 */
export async function getAgencyBrandingByIdentifier(identifier: string): Promise<AgencyBrandingContext | null> {
  const agency = await prisma.agency.findFirst({
    where: {
      OR: [
        { slug: identifier },
        { subdomain: identifier }
      ]
    },
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      primaryColor: true,
      subdomain: true,
      customDomain: true
    }
  });

  if (!agency) return null;

  return {
    agencyId: agency.id,
    name: agency.name,
    slug: agency.slug,
    logoUrl: agency.logoUrl,
    primaryColor: agency.primaryColor,
    subdomain: agency.subdomain,
    customDomain: agency.customDomain
  };
}

/**
 * Get agency branding for a user
 */
export async function getAgencyBrandingForUser(userId: string): Promise<AgencyBrandingContext | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      agency: {
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
          primaryColor: true,
          subdomain: true,
          customDomain: true
        }
      }
    }
  });

  if (!user?.agency) return null;

  return {
    agencyId: user.agency.id,
    name: user.agency.name,
    slug: user.agency.slug,
    logoUrl: user.agency.logoUrl,
    primaryColor: user.agency.primaryColor,
    subdomain: user.agency.subdomain,
    customDomain: user.agency.customDomain
  };
}

/**
 * Apply agency branding to page styles
 */
export function getAgencyStyles(branding: AgencyBrandingContext | null): string {
  if (!branding || !branding.primaryColor) {
    return '';
  }

  const color = branding.primaryColor;

  return `
    <style>
      :root {
        --agency-primary: ${color};
      }
      .agency-branded {
        background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%) !important;
      }
      .agency-branded-button {
        background-color: ${color} !important;
      }
      .agency-branded-button:hover {
        background-color: ${color}dd !important;
      }
      .agency-branded-link {
        color: ${color} !important;
      }
    </style>
  `;
}
