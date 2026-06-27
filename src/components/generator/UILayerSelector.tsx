'use client'

// ─────────────────────────────────────────────────────────
//  components/generator/UILayerSelector.tsx
//  Single-select radio tiles for Android UI layer choice.
// ─────────────────────────────────────────────────────────

import type { UILayer } from '@/lib/generation/prompt'

type UIOption = {
  value:       UILayer
  label:       string
  description: string
  badge:       string | null
}

const OPTIONS: UIOption[] = [
  {
    value:       'xml',
    label:       'XML Layouts',
    description: 'ViewBinding + traditional Views — battle-tested, stable, extensive documentation and community resources.',
    badge:       'Stable',
  },
  {
    value:       'compose',
    label:       'Jetpack Compose',
    description: 'Declarative UI with Material3 — modern, less boilerplate, recommended for all new Android projects.',
    badge:       'Modern',
  },
]

type Props = {
  value:    UILayer
  onChange: (v: UILayer) => void
}

export function UILayerSelector({ value, onChange }: Props) {
  return (
    <div>
      <span className="text-xs font-semibold text-text-muted uppercase tracking-widest block mb-3">
        UI Layer
      </span>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {OPTIONS.map(opt => {
          const selected = value === opt.value

          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(opt.value)}
              className={[
                'w-full rounded-2xl p-4 text-left transition-colors duration-150',
                selected
                  ? 'bg-accent-faint border border-accent'
                  : 'bg-surface border border-border hover:border-accent/50',
              ].join(' ')}
            >
              {/* Radio indicator row */}
              <div className="flex items-center justify-between mb-2.5">
                <RadioDot selected={selected} />
                {opt.badge && (
                  <span
                    className={[
                      'text-xs font-semibold px-1.5 py-0.5 rounded-sm uppercase tracking-wider',
                      selected
                        ? 'bg-accent text-bg'
                        : 'bg-surface border border-border text-text-muted',
                    ].join(' ')}
                  >
                    {opt.badge}
                  </span>
                )}
              </div>

              <span
                className={[
                  'block text-sm font-medium leading-snug',
                  selected ? 'text-accent' : 'text-text',
                ].join(' ')}
              >
                {opt.label}
              </span>

              <p className="mt-1 text-xs text-text-muted leading-relaxed">
                {opt.description}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Radio dot ──────────────────────────────────────────────

function RadioDot({ selected }: { selected: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={[
        'inline-flex items-center justify-center w-4 h-4 rounded-full border-2 transition-colors duration-150 shrink-0',
        selected
          ? 'border-accent bg-accent'
          : 'border-border bg-transparent',
      ].join(' ')}
    >
      {selected && (
        <span className="w-1.5 h-1.5 rounded-full bg-bg" />
      )}
    </span>
  )
}
