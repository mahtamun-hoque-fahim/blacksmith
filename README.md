# Blacksmith

![Version](https://img.shields.io/github/v/release/mahtamun-hoque-fahim/blacksmith?style=flat-square&color=3DF49A)
![License](https://img.shields.io/github/license/mahtamun-hoque-fahim/blacksmith?style=flat-square)
![Stars](https://img.shields.io/github/stars/mahtamun-hoque-fahim/blacksmith?style=flat-square)

Generate production-ready Android Studio Kotlin projects in seconds — pick features, Gemini builds it, download and build.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS 4
- Neon (PostgreSQL) + Drizzle ORM
- Better Auth (email/password)
- Claude API — server-side generation engine
- JSZip — server-side project packaging
- Upstash Redis — generation rate limiting
- Stripe — payments and subscription management
- Vercel (production), Cloudflare Pages (mirror)

## Prerequisites

- Node 20+
- A Neon project (two connection strings: pooled + unpooled)
- Anthropic API key
- Upstash Redis database
- Stripe account (with a Pro plan Price ID and webhook configured)
- Vercel account

## Local Setup

1. Clone: `git clone https://github.com/mahtamun-hoque-fahim/droidsmith.git`
2. Install: `npm install`
3. Copy env: `cp .env.example .env.local` and fill in all values (see PLANNER.md → Env Vars)
4. Apply migrations: `npx drizzle-kit migrate`
5. Run dev: `npm run dev`

## Env Vars

See **PLANNER.md → Env Vars** for full descriptions. Names:

```
DATABASE_URL
DATABASE_URL_UNPOOLED
BETTER_AUTH_SECRET
BETTER_AUTH_URL
NEXT_PUBLIC_APP_URL
ANTHROPIC_API_KEY
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_PRO_PRICE_ID
FREE_TIER_GENERATION_LIMIT
```

## Scripts

```bash
npm run dev                   # local dev (Turbopack)
npm run build                 # production build
npm run start                 # serve production build locally
npm run lint                  # ESLint
npx drizzle-kit generate      # generate migration from schema changes
npx drizzle-kit migrate       # apply migrations to Neon
npx drizzle-kit push          # push schema directly (dev only)
npx drizzle-kit studio        # Drizzle Studio GUI
```

## Stripe Webhook (local)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Deploy

- Push to `main` → Vercel auto-deploys to production
- PRs → Vercel preview deploys
- Cloudflare Pages mirrors `main` automatically

Verify env vars are set in **both** Vercel and Cloudflare dashboards before promoting any deploy.

## Folder Structure

```
app/
  (auth)/           sign-in, sign-up
  (dashboard)/      protected routes: dashboard, generate
  (marketing)/      landing, pricing
  api/webhooks/     Stripe webhook (Node runtime)
components/
  ui/               primitives
  generator/        FeatureSelector, CodePreview
  layout/           Navbar, Footer
lib/
  auth/             Better Auth config
  db/               Drizzle client + schema
  generation/       Claude prompt builder + JSZip packager
  redis/            Upstash client + generation counter
  stripe/           Stripe client + actions
drizzle/            migrations
```

For full architecture, user flows, DB schema, and API routes see **PLANNER.md**.
For design tokens and component patterns see **DESIGN_GUIDE.md**.
