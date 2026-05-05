import { z } from 'zod';
import { ContentItemBase } from './base.js';

export const ServiceData = z.object({
  name: z.string().min(1),
  icon: z.string().min(1),
  price: z.number().nonnegative().default(0),
  includes: z.array(z.string()).default([]),
  freq: z.string().default(''),
  beforeImageSrc: z.string().optional(),
  afterImageSrc: z.string().optional(),
  itemImageSrc: z.string().optional(),
  reviewKeywords: z.array(z.string()).default([]),
  problem: z.string().default(''),
  result: z.string().default(''),
  quoteNote: z.string().default(''),
});

export const Service = ContentItemBase.extend({
  kind: z.literal('services'),
  data: ServiceData,
});

export type ServiceData = z.infer<typeof ServiceData>;
export type Service = z.infer<typeof Service>;
