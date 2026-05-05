import { z } from 'zod';
import { ContentItemBase } from './base.js';

export const AddOnData = z.object({
  label: z.string().min(1),
  price: z.number().nonnegative().default(0),
});

export const AddOn = ContentItemBase.extend({
  kind: z.literal('add-ons'),
  data: AddOnData,
});

export type AddOnData = z.infer<typeof AddOnData>;
export type AddOn = z.infer<typeof AddOn>;
