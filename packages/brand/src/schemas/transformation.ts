import { z } from 'zod';
import { ContentItemBase } from './base.js';

export const TransformationData = z.object({
  eyebrow: z.string().default(''),
  title: z.string(),
  emphasis: z.string().default(''),
  subtitle: z.string().default(''),
  badges: z.array(z.string()).default([]),
  beforeImageSrc: z.string().optional(),
  afterImageSrc: z.string().optional(),
  beforeLabel: z.string().default(''),
  afterLabel: z.string().default(''),
  beforeTone: z.string().default('before'),
  afterTone: z.string().default('after'),
});

export const Transformation = ContentItemBase.extend({
  kind: z.literal('transformations'),
  data: TransformationData,
});

export type TransformationData = z.infer<typeof TransformationData>;
export type Transformation = z.infer<typeof Transformation>;
