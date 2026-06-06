# Droidsmith — Design Guide

Implementation spec for the design system. No rationale. No marketing copy. Just tokens, patterns, and constraints.

---

## Color Tokens

CSS variables in `app/globals.css`:

```css
:root {
  /* Surfaces */
  --color-bg:               #0a0a0a;
  --color-surface:          #111827;
  --color-surface-elevated: #1a2235;
  --color-border:           #1f2937;
  --color-border-subtle:    #111827;

  /* Text */
  --color-text:             #f5f5f5;
  --color-text-muted:       #9ca3af;
  --color-text-faint:       #4b5563;

  /* Brand */
  --color-accent:           #00e676;
  --color-accent-hover:     #00c964;
  --color-accent-faint:     #00e6761a;  /* 10% opacity */

  /* Semantic */
  --color-success:          #22c55e;
  --color-warning:          #f59e0b;
  --color-danger:           #ef4444;
  --color-info:             #3b82f6;

  /* Code preview */
  --color-code-bg:          #0d1117;
  --color-code-border:      #21262d;
  --color-code-text:        #c9d1d9;
  --color-code-comment:     #6e7681;
  --color-code-keyword:     #ff7b72;
  --color-code-string:      #a5d6ff;
}
```

Extend in `tailwind.config.ts`:
```ts
theme: {
  extend: {
    colors: {
      bg:               'var(--color-bg)',
      surface:          'var(--color-surface)',
      'surface-elevated': 'var(--color-surface-elevated)',
      border:           'var(--color-border)',
      accent:           'var(--color-accent)',
      'accent-hover':   'var(--color-accent-hover)',
      'accent-faint':   'var(--color-accent-faint)',
      'text-muted':     'var(--color-text-muted)',
      'text-faint':     'var(--color-text-faint)',
    }
  }
}
```

---

## Typography

**Families** (loaded via `next/font` in `app/layout.tsx`):
- Display: **Syne** (`--font-syne`) — h1, h2, hero text, section headers
- Body: **Onest** (`--font-onest`) — all other text, labels, descriptions
- Mono: **JetBrains Mono** (`--font-mono`) — code blocks, file paths, IDs, generation output

**Weights used:**
- Body: 400 (regular), 500 (medium / label emphasis), 600 (buttons, strong)
- Display: 600 (semibold), 700 (bold hero)
- Mono: 400, 500

**Size scale:**

| Token | Size | Use |
|---|---|---|
| `text-xs` | 0.75rem | Badges, captions, timestamps |
| `text-sm` | 0.875rem | Labels, secondary UI, form helpers |
| `text-base` | 1rem | Body default |
| `text-lg` | 1.125rem | Lead text, card titles |
| `text-xl` | 1.25rem | h4, section sub-headers |
| `text-2xl` | 1.5rem | h3 |
| `text-3xl` | 1.875rem | h2 |
| `text-4xl` | 2.25rem | h1 (page level) |
| `text-5xl` | 3rem | Hero headline |

**Line height:** 1.6 body, 1.2 display, 1.5 mono.

---

## Spacing Scale

Tailwind defaults. Common values in use:

| Token | px | Common use |
|---|---|---|
| `p-2` | 8px | Tight padding (badges, chips) |
| `p-3` | 12px | Compact components |
| `p-4` | 16px | Default component padding |
| `p-6` | 24px | Cards, panels |
| `p-8` | 32px | Page section padding |
| `gap-2` | 8px | Inline element gap |
| `gap-4` | 16px | Default flex/grid gap |
| `gap-6` | 24px | Section-level gap |

---

## Border Radius

| Token | Value | Use |
|---|---|---|
| `rounded-sm` | 4px | Badges, small chips |
| `rounded-md` | 6px | Buttons (default) |
| `rounded-lg` | 8px | Cards, inputs |
| `rounded-xl` | 12px | Modals, large panels |
| `rounded-2xl` | 16px | Feature selector tiles |
| `rounded-full` | 9999px | Pill badges, avatars |

---

## Shadows

