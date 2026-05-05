import { z } from 'zod';
import { NavItem } from './nav-item.js';
import { Service } from './service.js';
import { AddOn } from './add-on.js';
import { ProcessStep } from './process-step.js';
import { Benefit } from './benefit.js';
import { Transformation } from './transformation.js';
import { Season } from './season.js';
import { Faq } from './faq.js';
import { CtaBlock } from './cta-block.js';
import { FooterGroup } from './footer-group.js';

export const ContentItem = z.discriminatedUnion('kind', [
  NavItem,
  Service,
  AddOn,
  ProcessStep,
  Benefit,
  Transformation,
  Season,
  Faq,
  CtaBlock,
  FooterGroup,
]);

export type ContentItem = z.infer<typeof ContentItem>;

export const CONTENT_KINDS = [
  'nav-items',
  'services',
  'add-ons',
  'process-steps',
  'benefits',
  'transformations',
  'seasons',
  'faqs',
  'cta-blocks',
  'footer-groups',
] as const;

export type ContentKind = (typeof CONTENT_KINDS)[number];

export function isContentKind(value: string): value is ContentKind {
  return (CONTENT_KINDS as readonly string[]).includes(value);
}
