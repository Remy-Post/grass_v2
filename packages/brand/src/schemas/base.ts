import { z } from 'zod';

export const ContentItemBase = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  enabled: z.boolean(),
  order: z.number().int().nonnegative(),
});

export type ContentItemBase = z.infer<typeof ContentItemBase>;
