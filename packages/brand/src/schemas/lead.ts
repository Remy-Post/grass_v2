import { z } from 'zod';
import { normalizeLeadAddress } from '../helpers.js';

export const LeadInput = z.object({
  name: z.string().min(1, 'Please add your name').max(120),
  contact: z.string().min(1, 'Add a phone or email').max(200),
  address: z.string().min(1, 'Where is the property?').max(300).transform(normalizeLeadAddress),
  serviceNeed: z.string().max(120).optional(),
  cadence: z.string().max(40).optional(),
  yardState: z.string().max(40).optional(),
  notes: z.string().max(2000).optional(),
  // Honeypot — must be empty. Bots tend to fill every field.
  website: z.string().max(0).optional().or(z.literal('')),
});

export const LeadRecord = LeadInput.extend({
  id: z.string(),
  createdAt: z.string(),
  source: z.string().default('contact-form'),
  ip: z.string().optional(),
  userAgent: z.string().optional(),
});

export type LeadInput = z.infer<typeof LeadInput>;
export type LeadRecord = z.infer<typeof LeadRecord>;
