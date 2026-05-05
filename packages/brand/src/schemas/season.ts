import { z } from 'zod';
import { ContentItemBase } from './base.js';

export const SeasonServiceRef = z.object({
  serviceSlug: z.string(),
  detail: z.string(),
});

export const SeasonData = z.object({
  icon: z.string(),
  tone: z.string(),
  label: z.string(),
  months: z.string(),
  intro: z.string(),
  services: z.array(SeasonServiceRef).default([]),
});

export const Season = ContentItemBase.extend({
  kind: z.literal('seasons'),
  data: SeasonData,
});

export type SeasonServiceRef = z.infer<typeof SeasonServiceRef>;
export type SeasonData = z.infer<typeof SeasonData>;
export type Season = z.infer<typeof Season>;
