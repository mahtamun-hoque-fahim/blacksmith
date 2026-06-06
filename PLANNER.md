# Droidsmith — Planner

> One-line description: Web SaaS that generates production-ready Android Studio Kotlin projects from a feature selection form.

## Project Overview

**Purpose.** Droidsmith eliminates the Android project setup tax. Developers select their features, architecture, and UI layer, and receive a complete, compiling Android Studio project as a .zip — skipping hours of Gradle config, dependency wiring, and boilerplate before the first line of real code.

**Target user.** Android developers, junior to mid-level, starting a new project and wanting to skip boilerplate scaffold work and write business logic from day one.

**Key value.** Download a .zip, open in Android Studio, and it compiles and runs on the first try.

**Current phase.** Planning

---

## Architecture

**Stack:**
- Framework: Next.js 16 App Router
- Language: TypeScript (strict)
- Styling: Tailwind CSS 4 + CSS variables
- Database: Neon PostgreSQL
- ORM: Drizzle
- Auth: Better Auth (email/password)
- AI Generation: Claude API (claude-sonnet-4) — Server Actions only, Node runtime
- Project Packaging: JSZip (server-side, Node runtime)
- Rate Limiting: Upstash Redis
- Payments: Stripe (Checkout + Webhooks)
- Deployment: Vercel (primary), Cloudflare Pages (secondary)

**Deployment topology:**
- `main` → Vercel production auto-deploy
- PRs → Vercel preview deploys
- `main` → Cloudflare Pages production (mirror)

**Folder structure (summary):**
```
app/
  (auth)/           sign-in, sign-up pages
  (dashboard)/      protected: dashboard, generate
  (marketing)/      landing, pricing, about
  api/
    webhooks/
      stripe/       Stripe webhook handler (Node runtime)
components/
  ui/               primitives (Button, Input, Card, Badge)
  generator/        FeatureSelector, ArchSelector, CodePreview
  layout/           Navbar, Footer, Sidebar
lib/
  auth/             Better Auth config
  db/               Drizzle client + schema
  generation/       prompt builder, project packager
  redis/            Upstash client + generation counter
  stripe/           Stripe client + helpers
drizzle/            generated migrations
public/
```

---

## User Flows

### Flow 1 — Guest explores and signs up
1. Lands on `/`
2. Sees hero with feature selector preview and sample generated code snippet
3. Clicks "Start for free" → `/sign-up`
4. Enters email + password → Better Auth creates user with `plan: free`
5. Redirected to `/dashboard`
6. Sees empty state with "Generate your first project" CTA

### Flow 2 — Free user generates a project
1. Signs in → `/dashboard`
2. Clicks "New Project" → `/generate`
3. Selects features: auth, Room DB, Retrofit, notifications, Firebase (multi-select)
4. Selects architecture: MVVM or Clean Architecture
5. Selects UI layer: XML Layouts or Jetpack Compose
6. Enters project name (alphanumeric, no spaces)
7. Clicks "Generate"
8. Server Action: checks generation count via Upstash Redis
9. If within limit: calls Claude API, builds Kotlin project files, packages with JSZip
10. Code preview renders (file tree + sample file viewer)
11. Clicks "Download .zip" — zip streams to browser
12. Generation count incremented in Upstash Redis
13. Generation record saved to Neon `generations` table

### Flow 3 — Free user hits generation limit
1. Attempts to generate
2. Server Action checks Upstash Redis — limit reached
3. Upgrade modal shown: "You've used X/Y free generations this month"
4. CTA "Upgrade to Pro" → Stripe Checkout session created
5. User completes Stripe payment
6. Stripe webhook fires → subscription record written to Neon
7. User redirected to `/dashboard?upgraded=true`
8. Generation limit removed for remainder of billing period

### Flow 4 — Pro user generates (unlimited)
1. Signs in → generation form
2. Server Action checks Neon subscriptions: `status: active` → no Redis limit check
3. Full feature set unlocked: premium features (Room DB full setup, CI/CD configs, multi-module architecture)
4. Same generation flow, no cap

---

## DB Schema

Drizzle schema lives in `lib/db/schema.ts`.

### users
| column | type | notes |
|---|---|---|
| id | text PK | Better Auth managed |
| email | text unique | |
| name | text | nullable |
| emailVerified | boolean | Better Auth managed |
| image | text | nullable |
| createdAt | timestamp | defaultNow |
| updatedAt | timestamp | |

### sessions
Standard Better Auth table — managed by Better Auth.

### accounts
Standard Better Auth table — managed by Better Auth.

### verifications
Standard Better Auth table — managed by Better Auth.

### subscriptions
| column | type | notes |
|---|---|---|
| id | text PK | nanoid |
| userId | text FK → users.id | |
| stripeCustomerId | text unique | |
| stripeSubscriptionId | text unique | nullable |
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
| features | text[] | selected feature list |
| architecture | enum | `mvvm \| clean` |
| uiLayer | enum | `xml \| compose` |
| createdAt | timestamp | defaultNow |

---

## API Routes

### Server Actions (primary)

