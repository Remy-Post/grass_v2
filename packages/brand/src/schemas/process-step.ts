import { z } from 'zod';
import { ContentItemBase } from './base.js';

export const ProcessStepData = z.object({
  number: z.string(),
  icon: z.string(),
  title: z.string(),
  description: z.string(),
});

export const ProcessStep = ContentItemBase.extend({
  kind: z.literal('process-steps'),
  data: ProcessStepData,
});

export type ProcessStepData = z.infer<typeof ProcessStepData>;
export type ProcessStep = z.infer<typeof ProcessStep>;
