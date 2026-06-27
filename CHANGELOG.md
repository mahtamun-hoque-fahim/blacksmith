# Changelog

All notable changes to Blacksmith are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows [Semantic Versioning](https://semver.org/).

---

## [v0.1.0] — 2026-06-27

First release. Full MVP: form → Gemini → Kotlin project → download.

### Added

**Phase 4 — Marketing & Launch** (a9bc9ef)
- Landing page: hero, static demo preview, how-it-works, pricing strip, final CTA
- Pricing page: Free/Pro cards, 14-row feature comparison table, FAQ section
- `Navbar` + `Footer` shared marketing components
- `opengraph-image.tsx` — OG image via `next/og` (edge runtime, 1200×630)
- Root `layout.tsx` metadata: title template, OG/Twitter cards, `metadataBase`, robots

**Phase 3 — Monetization** (6ff13e5)
- `createCheckoutUrl` Server Action — LemonSqueezy Checkout URL creation with `user_id` in custom data for webhook matching
- `getPortalUrl` Server Action — fetches customer portal URL from LemonSqueezy subscription object
- `UpgradeModal` — shown on `limitReached: true` or inline "Upgrade" button click; 4 Pro perks, checkout redirect
- `UpgradedBanner` — client component; shown on `/dashboard?upgraded=true`; clears URL param on mount
- Dashboard: `searchParams` async (Next.js 16), inline Server Action upgrade/portal forms, billing portal link for Pro users

**Phase 2 — Generation Engine** (e012ca0, 74f9358)
- `FEATURE_CATALOG` — 8 features (5 free, 3 pro), single source of truth for UI and prompt
- `sanitizeInput` — regex validation + feature ID whitelist (prompt injection guard)
- `buildGenerationPrompt` — full Gemini prompt with pinned version combos, arch specs, per-feature Gradle + code instructions, JSON output format
- `parseAndPackage` — strips Gemini markdown fences, parses JSON file array, JSZip DEFLATE → base64
- `generateProject` Server Action — requireUser → sanitize → plan check → Redis limit gate → pro-feature strip → Gemini → package → Redis increment → Neon insert
- `FeatureSelector` — free/pro tile grid with lock states, `aria-pressed`, lucide icons
- `ArchSelector` + `UILayerSelector` — radio tiles with `RadioDot`, `role="radio"`, `aria-checked`
- `CodePreview` — recursive file tree builder, dirs-first sort, auto-expand 3 levels, mobile dropdown fallback, monospace code viewer
- `GenerateForm` — client orchestrator: form → `useTransition` loading → preview + download, or error/limitReached; `atob` → `Blob` → `createObjectURL` download

**Phase 1 — Foundation** (5b57f35, cd611a9, ed4b75a)
- Next.js 16 App Router + TypeScript strict + Tailwind CSS 4 + Cloudflare Pages via OpenNext
- Better Auth email/password — session, account, verification tables
- Drizzle ORM + Neon PostgreSQL — 7-table schema: users, sessions, accounts, verifications, subscriptions, generations, generationResets
- Upstash Redis generation counter — monthly key `gen_count:{userId}:{YYYY-MM}`, 35-day TTL
- Gemini 2.0 Flash lazy client — `getGemini()` / `getGenerationModel()`
- LemonSqueezy client + webhook handler — HMAC-SHA256 signature verification, subscription lifecycle events
- `proxy.ts` — protects `/dashboard` and `/generate` routes
- `src/lib/env.ts` — typed env validation (11 vars)
- Dashboard — plan badge, Redis usage meter, Neon generation history
- Generate page stub — limit check, placeholder card (replaced in Phase 2)
