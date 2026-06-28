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
- Gemini 2.0 Flash — server-side generation engine
- JSZip — server-side project packaging
- Upstash Redis — generation rate limiting
- LemonSqueezy — payments and subscription management
- Vercel (production), Cloudflare Pages (mirror)

## Prerequisites

- Node 20+
- A Neon project (two connection strings: pooled + unpooled)
- Google AI (Gemini) API key — from https://aistudio.google.com
- Upstash Redis database
- LemonSqueezy account (store ID, Pro plan variant ID, webhook secret)
- Vercel account

## Local Setup

1. Clone: `git clone https://github.com/mahtamun-hoque-fahim/blacksmith.git`
2. Install: `npm install`
3. Copy env: `cp .env.example .env.local` and fill in all values (see PLANNER.md → Env Vars)
4. Push schema: `npx drizzle-kit push`
5. Run dev: `npm run dev`

## Env Vars

See **PLANNER.md → Env Vars** for full descriptions. Names:

```
DATABASE_URL
DATABASE_URL_UNPOOLED
BETTER_AUTH_SECRET
BETTER_AUTH_URL
NEXT_PUBLIC_APP_URL
GOOGLE_GENERATIVE_AI_API_KEY
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
LEMONSQUEEZY_API_KEY
LEMONSQUEEZY_WEBHOOK_SECRET
LEMONSQUEEZY_STORE_ID
LEMONSQUEEZY_PRO_VARIANT_ID
FREE_TIER_GENERATION_LIMIT
```

## Scripts

```bash
npm run dev                   # local dev (Turbopack)
npm run build                 # production build
npm run start                 # serve production build locally
npm run lint                  # ESLint
npx drizzle-kit generate      # generate migration from schema changes
npx drizzle-kit push          # push schema directly (dev only)
npx drizzle-kit studio        # Drizzle Studio GUI
```

## LemonSqueezy Webhook (local)

LemonSqueezy does not provide a CLI forwarder. Use [smee.io](https://smee.io) or [ngrok](https://ngrok.com) to forward webhooks to your local server:

```bash
# smee.io (no account needed)
npx smee-client --url https://smee.io/<your-channel> --target http://localhost:3000/api/webhooks/lemonsqueezy

# or ngrok
ngrok http 3000
# then set your LemonSqueezy webhook URL to https://<ngrok-id>.ngrok.io/api/webhooks/lemonsqueezy
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
  api/
    auth/           Better Auth handler
    webhooks/
      lemonsqueezy/ LemonSqueezy webhook (Node runtime)
components/
  ui/               primitives (Modal)
  generator/        FeatureSelector, ArchSelector, UILayerSelector,
                    CodePreview, GenerateForm, UpgradeModal
  dashboard/        UpgradedBanner
  marketing/        Navbar, Footer
lib/
  auth/             Better Auth config + session helpers
  db/               Drizzle client + schema (6 tables)
  generation/       Gemini 2.0 Flash prompt builder, JSZip packager,
                    generateProject Server Action
  gemini/           Gemini 2.0 Flash lazy client
  redis/            Upstash client + generation counter
  lemonsqueezy/     LemonSqueezy client, webhook helpers, actions
  env.ts            Typed env validation
drizzle/            migrations
scripts/
  scan_emojis.py    Waterborne emoji scanner
```

For full architecture, user flows, DB schema, and API routes see **PLANNER.md**.
For design tokens and component patterns see **DESIGN_GUIDE.md**.