| Action | Location | Auth | Description |
|---|---|---|---|
| `generateProject` | `lib/generation/actions.ts` | session required | Validates input, checks limits, calls Claude API, packages zip, returns download stream |
| `getGenerationCount` | `lib/redis/actions.ts` | session required | Returns current month generation count for user |
| `createCheckoutSession` | `lib/stripe/actions.ts` | session required | Creates Stripe Checkout session for Pro plan |
| `getSubscriptionStatus` | `lib/stripe/actions.ts` | session required | Returns user's current plan and status from Neon |

### Route Handlers

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/api/webhooks/stripe` | Stripe signature | Handles `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`. Must be Node runtime — NOT Edge. |

---

## Env Vars

| Name | Required | Description | Example |
|---|---|---|---|
| `DATABASE_URL` | yes | Neon pooled connection string | `postgresql://...?sslmode=require` |
| `DATABASE_URL_UNPOOLED` | yes | Neon direct connection (migrations only) | `postgresql://...?sslmode=require` |
| `BETTER_AUTH_SECRET` | yes | Session signing secret (32+ chars) | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | yes | Public app URL | `https://droidsmith.dev` |
| `NEXT_PUBLIC_APP_URL` | yes | Same as above, client-readable | `https://droidsmith.dev` |
| `ANTHROPIC_API_KEY` | yes | Claude API key — server only, never NEXT_PUBLIC_ | `sk-ant-...` |
| `UPSTASH_REDIS_REST_URL` | yes | Upstash Redis REST endpoint | `https://...upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | yes | Upstash Redis REST token | `AX...` |
| `STRIPE_SECRET_KEY` | yes | Stripe secret key | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | yes | Stripe webhook signing secret | `whsec_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | yes | Stripe publishable key | `pk_live_...` |
| `STRIPE_PRO_PRICE_ID` | yes | Stripe Price ID for Pro plan | `price_...` |
| `FREE_TIER_GENERATION_LIMIT` | optional | Monthly generation cap for free users | `5` |

---

## Timeline / Phases

### Phase 1 — Foundation
Status: `[ ]` pending

- [ ] Next.js 16 project init (TypeScript, Tailwind 4, App Router)
- [ ] Better Auth setup (email/password, session 7-day expiry)
- [ ] Drizzle schema: users, sessions, accounts, subscriptions, generations
- [ ] Neon connection (pooled + unpooled)
- [ ] Upstash Redis client setup
- [ ] Stripe client setup
- [ ] `.env.example` committed
- [ ] Middleware: protect `/dashboard` and `/generate` routes

### Phase 2 — Generation Engine
Status: `[ ]` pending

- [ ] Feature selector form UI (`/generate`)
- [ ] Architecture + UI layer selector
- [ ] Prompt builder: converts user selections to structured Claude prompt
- [ ] Server Action: Claude API call (claude-sonnet-4, Node runtime)
- [ ] Kotlin project file tree generation (build.gradle.kts, AndroidManifest.xml, MainActivity, etc.)
- [ ] JSZip packaging: assemble all files into downloadable .zip
- [ ] Code preview component: file tree + sample file viewer
- [ ] Generation count check (Upstash Redis) before each generation
- [ ] Generation count increment after successful generation
- [ ] Generation record saved to Neon

### Phase 3 — Monetization
Status: `[ ]` pending

- [ ] Stripe Checkout session creation (Server Action)
- [ ] Stripe webhook handler (POST `/api/webhooks/stripe`, Node runtime)
- [ ] Subscription record written to Neon on `checkout.session.completed`
- [ ] Free tier limit enforcement: gate generation on Redis count + plan check
- [ ] Upgrade prompt modal (shown on limit hit)
- [ ] Pro features: Room DB full setup, CI/CD GitHub Actions config, multi-module Gradle structure
- [ ] Billing portal link (Stripe Customer Portal)

### Phase 4 — Marketing & Launch
Status: `[ ]` pending

- [ ] Landing page: hero, feature demo, pricing table
- [ ] Pricing page
- [ ] Dashboard: generation history, current plan badge, usage meter
- [ ] OG images via `@vercel/og`
- [ ] Mobile responsiveness audit
- [ ] Accessibility pass (WCAG 2.2 AA keyboard nav, focus indicators)
- [ ] Production deploy: Vercel + Cloudflare Pages
- [ ] Smoke test: generate a project, download, open in Android Studio, verify it compiles

---

## Next Steps

In order:
1. Initialize Next.js 16 project with TypeScript + Tailwind 4
2. Install and configure Better Auth with email/password
3. Write Drizzle schema (users, subscriptions, generations) and run first migration
4. Set up Upstash Redis client and generation counter logic
5. Build feature selector form UI at `/generate`

---

## Notes & Decisions

**2026-06-06.** Project validated by Council — CONDITIONAL GO. Top 5 pre-build requirements: (1) server-side only Claude API via Server Actions, (2) sanitize all user inputs before generation prompts, (3) code preview before download, (4) sensible defaults on feature selector, (5) generation count tied to authenticated user ID via Upstash + Better Auth.

**2026-06-06.** JSZip packaging confirmed server-side in a Server Action (not Route Handler) because Edge Runtime cannot execute JSZip's Node.js dependencies. Ensure no `export const runtime = 'edge'` in the generation action file or any of its parent route segments.

**2026-06-06.** Free tier monthly reset tracked in Neon (reset date column on subscriptions or generations table), NOT in Upstash Redis TTL — Redis is the fast counter, Neon is the source of truth for billing periods.
