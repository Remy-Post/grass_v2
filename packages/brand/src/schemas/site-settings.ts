import { z } from 'zod';

export const TrustBadge = z.object({
  icon: z.string().min(1),
  label: z.string().min(1),
});

export const SiteSettings = z.object({
  businessName: z.string().min(1),
  phoneDisplay: z.string(),
  phoneHref: z.string(),
  emailDisplay: z.string(),
  emailHref: z.string(),
  serviceArea: z.string().min(1),

  // Brand colors
  brandColor: z.string(),
  brandDark: z.string(),
  accentColor: z.string(),
  bg: z.string(),
  surface: z.string(),
  surfaceAlt: z.string(),
  ink: z.string(),
  inkSoft: z.string(),
  inkMuted: z.string(),
  line: z.string(),
  grass: z.string(),

  // Hero
  heroBadge: z.string(),
  heroTitle: z.string(),
  heroEmphasis: z.string(),
  heroBody: z.string(),
  heroPhotoLabel: z.string(),

  // Trust
  socialScore: z.string(),
  socialCount: z.string(),
  googleBusinessProfileUrl: z.string(),
  trustBadges: z.array(TrustBadge),

  // Quote helper config
  quoteServices: z.array(z.string()),
  lawnSizes: z.array(z.string()),

  // Animation flags
  processSeamlessScroll: z.boolean(),
  footerDotAnimation: z.boolean(),
});

export type TrustBadge = z.infer<typeof TrustBadge>;
export type SiteSettings = z.infer<typeof SiteSettings>;
