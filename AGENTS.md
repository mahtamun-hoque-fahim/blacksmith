# AGENTS.md — Blacksmith

> Agent-facing setup guide and rolling session log.
> Add a new entry to the Session Log at the end of every build session.
> Format: `## Session — YYYY-MM-DD | Agent: <claude-account>`

---

## Project Identity

**Blacksmith** — Web SaaS that generates production-ready Android Studio Kotlin projects
from a feature selection form. Select features, Gemini 2.0 Flash builds it, download and build.

Repo: `https://github.com/mahtamun-hoque-fahim/blacksmith`
Owner: Mahtamun Hoque Fahim (@mahtamun-hoque-fahim)
License: All Rights Reserved

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 App Router |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 4 (via `@theme` in globals.css — no tailwind.config.ts) |
| Database | Neon PostgreSQL + Drizzle ORM |
| Auth | Better Auth (email/password) |
| AI | Gemini 2.0 Flash (`@google/generative-ai`) |
| Packaging | JSZip (server-side, Node runtime) |
| Rate Limiting | Upstash Redis |
| Payments | LemonSqueezy |
| Deployment | Vercel (primary) + Cloudflare Pages (OpenNext, secondary) |

---

## Schema (6 tables)

`user` `session` `account` `verification` `subscriptions` `generations`

> `generationResets` was dropped 2026-06-27 (dead table — never written to;
> monthly reset is handled by Upstash Redis 35-day TTL, not Neon).

---

## Key File Locations

| What | Where |
|---|---|
| Env validation (single source of truth for env var names) | `src/lib/env.ts` |
| Feature catalog + prompt builder + sanitizeInput | `src/lib/generation/prompt.ts` |
| generateProject Server Action | `src/lib/generation/actions.ts` |
| JSZip packager (strips Gemini fences, builds zip) | `src/lib/generation/packager.ts` |
| Gemini lazy client | `src/lib/gemini/index.ts` |
| Better Auth server config | `src/lib/auth/index.ts` |
| Better Auth client | `src/lib/auth/client.ts` |
| requireUser / getSession | `src/lib/auth/session.ts` |
| Drizzle schema | `src/lib/db/schema.ts` |
| Drizzle client (lazy getDb) | `src/lib/db/index.ts` |
| LemonSqueezy helpers + verifyWebhookSignature | `src/lib/lemonsqueezy/index.ts` |
| LemonSqueezy Server Actions (checkout + portal) | `src/lib/lemonsqueezy/actions.ts` |
| Upstash Redis counter | `src/lib/redis/index.ts` |
| Route protection | `proxy.ts` (Next.js 16 middleware equivalent) |
| Waterborne emoji scanner | `scripts/scan_emojis.py` |

---

## Conventions

- **No emojis anywhere** in source code or UI. Lucide React icons only.
  Run `python3 scripts/scan_emojis.py --root .` to verify.
- **Tailwind v4** — no `tailwind.config.ts`. Tokens live in `globals.css` under `@theme`.
  Custom animations: `@keyframes` + `--animate-*` in `@theme`.
- **Node runtime only** for `generateProject` action (JSZip + Gemini SDK).
  Never add `export const runtime = 'edge'` to `lib/generation/actions.ts` or any
  parent layout wrapping `/generate`.
- **Server Actions** are the primary data interface — not Route Handlers.
  Route Handlers only for: Better Auth (`/api/auth/[...all]`) and LemonSqueezy webhook
  (`/api/webhooks/lemonsqueezy`).
- **GOOGLE_GENERATIVE_AI_API_KEY** is the Gemini env var name (not ANTHROPIC_API_KEY —
  the project started with Claude API and pivoted to Gemini).
- **getDb()** is synchronous (not async). Use `const db = getDb()`, no `await`.
- **Dark-first, no light mode.** Never add `dark:` variants — they imply light mode exists.
- **`font-syne`** for all headings. `font-onest` for body (both set in globals.css).
- **LemonSqueezy** `custom.user_id` in webhook payload links a subscription to a Neon user row.
  The webhook handler is the only place that writes to the `subscriptions` table.
- **Redis key format:** `gen_count:{userId}:{YYYY-MM}` (35-day TTL, auto-set on first write).

---

## Guarded Against (Do Not Reintroduce)

