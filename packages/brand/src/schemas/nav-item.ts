import { z } from 'zod';
import { ContentItemBase } from './base.js';

export const NavItemData = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
});

export const NavItem = ContentItemBase.extend({
  kind: z.literal('nav-items'),
  data: NavItemData,
});

export type NavItemData = z.infer<typeof NavItemData>;
export type NavItem = z.infer<typeof NavItem>;
