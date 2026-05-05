import { z } from 'zod';
import { ContentItemBase } from './base.js';

export const FaqData = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

export const Faq = ContentItemBase.extend({
  kind: z.literal('faqs'),
  data: FaqData,
});

export type FaqData = z.infer<typeof FaqData>;
export type Faq = z.infer<typeof Faq>;
