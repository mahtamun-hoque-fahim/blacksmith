# Blacksmith — Planner

> Web SaaS that generates production-ready Android Studio Kotlin projects from a feature selection form — no boilerplate, download and build.

## Project Overview

**Purpose.** Blacksmith eliminates the Android project setup tax. Developers select their features, architecture, and UI layer, and receive a complete, compiling Android Studio project as a `.zip` — skipping hours of Gradle config, dependency wiring, and boilerplate before the first line of real code.

**Target user.** Android developers (junior to mid-level) starting a new project who want to skip boilerplate scaffolding and write business logic from day one.

**Key value.** Download a `.zip`, open in Android Studio, it compiles and runs on the first try.

**Current phase.** Phase 2 — Generation Engine

---

## Architecture

**Stack:**

| Layer | Technology |
|---|---|
| Framework | Next.js 16 App Router |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 4 + CSS variables |
| Database | Neon PostgreSQL |
| ORM | Drizzle |
| Auth | Better Auth (email/password) |
| AI Generation | Gemini 2.0 Flash — Server Actions only, Node runtime |
| Project Packaging | JSZip (server-side, Node runtime) |
| Rate Limiting | Upstash Redis |
| Payments | LemonSqueezy (Checkout + Webhooks) |
| Deployment | Vercel (primary), Cloudflare Pages (secondary) |

**Deployment topology:**
- `main` → Vercel production auto-deploy
- PRs → Vercel preview deploys
- `main` → Cloudflare Pages (OpenNext, mirror)

**Folder structure:**
```
app/
  (auth)/             sign-in, sign-up pages
  (dashboard)/        protected: dashboard, generate
  (marketing)/        landing, pricing, about (Phase 4)
  api/
    webhooks/
      lemonsqueezy/   LemonSqueezy webhook handler (Node runtime)
components/
  ui/                 primitives: Button, Input, Card, Badge
  generator/          FeatureSelector, ArchSelector, UILayerSelector, CodePreview, GenerateForm
  layout/             Navbar, Footer, Sidebar
lib/
  auth/               Better Auth config + session helpers
  db/                 Drizzle client + schema
  generation/         prompt builder, project packager, generateProject Server Action
  redis/              Upstash client + generation counter
  gemini/             Gemini 2.0 Flash lazy client
  lemonsqueezy/       LemonSqueezy client + webhook helpers
  env.ts              Typed env validation (all 11 vars)
drizzle/              generated migrations
public/
```

---

## User Flows

### Flow 1 — Guest explores and signs up
1. Lands on `/`
2. Sees hero with feature selector preview and sample generated code snippet
3. Clicks "Start for free" → `/sign-up`
4. Enters email + password → Better Auth creates user
5. Redirected to `/dashboard`
6. Sees empty state with "Generate your first project" CTA

### Flow 2 — Free user generates a project
1. Signs in → `/dashboard`
2. Clicks "New Project" → `/generate`
3. Selects features (multi-select tiles: Retrofit, Room, Notifications, Firebase, Hilt)
4. Selects architecture: MVVM or Clean Architecture
5. Selects UI layer: XML Layouts or Jetpack Compose
6. Enters project name (letters, numbers, underscores — must start with letter)
7. Clicks "Generate"
8. Server Action: checks generation count via Upstash Redis — gate
9. If within limit: calls Gemini 2.0 Flash, receives JSON file tree, packages with JSZip
10. **Code preview renders first** (file tree + sample file viewer)
11. Download button appears after preview renders
12. Clicks "Download .zip" — base64 zip decoded and downloaded by client
13. Generation count incremented in Upstash Redis
14. Generation record saved to Neon `generations` table

### Flow 3 — Free user hits limit
1. Server Action checks Upstash Redis — monthly limit reached
2. Returns `{ limitReached: true }` — upgrade modal shown on client
3. CTA "Upgrade to Pro" → LemonSqueezy Checkout URL (from Server Action)
4. User completes LemonSqueezy payment
5. LemonSqueezy fires `subscription_created` webhook → Neon `subscriptions` updated
6. User redirected to `/dashboard?upgraded=true`
7. Generation limit removed for remainder of billing period

### Flow 4 — Pro user generates (unlimited)
1. Signs in → generation form
2. Server Action checks Neon subscriptions: `status: active` → skip Redis limit check
3. Full feature set: free features + pro features (Room Full, GitHub Actions, Multi-Module)
4. Same generation flow, no cap

---

## DB Schema

Drizzle schema lives in `src/lib/db/schema.ts`. All 7 tables confirmed in code.