- Stripe (fully removed — replaced by LemonSqueezy)
- Claude API / Anthropic SDK (fully removed — replaced by Gemini 2.0 Flash)
- Supabase (never introduced, explicitly banned in BRAIN.md)
- `transition-all` on any element (always specify properties explicitly)
- `export const runtime = 'edge'` in generation action or any parent layout
- Emojis in any `.ts` / `.tsx` / `.md` under `src/`

---

## Session Log

---

### Session — 2026-06-25 | Agent: claude-zen

**Scope:** Phase 1 build

- Singularity ran — BRAIN.md committed (Gemini 2.0 Flash + LemonSqueezy stack locked)
- repo-maintainer scaffold: PLANNER.md, DESIGN_GUIDE.md, README.md
- Phase 1 shipped: Next.js 16 init, Better Auth, Drizzle schema (7 tables at the time),
  Upstash Redis counter, Gemini 2.0 Flash lazy client, LemonSqueezy webhook handler
  (HMAC-SHA256), proxy.ts, env.ts, dashboard page, generate page stub

**Decisions made:**
- Gemini 2.0 Flash over Claude API (cost + reliability for BD-based indie SaaS)
- LemonSqueezy over Stripe (MoR handles VAT/tax globally)
- PLANNER.md was stale from a pre-pivot draft at session start — doc drift fixed at
  session start of 2026-06-27 session

---

### Session — 2026-06-27 | Agent: claude-zen

**Scope:** Phases 2–4, post-build pipeline, gh-meta

**Phase 2 — Generation Engine:**
- `src/lib/generation/prompt.ts` — FEATURE_CATALOG (8 features), sanitizeInput, buildGenerationPrompt
- `src/lib/generation/packager.ts` — Gemini JSON fence stripper + JSZip builder
- `src/lib/generation/actions.ts` — generateProject Server Action (Node runtime)
- `src/components/generator/FeatureSelector.tsx` — free/pro tile grid, lock states
- `src/components/generator/ArchSelector.tsx` — MVVM/Clean radio tiles
- `src/components/generator/UILayerSelector.tsx` — XML/Compose radio tiles
- `src/components/generator/CodePreview.tsx` — recursive file tree + code viewer
- `src/components/generator/GenerateForm.tsx` — full client orchestrator
- `/generate` page: stripped to data shell, mounts GenerateForm

**Phase 3 — Monetization:**
- `src/lib/lemonsqueezy/actions.ts` — createCheckoutUrl, getPortalUrl Server Actions
- `src/components/ui/Modal.tsx` — reusable overlay modal
- `src/components/generator/UpgradeModal.tsx` — upgrade flow with checkout redirect
- `src/components/dashboard/UpgradedBanner.tsx` — post-checkout success banner
- dashboard/page.tsx: searchParams async (Next.js 16), inline Server Action upgrade/portal forms

**Phase 4 — Marketing:**
- Landing page (full), pricing page, Navbar, Footer
- opengraph-image.tsx (edge runtime, next/og)
- layout.tsx metadata: title template, OG/Twitter cards, metadataBase

**gh-meta (INIT + RELEASE v0.1.0):**
- About description + 16 topics set via GitHub REST API
- License switched MIT → All Rights Reserved (public SaaS with paid tier)
- CHANGELOG.md created, README badges injected, v0.1.0 tagged and released

**Post-build pipeline:**
- waterborne: CLEAN (47 files) — 5 emoji hits in PLANNER.md docs removed
- motion-hive: 12 files patched — easing tokens, keyframes, active:scale on all CTAs,
  Modal animate-scale-in/fade-in, UpgradedBanner animate-fade-up, transition-all removed
- valley-of-death: 5 FAILs resolved (see fixes below)

**valley-of-death fixes applied this session:**
- README.md: full rewrite — Claude→Gemini, Stripe→LemonSqueezy, wrong env vars, wrong
  clone URL (droidsmith→blacksmith), Stripe webhook section→LemonSqueezy instructions,
  folder structure corrected
- BRAIN.md Current State: updated to Phase 4 complete / MVP shipped
- generationResets table: DROPPED from schema.ts (was dead — never written to;
  Redis TTL already handles monthly resets). Table count: 7→6. PLANNER.md corrected.
- AGENTS.md: created (this file)
- SITETREE.md: created

**Known outstanding:**
- Env vars not filled (not yet deployed)
- Build not CI-verified in container (node_modules absent)
- sentinel, airborne, humanizer, cave-man, motion-hive touch-up, council POST,
  ticket-checker still pending in post-build pipeline

