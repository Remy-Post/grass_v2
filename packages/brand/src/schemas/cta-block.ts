import { z } from 'zod';
import { ContentItemBase } from './base.js';

export const CtaBlockData = z.object({
  eyebrow: z.string().default(''),
  kicker: z.string().default(''),
  headline: z.string().default(''),
  emphasis: z.string().default(''),
  body: z.string().default(''),
  placeholder: z.string().default(''),
  buttonLabel: z.string().default(''),
  helperText: z.string().default(''),
  title: z.string().default(''),
  subtitle: z.string().default(''),
});

export const CtaBlock = ContentItemBase.extend({
  kind: z.literal('cta-blocks'),
  data: CtaBlockData,
});

export type CtaBlockData = z.infer<typeof CtaBlockData>;
export type CtaBlock = z.infer<typeof CtaBlock>;