```css
--shadow-sm:   0 1px 2px rgb(0 0 0 / 0.5);
--shadow-md:   0 4px 12px rgb(0 0 0 / 0.6);
--shadow-lg:   0 12px 32px rgb(0 0 0 / 0.7);
--shadow-glow: 0 0 20px var(--color-accent-faint);
```

Use sparingly. Depth on dark surfaces comes from surface lightness elevation, not shadow.

---

## Components

### Button — primary
```tsx
<button className="bg-accent text-bg px-4 py-2 rounded-md text-sm font-semibold hover:bg-accent-hover transition-colors duration-150">
  Generate Project
</button>
```

### Button — secondary
```tsx
<button className="bg-surface text-text px-4 py-2 rounded-md text-sm border border-border hover:bg-surface-elevated transition-colors duration-150">
  Cancel
</button>
```

### Button — ghost
```tsx
<button className="text-text-muted hover:text-text px-3 py-2 rounded-md text-sm transition-colors duration-150">
  Skip
</button>
```

### Button — danger
```tsx
<button className="bg-danger/10 text-danger border border-danger/30 px-4 py-2 rounded-md text-sm font-semibold hover:bg-danger/20 transition-colors duration-150">
  Delete
</button>
```

### Input
```tsx
<input className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text placeholder-text-faint focus:border-accent focus:outline-none transition-colors duration-150" />
```

### Card
```tsx
<div className="bg-surface border border-border rounded-lg p-6">
  {/* content */}
</div>
```

### Feature Selector Tile (unselected)
```tsx
<button className="bg-surface border border-border rounded-2xl p-4 text-left hover:border-accent/50 transition-colors duration-150">
  <span className="text-sm font-medium text-text">{feature.label}</span>
  <p className="text-xs text-text-muted mt-1">{feature.description}</p>
</button>
```

### Feature Selector Tile (selected)
```tsx
<button className="bg-accent-faint border border-accent rounded-2xl p-4 text-left">
  <span className="text-sm font-medium text-accent">{feature.label}</span>
  <p className="text-xs text-text-muted mt-1">{feature.description}</p>
</button>
```

### Badge — plan
```tsx
<span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-semibold bg-accent-faint text-accent uppercase tracking-wide">
  PRO
</span>
```

### Code Preview Panel
```tsx
<div className="bg-[var(--color-code-bg)] border border-[var(--color-code-border)] rounded-lg overflow-hidden font-mono text-sm">
  {/* File tree pane + code viewer pane side by side */}
</div>
```

### Usage Meter (free tier)
```tsx
<div className="flex items-center gap-3">
  <div className="flex-1 h-1.5 bg-surface rounded-full overflow-hidden">
    <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${(used/limit)*100}%` }} />
  </div>
  <span className="text-xs text-text-muted">{used}/{limit}</span>
</div>
```

---

## Animation Defaults

- Hover/focus transitions: `transition-colors duration-150 ease-out`
- Modal/panel enter: `transition-all duration-200 ease-out`
- Page reveal: `transition-opacity duration-300 ease-out`
- Generation loading pulse: `animate-pulse` on skeleton elements
- Maximum UI animation: 300ms. Longer feels sluggish.

Always wrap motion in `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Focus Indicators

Always visible. Never `outline: none` without a replacement.

```css
*:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

---

## Dark Mode Notes

Droidsmith is dark-first. No light mode.

- Never pure `#000000` — use `#0a0a0a`
- Never pure `#ffffff` for text — use `#f5f5f5`
- Depth = surface elevation (bg → surface → surface-elevated), not shadows
- Code preview uses its own darker surface (`--color-code-bg: #0d1117`) to visually separate generated output from UI chrome

---

## Icon System

lucide-react only. No emojis anywhere in the UI.

Common icons in use:
- `<Code2 />` — generation, code output
- `<Download />` — zip download
- `<Zap />` — fast generation, pro plan
- `<CheckCircle2 />` — feature selected, success
- `<FolderTree />` — file tree preview
- `<Layers />` — architecture selector
- `<Smartphone />` — Android / mobile context
- `<Sparkles />` — AI generation indicator
- `<CreditCard />` — billing, upgrade

Size defaults: `size={16}` inline, `size={20}` standalone icon buttons, `size={24}` hero/section icons.