### users
| column | type | notes |
|---|---|---|
| id | text PK | Better Auth managed |
| email | text unique | |
| name | text | notNull |
| emailVerified | boolean | Better Auth managed |
| image | text | nullable |
| createdAt | timestamp | defaultNow |
| updatedAt | timestamp | |

### sessions, accounts, verifications
Standard Better Auth tables — managed entirely by Better Auth.

### subscriptions
| column | type | notes |
|---|---|---|
| id | text PK | nanoid |
| userId | text FK → users.id | unique (one sub per user) |
| lsCustomerId | text unique | LemonSqueezy customer ID |
| lsSubscriptionId | text unique | nullable |
| plan | enum | `free \| pro` |
| status | enum | `active \| canceled \| past_due \| trialing` |
| currentPeriodEnd | timestamp | nullable |
| createdAt | timestamp | defaultNow |
| updatedAt | timestamp | |

### generations
| column | type | notes |
|---|---|---|
| id | text PK | nanoid |
| userId | text FK → users.id | |
| projectName | text | |
| features | text[] | selected feature IDs |
| architecture | enum | `mvvm \| clean` |
| uiLayer | enum | `xml \| compose` |
| createdAt | timestamp | defaultNow |

### generationResets
| column | type | notes |
|---|---|---|
| userId | text PK FK → users.id | |
| resetMonth | integer | current calendar month (1–12) |
| resetYear | integer | current year |
| updatedAt | timestamp | |

---

## API Routes

### Server Actions (primary data interface)

| Action | Location | Notes |
|---|---|---|
| `generateProject` | `lib/generation/actions.ts` | Validates input → checks limits (Redis + Neon) → Gemini 2.0 Flash → JSZip → saves to Neon → returns preview + base64 zip. Node runtime — no edge. |
| `getGenerationCount` | `lib/redis/index.ts` | Returns current month count for authenticated user |
| `getUserSubscription` | `lib/lemonsqueezy/index.ts` | Returns plan + status from Neon subscriptions table |
| `createCheckoutUrl` | `lib/lemonsqueezy/actions.ts` (Phase 3) | Creates LemonSqueezy Checkout URL for Pro plan upgrade |

