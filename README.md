# The Lawn Guy Bradford

Modern lawn care site for Bradford/BWG, driven by `brand.json` + `website.json`.

## Stack

- **Monorepo:** pnpm workspaces + Turborepo
- **`apps/web`** — Next.js 15 (App Router) + Tailwind v4 + Framer Motion
- **`apps/api`** — Express 5 + Mongoose + MongoDB 7
- **`packages/brand`** — shared Zod schemas, types, color tokens, Lucide icon map

## Quickstart

```bash
pnpm install
pnpm dev          # web on :3000, api on :3001
pnpm typecheck
pnpm lint
pnpm test
```

## Sources of truth

- [`brand.json`](./brand.json) — brand identity, voice, **compliance guardrails**
- [`website.json`](./website.json) — pages, content collections, SEO

`apps/api/src/seed.ts` reads these and upserts into MongoDB. Don't hand-edit content in the DB without updating these files first.

## Phase status

See `~/.claude/plans/please-create-the-website-staged-rossum.md` for the full plan.

- [x] Phase 1 — Monorepo skeleton + design system
- [x] Phase 2 — Static frontend pages (5 routes prerender, SEO, compliance + hidden-content tests)
- [x] Phase 3 — Backend + DB + seed + public API (homepage, leads, chat)
- [x] Phase 4 — Interactive QuoteHelperForm + floating ChatWidget
- [x] Phase 5 — Admin panel (login, dashboard, content CRUD, settings, leads)
- [x] Phase 6 — OCI deployment artifacts (bootstrap, systemd, Nginx, SSL, backups) — see [ops/README.md](./ops/README.md)

**Open work / known gaps:**

- Public pages still read from `website.json` static import. Admin edits are saved
  to MongoDB but won't appear on the public site without a separate sync step.
  Two ways forward: (a) refactor pages to fetch from `/api/public/homepage` at
  request time, (b) keep `website.json` as source of truth and only use admin for
  leads. Pick one before launch.
- Owner phone number (`siteSettings.phoneDisplay`) is still a placeholder. The
  `Text For A Quote` CTA falls back to `mailto:` until it's filled in.
- Real Bradford yard photos and an owner photo are still placeholders — the brand
  spec allows mockups pre-launch as long as they're labelled.

## Compliance lock

Until verified, the site must NOT claim:

- Insurance ("fully insured", etc.)
- Ontario pesticide / herbicide / weed-control / grub-control / pest-control
- Reviews / testimonials before they exist

`brand.json#complianceGuardrails.disallowedLaunchWording` is enforced by a Vitest test that greps rendered HTML.
# grass_v2
