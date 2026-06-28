# BRAIN.md — Blacksmith

> This file is maintained by Singularity. It is the identity document of this project.
> When Claude drifts, hallucinates, or loses context — this file is the source of truth.
> Do not confuse this with PLANNER.md (tasks/phases) or DESIGN_GUIDE.md (design tokens).

---

## The One-Line Truth

Blacksmith is a web SaaS that generates production-ready Android Studio Kotlin projects from a feature selection form — no boilerplate, no setup, just download and build.

---

## Why It Exists

Android development has a setup tax. Every new project starts with the same Gradle config, dependency wiring, architecture scaffolding, and folder structure — hours burned before a single line of business logic is written. No tool today generates real, production-quality Kotlin code for real developers from a web interface. AppGyver, Kodular, and Thunkable produce no-code output that real developers won't touch. Blacksmith fills that gap.

---

## What It Must Become

The `create-next-app` equivalent for Android — the thing a developer opens before starting any new Android project. Not a visual builder, not a no-code tool, not an IDE. A scaffolding engine that respects the developer, generates code they would have written themselves, and gets out of the way. Done feels like: a developer lands, picks features in under 60 seconds, downloads a zip, opens it in Android Studio, and it compiles and runs on the first try.

---

## Core Decisions (Locked)

- [LOCKED] Gemini 2.0 Flash as generation engine — server-side only via Server Actions, never client-exposed
- [LOCKED] JSZip for server-side project packaging — zip delivered as direct download, no cloud storage of generated files
- [LOCKED] Better Auth — standard Fahim auth choice for new projects
- [LOCKED] Upstash Redis for generation count limiting — tied to authenticated user ID, not IP, not session
- [LOCKED] LemonSqueezy for payments — MoR handles global VAT/tax, simple webhook, no tax compliance overhead
- [LOCKED] Freemium model — limited generations per calendar month free, unlimited on paid plan
- [LOCKED] Next.js 16 App Router + TypeScript + Tailwind CSS 4 — Fahim's standard stack
- [LOCKED] Neon (PostgreSQL) + Drizzle ORM — Fahim's standard database choice
- [LOCKED] Vercel (primary) + Cloudflare Pages (secondary) — Fahim's standard dual deploy

---

## What It Must Never Become

- Never a no-code platform — output is always real, readable, production-quality Kotlin
- Never a tool that locks or hides generated code — the user owns the output completely
- Never an IDE or Android Studio replacement — it scaffolds, then steps aside
- Never so feature-heavy that the core action (select → generate → download) gets buried under options
- Never a drag-and-drop visual builder — that is the enemy product category
- Never inject proprietary runtimes, SDKs, or locked dependencies into the generated project

---

## Current State

```
Status: Alpha — MVP shipped (all 4 phases complete)
Last updated: 2026-06-27

What works:
- Phase 1 complete: Next.js 16, Better Auth, Drizzle schema (6 tables), Upstash Redis
  generation counter, Gemini 2.0 Flash client, LemonSqueezy webhook handler (HMAC-SHA256),
  proxy.ts, dashboard page (plan/usage/history), generate page
- Phase 2 complete: FEATURE_CATALOG, sanitizeInput, buildGenerationPrompt, packager.ts,
  generateProject Server Action, FeatureSelector, ArchSelector, UILayerSelector,
  CodePreview (file tree + viewer), GenerateForm (full client orchestrator)
- Phase 3 complete: createCheckoutUrl, getPortalUrl, UpgradeModal, UpgradedBanner,
  billing portal link, /dashboard?upgraded=true flow
- Phase 4 complete: landing page, pricing page, OG image, metadata, Navbar, Footer
- gh-meta run: v0.1.0 released, About + topics set, LICENSE (All Rights Reserved),
  CHANGELOG.md, README badges
- Post-build: waterborne CLEAN, motion-hive done, valley-of-death done

What's broken or incomplete:
- Env vars not filled (project not yet deployed)
- Build not smoke-tested in CI (no node_modules in dev container)

What's next (in spirit, not tasks):
- Fill env vars → npx drizzle-kit push → Vercel deploy → smoke test
```

---

## The Stack (Frozen)

| Layer | Choice |
|---|---|
| Framework | Next.js 16 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Database | Neon (PostgreSQL) + Drizzle ORM |
| Auth | Better Auth (email/password) |
| Deployment | Vercel (primary) + Cloudflare Pages (secondary) |
| AI Generation | Gemini 2.0 Flash — Server Actions only, Node runtime |
| Project Packaging | JSZip (server-side, Node runtime) |
| Rate Limiting | Upstash Redis |
| Payments | LemonSqueezy |

---

## Constraints & Non-Negotiables

- Must deploy to both Vercel and Cloudflare Pages — Edge Runtime compatible throughout
- No emojis in UI — lucide-react icons only
- Dark-first, no light mode
- No Supabase
- Gemini API calls must be server-side only — never in client components, never NEXT_PUBLIC_ prefixed
- All user inputs sanitized before touching generation prompts — prompt injection is CRITICAL risk
- Generated zips validated for path traversal before delivery to user
- Generated projects must compile and run on first try — broken scaffolds are a trust killer
- Output is always Kotlin + Kotlin DSL Gradle — never Java, never Groovy DSL

---

## Context Hooks (for Claude)

- Generation lives in a Server Action — NOT a Route Handler (Edge Runtime cannot run JSZip Node.js deps)
- Upstash Redis tracks generation count keyed to authenticated user ID — monthly key format: `gen_count:{userId}:{YYYY-MM}`
- LemonSqueezy subscription status confirmed via webhook (X-Signature HMAC-SHA256) and stored in Neon — webhook is source of truth, never check plan from client
- The freemium generation counter (Upstash) and subscription status (Neon) are two separate systems — both checked at generation time
- JSZip runs on Node.js runtime — ensure no `export const runtime = 'edge'` in generation action file
- Generated projects are Kotlin + Gradle Kotlin DSL + XML layouts or Jetpack Compose — user chooses at generation time
- Code preview (file tree + sample file) must render before the download button appears — trust gate, not optional
- Gemini API key env var is `GOOGLE_GENERATIVE_AI_API_KEY` — NOT `ANTHROPIC_API_KEY` (pre-pivot name; stack uses Gemini, not Claude)
- Feature catalog (FEATURE_CATALOG, free and pro features, sanitizeInput) lives in `src/lib/generation/prompt.ts` — FeatureSelector and generateProject Server Action both import from there

---

*Last updated by Singularity on 2026-06-25*
