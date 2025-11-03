// lib/billing/plans.ts
export type PlanKey =
  | 'SocialEcho_Starter'
  | 'SocialEcho_Pro'
  | 'SocialEcho_AgencyStarter'
  | 'SocialEcho_AgencyGrowth'
  | 'SocialEcho_AgencyScale';

export const PLANS: Record<PlanKey, { priceId: string; label: string; usageLimit: number | null }> = {
  SocialEcho_Starter:       { priceId: 'price_1SJ8wELCgRgCwthBO00zfEnE', label: 'Starter',                 usageLimit: 30 },
  SocialEcho_Pro:           { priceId: 'price_1SFD2xLCgRgCwthB6CVcyT4r', label: 'Pro',                     usageLimit: 30 },
  SocialEcho_AgencyStarter: { priceId: 'price_1SFCsCLCgRgCwthBJ4l3xVFT', label: 'Agency — Grow as You Go', usageLimit: null },
  SocialEcho_AgencyGrowth:  { priceId: 'price_1SFCsCLCgRgCwthBJ4l3xVFT', label: 'Agency — Grow as You Go', usageLimit: null },
  SocialEcho_AgencyScale:   { priceId: 'price_1SFCsCLCgRgCwthBJ4l3xVFT', label: 'Agency — Grow as You Go', usageLimit: null },
};
