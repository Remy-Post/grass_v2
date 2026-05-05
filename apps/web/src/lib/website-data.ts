import {
  ContentItem,
  CONTENT_KINDS,
  SiteSettings as SiteSettingsSchema,
  byOrder,
  type ContentKind,
  type SiteSettings,
  type NavItem,
  type Service,
  type AddOn,
  type ProcessStep,
  type Benefit,
  type Transformation,
  type Season,
  type Faq,
  type CtaBlock,
  type FooterGroup,
} from '@lawnguy/brand';
import websiteJsonRaw from '../../../../website.json';

// ─── Types for the parts of website.json that aren't ContentItems ────────────

export type PageCopy = {
  home: {
    hero: {
      headline: string;
      emphasis: string;
      body: string;
      primaryCta: string;
      secondaryCta: string;
    };
    ownerNote: { headline: string; body: string };
  };
  services: { headline: string; body: string };
  about: { headline: string; body: string };
  contact: { headline: string; body: string };
  quoteVisit: { headline: string; body: string };
};

export type SeoSpec = {
  primaryKeywordThemes: string[];
  titleTags: Record<string, string>;
  metaDescriptions: Record<string, string>;
  localBusinessNotes?: string[];
};

export type QuoteHelperConfig = {
  role: string;
  tone: string;
  shortFlowQuestions: Array<{ id: string; question: string; options?: string[] }>;
  handoffMessage: string;
  guardrails: string[];
};

export type SiteArchitecture = {
  structure: string;
  primaryPages: Array<{
    route: string;
    name: string;
    purpose: string;
    sections: string[];
    replaces?: string;
  }>;
  navigation: Array<{ label: string; href: string }>;
};

type WebsiteJsonRaw = {
  schemaVersion: string;
  metadata: Record<string, unknown>;
  v2Goal: Record<string, unknown>;
  mustReplaceFromV1: string[];
  siteArchitecture: SiteArchitecture;
  siteSettings: unknown;
  contentCollections: Record<
    string,
    Array<{
      title: string;
      slug: string;
      enabled: boolean;
      order: number;
      data: unknown;
    }>
  >;
  pageCopy: PageCopy;
  quoteHelper: QuoteHelperConfig;
  seoSpec: SeoSpec;
};

const raw = websiteJsonRaw as unknown as WebsiteJsonRaw;

// ─── Validated public site settings ──────────────────────────────────────────

export const siteSettings: SiteSettings = SiteSettingsSchema.parse(raw.siteSettings);

// ─── Content collections (filtered to enabled, sorted by order) ──────────────

type ItemForKind<K extends ContentKind> = Extract<ContentItem, { kind: K }>;

function parseCollection<K extends ContentKind>(kind: K): ItemForKind<K>[] {
  const rawItems = raw.contentCollections[kind] ?? [];
  return rawItems.map((item, i) => {
    const result = ContentItem.safeParse({ kind, ...item });
    if (!result.success) {
      const path = `contentCollections.${kind}[${i}] (slug=${item.slug})`;
      throw new Error(`Invalid ${path}: ${result.error.message}`);
    }
    return result.data as ItemForKind<K>;
  });
}

function publicOnly<T extends { enabled: boolean; order: number }>(items: T[]): T[] {
  return items.filter((item) => item.enabled === true).sort(byOrder);
}

export const navItems: NavItem[] = publicOnly(parseCollection('nav-items'));
export const services: Service[] = publicOnly(parseCollection('services'));
export const addOns: AddOn[] = publicOnly(parseCollection('add-ons'));
export const processSteps: ProcessStep[] = publicOnly(parseCollection('process-steps'));
export const benefits: Benefit[] = publicOnly(parseCollection('benefits'));
export const transformations: Transformation[] = publicOnly(parseCollection('transformations'));
export const seasons: Season[] = publicOnly(parseCollection('seasons'));
export const faqs: Faq[] = publicOnly(parseCollection('faqs'));
export const ctaBlocks: CtaBlock[] = publicOnly(parseCollection('cta-blocks'));
export const footerGroups: FooterGroup[] = publicOnly(parseCollection('footer-groups'));

// ─── Convenience accessors ───────────────────────────────────────────────────

export function getCtaBlock(slug: 'hero' | 'final' | 'mobile-sticky'): CtaBlock | undefined {
  return ctaBlocks.find((cta) => cta.slug === slug);
}

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}

export function getTransformation(): Transformation | undefined {
  return transformations[0];
}

// ─── Other website.json sections ─────────────────────────────────────────────

export const pageCopy: PageCopy = raw.pageCopy;
export const seoSpec: SeoSpec = raw.seoSpec;
export const quoteHelperConfig: QuoteHelperConfig = raw.quoteHelper;
export const siteArchitecture: SiteArchitecture = raw.siteArchitecture;

// ─── Sanity check: all expected kinds parsed ─────────────────────────────────

void CONTENT_KINDS;