### Route Handlers

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/api/webhooks/lemonsqueezy` | LS HMAC-SHA256 signature header | Handles `subscription_created`, `subscription_updated`, `subscription_cancelled`. Must be Node runtime — NOT Edge. |
| GET | `/api/auth/[...all]` | Better Auth | Better Auth catch-all handler |

---

## Env Vars

All validated in `src/lib/env.ts`. Do not add vars without updating that file.

| Name | Required | Notes |
|---|---|---|
| `DATABASE_URL` | yes | Neon pooled connection (http driver for CF) |
| `DATABASE_URL_UNPOOLED` | yes | Neon direct connection (migrations only) |
| `BETTER_AUTH_SECRET` | yes | Session signing secret — 32+ random chars |
| `BETTER_AUTH_URL` | yes | Full public app URL (https://...) |
| `NEXT_PUBLIC_APP_URL` | yes | Same as above — client-readable |
| `GOOGLE_GENERATIVE_AI_API_KEY` | yes | Gemini API key — server only, never `NEXT_PUBLIC_` |
| `UPSTASH_REDIS_REST_URL` | yes | Upstash Redis REST endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | yes | Upstash Redis REST token |
| `LEMONSQUEEZY_API_KEY` | yes | LemonSqueezy API key |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | yes | LemonSqueezy webhook signing secret (HMAC-SHA256) |
| `LEMONSQUEEZY_STORE_ID` | yes | LemonSqueezy store ID |
| `LEMONSQUEEZY_PRO_VARIANT_ID` | yes | LemonSqueezy variant ID for Pro plan |
| `FREE_TIER_GENERATION_LIMIT` | optional | Monthly cap for free users (default: 5) |

---

## Timeline / Phases

### Phase 1 — Foundation
**Status: ✅ Complete**

- [x] Next.js 16 project init (TypeScript strict, Tailwind 4, App Router)
- [x] Better Auth setup (email/password, 7-day session expiry)
- [x] Drizzle schema: 7 tables (user, session, account, verification, subscriptions, generations, generationResets)
- [x] Neon connection — pooled (neon-http) + unpooled
- [x] Upstash Redis client + generation counter (monthly key `gen_count:{userId}:{YYYY-MM}`, 35-day TTL)
- [x] Gemini 2.0 Flash client — lazy singleton (`getGemini()`, `getGenerationModel()`)
- [x] LemonSqueezy client + webhook handler (HMAC-SHA256 verified, subscription_created/updated/cancelled)
- [x] `proxy.ts` — protects `/dashboard` and `/generate` routes
- [x] `src/lib/env.ts` — typed env validation (all 11 vars)
- [x] Dashboard page — plan badge, Redis usage meter, Neon generation history
- [x] Generate page stub — limit check + placeholder card

### Phase 2 — Generation Engine
**Status: 🔨 In progress**

- [x] `src/lib/generation/prompt.ts` — feature catalog (FEATURE_CATALOG) + sanitizeInput + buildGenerationPrompt
- [x] `src/components/generator/FeatureSelector.tsx` — free/pro tile grid with lock states
- [ ] `src/components/generator/ArchSelector.tsx` — MVVM / Clean Architecture radio
- [ ] `src/components/generator/UILayerSelector.tsx` — XML Layouts / Jetpack Compose radio
- [ ] `src/components/generator/CodePreview.tsx` — file tree pane + code viewer pane
- [ ] `src/components/generator/GenerateForm.tsx` — client orchestrator (assembles all selectors, calls Server Action)
- [ ] `src/lib/generation/packager.ts` — parses Gemini JSON output → JSZip buffer → base64
- [ ] `src/lib/generation/actions.ts` — `generateProject` Server Action (Node runtime; validate → limit gate → Gemini → package → Neon → return)
- [ ] Wire all into `/generate` page (replace placeholder card)

### Phase 3 — Monetization
**Status: ⏳ Pending**

- [ ] `createCheckoutUrl` Server Action (LemonSqueezy Checkout URL for Pro)
- [ ] Upgrade prompt modal — shown when `limitReached: true` returns from Server Action
- [ ] Pro feature gating enforced server-side in `generateProject` (filter pro features if !isProUser)
- [ ] Billing portal link (LemonSqueezy Customer Portal URL)
- [ ] `/dashboard?upgraded=true` banner

### Phase 4 — Marketing & Launch
**Status: ⏳ Pending**

- [ ] Landing page: hero, feature demo, pricing table
- [ ] Pricing page
- [ ] Dashboard polish: generation history cards, plan badge
- [ ] OG images via `@vercel/og`
- [ ] Mobile responsiveness audit
- [ ] Accessibility pass (WCAG 2.2 AA: keyboard nav, focus indicators)
- [ ] Production deploy: Vercel + Cloudflare Pages smoke test
- [ ] Final smoke test: generate project → download → open in Android Studio → must compile

---

## Next Steps (Phase 2 — ordered)

1. `src/components/generator/ArchSelector.tsx` — MVVM / Clean radio tiles
2. `src/components/generator/UILayerSelector.tsx` — XML / Compose radio tiles
3. `src/lib/generation/packager.ts` — Gemini JSON output → JSZip buffer → base64
4. `src/lib/generation/actions.ts` — `generateProject` Server Action
5. `src/components/generator/CodePreview.tsx` — file tree + code viewer
6. `src/components/generator/GenerateForm.tsx` — full client orchestrator
7. Wire `/generate` page — replace placeholder with GenerateForm

---

## Notes & Decisions

**2026-06-06.** Council verdict: CONDITIONAL GO. Top 5 requirements: (1) Gemini API via Server Actions only — never client-side, (2) sanitize all user inputs before prompt injection, (3) code preview must render before download button appears, (4) sensible defaults on feature selector, (5) generation count tied to authenticated user ID via Upstash + Better Auth.

**2026-06-06.** JSZip runs in Node.js runtime inside a Server Action — never a Route Handler, never Edge. Ensure no `export const runtime = 'edge'` in `lib/generation/actions.ts` or any parent layout segment.

**2026-06-06.** Free tier monthly reset tracked in Neon (`generationResets` table: `resetMonth`/`resetYear`) as source of truth for billing periods. Upstash Redis is the fast gate (35-day TTL), not the source of truth.

**2026-06-06.** Generated projects output Kotlin + Gradle Kotlin DSL only. User selects XML Layouts or Jetpack Compose at generation time. Java and Groovy DSL are never emitted — this is a hard constraint in the Gemini prompt.

**2026-06-25.** ⚠️ Stack pivot reflected in PLANNER.md. AI engine was `Claude API (claude-sonnet-4)` → now **Gemini 2.0 Flash** (`GOOGLE_GENERATIVE_AI_API_KEY`). Payments were `Stripe` → now **LemonSqueezy**. DB columns were `stripeCustomerId/stripeSubscriptionId` → now `lsCustomerId/lsSubscriptionId`. Webhook route was `/api/webhooks/stripe` → now `/api/webhooks/lemonsqueezy`. PLANNER.md was stale since 2026-06-07 BRAIN.md pivot update — corrected this session.
