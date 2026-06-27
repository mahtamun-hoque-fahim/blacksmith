'use client'

// ─────────────────────────────────────────────────────────
//  components/generator/ArchSelector.tsx
//  Single-select radio tiles for architecture pattern.
// ─────────────────────────────────────────────────────────

import type { Architecture } from '@/lib/generation/prompt'

type ArchOption = {
  value:       Architecture
  label:       string
  description: string
  badge:       string | null
}

const OPTIONS: ArchOption[] = [
  {
    value:       'mvvm',
    label:       'MVVM',
    description: 'ViewModel + Repository — clean two-layer separation, fast to prototype, great for most apps.',
    badge:       'Recommended',
  },
  {
    value:       'clean',
    label:       'Clean Architecture',
    description: 'Presentation / Domain / Data layers with strict dependency rule — best for larger teams and codebases.',
    badge:       null,
  },
]

type Props = {
  value:    Architecture
  onChange: (v: Architecture) => void
}

export function ArchSelector({ value, onChange }: Props) {
  return (
    <div>
      <span className="text-xs font-semibold text-text-muted uppercase tracking-widest block mb-3">
        Architecture
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
