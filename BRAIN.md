# BRAIN.md — Droidsmith

> This file is maintained by Singularity. It is the identity document of this project.
> When Claude drifts, hallucinates, or loses context — this file is the source of truth.
> Do not confuse this with PLANNER.md (tasks/phases) or DESIGN_GUIDE.md (design tokens).

---

## The One-Line Truth

Droidsmith is a web SaaS that generates production-ready Android Studio Kotlin projects from a feature selection form — no boilerplate, no setup, just download and build.

---

## Why It Exists

Android development has a setup tax. Every new project starts with the same Gradle config, dependency wiring, architecture scaffolding, and folder structure — hours burned before a single line of business logic is written. No tool today generates real, production-quality Kotlin code for real developers from a web interface. AppGyver, Kodular, and Thunkable produce no-code output that real developers won't touch. Droidsmith fills that gap.

---

## What It Must Become

The `create-next-app` equivalent for Android — the thing a developer opens before starting any new Android project. Not a visual builder, not a no-code tool, not an IDE. A scaffolding engine that respects the developer, generates code they would have written themselves, and gets out of the way. Done feels like: a developer lands, picks features in under 60 seconds, downloads a zip, opens it in Android Studio, and it compiles and runs on the first try.

---

## Core Decisions (Locked)

- [LOCKED] Claude API as generation engine — server-side only via Server Actions, never client-exposed
- [LOCKED] JSZip for server-side project packaging — zip delivered as direct download, no cloud storage of generated files
- [LOCKED] Better Auth — standard Fahim auth choice for new projects
- [LOCKED] Upstash Redis for generation count limiting — tied to authenticated user ID, not IP, not session
- [LOCKED] Stripe for payments — freemium gating enforced via webhook-confirmed subscription status in Neon
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
Status: Alpha (pre-build, planning phase complete)
Last updated: 2026-06-06

What works:
- Project concept validated by Council (CONDITIONAL GO)
- Stack locked
- Monetization model locked (freemium, calendar-month generation limits)
- Council top 5 pre-build requirements identified
- Repo scaffold initiated

What's broken or incomplete:
- No Next.js app created yet
- No code written

What's next (in spirit, not tasks):
- Initialize Next.js 16 project
- Build the generation engine (Claude API → Kotlin project files)
- Ship MVP: form → zip → download, compiles on first try
```

---

## The Stack (Frozen)

| Layer | Choice |
|---|---|
| Framework | Next.js 16 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Database | Neon (PostgreSQL) + Drizzle ORM |
| Auth | Better Auth |
| Deployment | Vercel (primary) + Cloudflare Pages (secondary) |
| AI Generation | Claude API (claude-sonnet-4) — Server Actions only |
| Project Packaging | JSZip (server-side, Node runtime) |
| Rate Limiting | Upstash Redis |
| Payments | Stripe |

---

## Constraints & Non-Negotiables

- Must deploy to both Vercel and Cloudflare Pages — Edge Runtime compatible throughout
- No emojis in UI — lucide-react icons only
- Dark-first, no light mode
- No Supabase
- Claude API calls must be server-side only — never in client components, never CORS-exposed
- All user inputs sanitized before touching generation prompts — prompt injection is CRITICAL risk
- Generated zips validated for path traversal before delivery to user
- Generated projects must compile and run on first try — broken scaffolds are a trust killer
- Output is always Kotlin + Kotlin DSL Gradle — never Java, never Groovy DSL

---

## Context Hooks (for Claude)

- Generation lives in a Server Action — NOT a Route Handler (Edge Runtime cannot run JSZip's Node.js dependencies)
- Upstash Redis tracks generation count keyed to authenticated user ID — resets on the 1st of each calendar month, tracked in Neon not Redis
- Stripe subscription status is confirmed via webhook and stored in Neon subscriptions table — never gate by price ID alone, webhook is source of truth
- The freemium generation counter and the Stripe subscription status are two separate systems — both must be checked at generation time
- JSZip runs on Node.js runtime — ensure the Server Action file does NOT sit in a route segment marked `export const runtime = 'edge'`
- Generated projects are Kotlin + Gradle (Kotlin DSL) + XML layouts or Jetpack Compose — user chooses at generation time
- Code preview (file tree + sample file) must render before the download button appears — this is a trust gate, not optional UX

---

*Last updated by Singularity on 2026-06-06*
