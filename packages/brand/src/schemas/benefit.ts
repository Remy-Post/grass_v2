import { z } from 'zod';
import { ContentItemBase } from './base.js';

export const BenefitData = z.object({
  icon: z.string(),
  title: z.string(),
  description: z.string(),
});

export const Benefit = ContentItemBase.extend({
  kind: z.literal('benefits'),
  data: BenefitData,
});

export type BenefitData = z.infer<typeof BenefitData>;
export type Benefit = z.infer<typeof Benefit>;