---

### Session — 2026-06-29 | Agent: claude-firefox

**Scope:** Post-build pipeline continuation — sentinel, airborne, humanizer, waterborne scoped re-scan

**sentinel ⛔ CLEARED (prior session — logged here for completeness):**
- Auth rate limiting added to sign-in / sign-up routes
- drizzle-orm bumped past CVE-2026-39356
- variant_id webhook guard added to LemonSqueezy handler
- Security headers added (X-Frame-Options, X-Content-Type-Options, etc.)
- Generic error messages normalized (no stack traces to client)

**airborne CLEARED:**
- robots.ts created (disallow /dashboard, /generate, /api/)
- sitemap.ts created (index /, /pricing)
- noindex set on sign-in, sign-up, dashboard, generate
- Landing page: per-page metadata export (keyword-first title + description)
- Pricing page: title + description + H1 updated
- JSON-LD: SoftwareApplication schema on / and /pricing
- Commit: f05b1e4

**humanizer CLEARED (this session):**
- page.tsx hero sub: removed em dash, significance puffery ("complete, compiling"), generic "in seconds" ending
- page.tsx step 1: dropped "toggle" (AI verb)
- page.tsx step 2: broke rule-of-three, replaced vague "proper wiring", gave developer voice
- page.tsx step 3: removed em dash and "every time" tagline
- pricing/page.tsx H1: removed em dash
- pricing/page.tsx FAQ 1: removed "for any reason" filler hedge, trailing em dash
- pricing/page.tsx FAQ 2: removed verbose "calendar month", humanized "removes the cap immediately"
- pricing/page.tsx FAQ 4: replaced em dash with period, "Pinned. No version drift." as punchy ending
- meta exports and JSON-LD untouched (machine-read, exempt from humanizer)
- Commit: cfc9c06

**waterborne scoped re-scan:** CLEAN — box-drawing comment chars (U+2500) confirmed not emoji

**Known outstanding:**
- Env vars not filled (not yet deployed)
- Build not CI-verified
- cave-man, motion-hive touch-up, council POST, ticket-checker pending

---

### Session — 2026-06-30 | Agent: claude-firefox

**Scope:** Post-build pipeline continuation — humanizer, waterborne scoped re-scan, cave-man

**humanizer CLEARED (this session):**
- page.tsx: 4 prose changes (hero sub, 3 step bodies) — em dashes, rule-of-three, AI puffery stripped
- pricing/page.tsx: 4 changes (H1 em dash, FAQ 1 hedge, FAQ 2 corp phrasing, FAQ 4 em dash)
- All metadata/JSON-LD untouched (machine-read, exempt)
- Commit: cfc9c06

**waterborne scoped re-scan:** CLEAN — box-drawing comment chars (U+2500) false-positived, confirmed not emoji

**cave-man CLEARED (this session):**
- Pages scanned: 2 marketing (/ and /pricing), 4 other (sign-in, sign-up, dashboard, generate)
- Zones already correct: 1 — demo preview HAS-ART (intentional coded product mock)
- Zones needing art: 5 — hero, how-it-works (×3 steps merged), final CTA, dashboard empty state
- Auth pages (sign-in, sign-up): NEEDS-ART noted but require layout restructure, skipped for now
- Pricing page: KEEP-FLAT across all zones

IMAGE-BRIEF slots inserted (grep -r IMAGE-BRIEF: src/ returns 6 lines):
  hero-illustration  | 1:1  | app/page.tsx:179         — abstract 3D Android device silhouette, accent glow, hero right side
  step-01-art        | 4:3  | app/page.tsx:268         — feature selector tile grid illustration
  step-02-art        | 4:3  | app/page.tsx:269         — Kotlin code streaming / AI generation
  step-03-art        | 4:3  | app/page.tsx:270         — Android Studio BUILD SUCCESSFUL window
  cta-bg             | 16:9 | app/page.tsx:385         — faint background illustration for CTA banner
  empty-01           | 1:1  | dashboard/page.tsx:143   — friendly empty state Android/Kotlin graphic

All placeholders: dashed border + bg-surface/40, aria-hidden, data-image-slot attribute.
Commit: eb12066

**Known outstanding:**
- motion-hive touch-up (scoped — new data-image-slot placeholders only)
- council POST
- ticket-checker
- Actual artwork for 6 slots — Fahim's responsibility
