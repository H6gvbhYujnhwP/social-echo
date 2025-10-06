// lib/billing/plans.ts
export type PlanKey =
  | 'SocialEcho_Starter'
  | 'SocialEcho_Pro'
  | 'SocialEcho_AgencyStarter'
  | 'SocialEcho_AgencyGrowth'
  | 'SocialEcho_AgencyScale';

export const PLANS: Record<PlanKey, { priceId: string; label: string; usageLimit: number }> = {
  SocialEcho_Starter:       { priceId: 'price_1SESnsLCgRgCwthBIS45euRo', label: 'Starter',                 usageLimit: 8 },
  SocialEcho_Pro:           { priceId: 'price_1SESohLCgRgCwthBBNUGP2XN', label: 'Pro',                     usageLimit: 10_000_000 },
  SocialEcho_AgencyStarter: { priceId: 'price_1SFCsCLCgRgCwthBJ4l3xVFT', label: 'Agency — Grow as You Go', usageLimit: 10_000_000 },
  SocialEcho_AgencyGrowth:  { priceId: 'price_1SFCsCLCgRgCwthBJ4l3xVFT', label: 'Agency — Grow as You Go', usageLimit: 10_000_000 },
  SocialEcho_AgencyScale:   { priceId: 'price_1SFCsCLCgRgCwthBJ4l3xVFT', label: 'Agency — Grow as You Go', usageLimit: 10_000_000 },
};
