import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import {
  SiteSettings as SiteSettingsSchema,
  ContentItem,
  CONTENT_KINDS,
  type ContentKind,
} from '@lawnguy/brand';
import { connectDb, disconnectDb } from './config/db.js';
import { upsertContentItem, upsertSiteSettings } from './services/contentRepo.js';
import { logger } from './config/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// apps/api/src → repoRoot is 3 levels up. Same after compiling to apps/api/dist.
const repoRoot = path.resolve(__dirname, '../../..');

type RawWebsiteJson = {
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
};

async function readJson<T>(filename: string): Promise<T> {
  const filePath = path.join(repoRoot, filename);
  const text = await fs.readFile(filePath, 'utf8');
  return JSON.parse(text) as T;
}

async function main(): Promise<void> {
  await connectDb();
  const website = await readJson<RawWebsiteJson>('website.json');

  // ── Site settings (singleton) ──
  const settings = SiteSettingsSchema.parse(website.siteSettings);
  await upsertSiteSettings(settings);
  logger.info('seed: siteSettings upserted');

  // ── Content collections ──
  const counts: Record<string, number> = {};
  let total = 0;

  for (const kind of CONTENT_KINDS as ReadonlyArray<ContentKind>) {
    const items = website.contentCollections[kind] ?? [];
    for (const item of items) {
      const validated = ContentItem.parse({ kind, ...item });
      await upsertContentItem({
        kind: validated.kind,
        title: validated.title,
        slug: validated.slug,
        enabled: validated.enabled,
        order: validated.order,
        data: validated.data,
      });
      total += 1;
    }
    counts[kind] = items.length;
  }

  logger.info({ counts, total }, 'seed: content upserted');
}

main()
  .then(async () => {
    await disconnectDb();
    process.exit(0);
  })
  .catch(async (err: unknown) => {
    logger.error({ err }, 'seed failed');
    await disconnectDb().catch(() => undefined);
    process.exit(1);
  });
