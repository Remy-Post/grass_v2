import type { ContentKind } from '@lawnguy/brand';
import { ContentItemModel } from '../models/ContentItem.js';
import { SiteSettingsModel } from '../models/SiteSettings.js';

/**
 * Public homepage payload: all enabled content keyed by kind, sorted by order.
 * One DB round-trip via $facet would be tighter but readability wins at this scale.
 */
export async function getHomepagePayload() {
  const [settingsDoc, items] = await Promise.all([
    SiteSettingsModel.findOne({ key: 'default' }).lean(),
    ContentItemModel.find({ enabled: true }).sort({ kind: 1, order: 1 }).lean(),
  ]);

  const content: Record<string, Array<Record<string, unknown>>> = {};
  for (const item of items) {
    const kind = item.kind as string;
    if (!content[kind]) content[kind] = [];
    content[kind].push({
      title: item.title,
      slug: item.slug,
      enabled: item.enabled,
      order: item.order,
      data: item.data,
    });
  }

  return {
    siteSettings: settingsDoc?.data ?? null,
    content,
  };
}

export async function upsertContentItem(args: {
  kind: ContentKind;
  title: string;
  slug: string;
  enabled: boolean;
  order: number;
  data: unknown;
}) {
  const { kind, slug, ...rest } = args;
  return ContentItemModel.findOneAndUpdate(
    { kind, slug },
    { kind, slug, ...rest },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean();
}

export async function upsertSiteSettings(data: unknown) {
  return SiteSettingsModel.findOneAndUpdate(
    { key: 'default' },
    { key: 'default', data },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean();
}
