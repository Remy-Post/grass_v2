import { z } from 'zod';
import { ContentItemBase } from './base.js';

export const FooterGroupData = z.object({
  title: z.string().min(1),
  links: z.array(z.string()).default([]),
});

export const FooterGroup = ContentItemBase.extend({
  kind: z.literal('footer-groups'),
  data: FooterGroupData,
});

export type FooterGroupData = z.infer<typeof FooterGroupData>;
export type FooterGroup = z.infer<typeof FooterGroup>;
