# SITETREE.md — Blacksmith

> Canonical page and route manifest.
> Owned by **tree-man**. Synced by **repo-maintainer** when routes change.
> Consumed by: valley-of-death, sentinel, airborne, task-planner.
> Last updated: 2026-06-27

---

## Page Tree

```
/  (root)
├── /                           Landing page
├── /pricing                    Pricing page
│
├── (auth group — no nav/footer chrome)
│   ├── /sign-in                Email + password sign-in
│   └── /sign-up                Email + password sign-up
│
├── (dashboard group — protected by proxy.ts)
│   ├── /dashboard              User dashboard (plan, usage, history)
│   └── /generate               Generation form + code preview + download
│
└── (API routes)
    ├── /api/auth/[...all]      Better Auth catch-all handler (GET + POST)
    └── /api/webhooks/
        └── /lemonsqueezy       LemonSqueezy subscription webhook (POST only)
```

---

## Route Table

| Path | Type | Auth | Runtime | Purpose | Nav parent |
|---|---|---|---|---|---|
| `/` | Page (Server) | public | Node | Landing page — hero, demo preview, how-it-works, pricing strip | — |
| `/pricing` | Page (Server) | public | Node | Full pricing comparison — Free vs Pro cards, feature table, FAQ | Navbar |
| `/sign-in` | Page (Server) | public (redirect if authed) | Node | Better Auth email/password sign-in form | Navbar |
| `/sign-up` | Page (Server) | public (redirect if authed) | Node | Better Auth email/password sign-up form | Navbar |
| `/dashboard` | Page (Server) | `requireUser()` → /sign-in | Node | Plan badge, Redis usage meter, Neon generation history | In-app |
| `/generate` | Page (Server) | `requireUser()` → /sign-in | Node | GenerateForm: feature selector → Gemini → code preview → download | Dashboard CTA |
| `/api/auth/[...all]` | Route Handler | Better Auth managed | Node | Better Auth session management (sign-in, sign-out, session refresh) | — |
| `/api/webhooks/lemonsqueezy` | Route Handler | HMAC-SHA256 sig | Node | LemonSqueezy subscription events → writes to Neon subscriptions table | — |

---

## Server Actions (not routes — called directly from client components)

| Action | File | Auth | Called from |
|---|---|---|---|
| `generateProject` | `lib/generation/actions.ts` | `requireUser()` | `GenerateForm.tsx` |
| `createCheckoutUrl` | `lib/lemonsqueezy/actions.ts` | `requireUser()` | `UpgradeModal.tsx`, dashboard inline action |
| `getPortalUrl` | `lib/lemonsqueezy/actions.ts` | `requireUser()` | dashboard inline action |

---

## OG Image

| Path | Runtime | Size |
|---|---|---|
| `/opengraph-image` | Edge | 1200 × 630 |
