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
