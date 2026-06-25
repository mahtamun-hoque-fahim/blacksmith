'use client'

// ─────────────────────────────────────────────────────────
//  components/generator/FeatureSelector.tsx
//  Multi-select feature tile grid for the generation form.
//  Free tier tiles are always interactive.
//  Pro tier tiles are locked and dimmed when isPro is false.
// ─────────────────────────────────────────────────────────

import type { LucideIcon } from 'lucide-react'
import {
  Bell,
  Check,
  Database,
  Flame,
  GitBranch,
  Globe,
  Layers,
  Lock,
  Package,
  Server,
} from 'lucide-react'

import {
  FEATURE_CATALOG,
  FREE_FEATURES,
  PRO_FEATURES,
  type Feature,
} from '@/lib/generation/prompt'

// ── Icon map ───────────────────────────────────────────────
// Keyed by feature ID from FEATURE_CATALOG.

const ICON_MAP: Record<string, LucideIcon> = {
  retrofit:     Globe,
  room:         Database,
  notifications: Bell,
  firebase:     Flame,
  hilt:         Package,
  room_full:    Server,
  cicd:         GitBranch,
  multi_module: Layers,
}

// ── Public component ───────────────────────────────────────

type FeatureSelectorProps = {
  /** Currently selected feature IDs */
  value: string[]
  /** Called when the selection changes */
  onChange: (features: string[]) => void
  /** Whether the current user has an active Pro subscription */
  isPro: boolean
}

export function FeatureSelector({ value, onChange, isPro }: FeatureSelectorProps) {
  function toggle(feature: Feature) {
    // Pro features are non-interactive for free users
    if (!isPro && feature.tier === 'pro') return

    if (value.includes(feature.id)) {
      onChange(value.filter(id => id !== feature.id))
    } else {
      onChange([...value, feature.id])
    }
  }

  return (
    <div className="space-y-8">
      {/* Free features */}
      <FeatureGroup
        label="Features"
        features={FREE_FEATURES}
        selected={value}
        isPro={isPro}
        onToggle={toggle}
      />

      {/* Pro features */}
      <FeatureGroup
        label="Pro Features"
        features={PRO_FEATURES}
        selected={value}
        isPro={isPro}
        onToggle={toggle}
        isProGroup
      />

      {!isPro && (
        <p className="text-xs text-text-faint leading-relaxed">
          Upgrade to Blacksmith Pro to unlock pro features.
        </p>
      )}
    </div>
  )
}

// ── Group ──────────────────────────────────────────────────

type FeatureGroupProps = {
  label: string
  features: Feature[]
  selected: string[]
  isPro: boolean
  onToggle: (feature: Feature) => void
  isProGroup?: boolean
}

function FeatureGroup({
  label,
  features,
  selected,
  isPro,
  onToggle,
  isProGroup = false,
}: FeatureGroupProps) {
  return (
    <section aria-label={label}>
      {/* Section header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold text-text-muted uppercase tracking-widest">
          {label}
        </span>
        {isProGroup && !isPro && (
          <span
            aria-label="Pro plan required"
            className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-bold bg-accent-faint text-accent uppercase tracking-wider"
          >
            Pro
          </span>
        )}
      </div>

      {/* Tile grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {features.map(feature => {
          const isSelected = selected.includes(feature.id)
          const isDisabled = isProGroup && !isPro

          return (
            <FeatureTile
              key={feature.id}
              feature={feature}
              selected={isSelected}
              disabled={isDisabled}
              onToggle={onToggle}
            />
          )
        })}
      </div>
    </section>
  )
}

// ── Tile ───────────────────────────────────────────────────

type FeatureTileProps = {
  feature: Feature
  selected: boolean
  disabled: boolean
  onToggle: (feature: Feature) => void
}

function FeatureTile({ feature, selected, disabled, onToggle }: FeatureTileProps) {
  const Icon = ICON_MAP[feature.id] ?? Package
  const isActive = selected && !disabled

  return (
    <button
      type="button"
      onClick={() => onToggle(feature)}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={[
        selected ? 'Deselect' : 'Select',
        feature.label,
        disabled ? '(Pro required)' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      className={[
        // Base
        'relative w-full rounded-2xl p-4 text-left transition-colors duration-150',
        // State-dependent
        disabled
          ? 'bg-surface border border-border opacity-40 cursor-not-allowed'
          : selected
          ? 'bg-accent-faint border border-accent cursor-pointer'
          : 'bg-surface border border-border hover:border-accent/50 cursor-pointer',
      ]
        .join(' ')}
    >
      {/* Icon row */}
      <div className="flex items-start justify-between mb-2.5">
        <Icon
          size={16}
          className={isActive ? 'text-accent' : 'text-text-muted'}
          aria-hidden="true"
        />

        {/* State indicator — top-right corner */}
        {disabled ? (
          <Lock size={12} className="text-text-faint" aria-hidden="true" />
        ) : selected ? (
          <Check size={12} className="text-accent" aria-hidden="true" />
        ) : null}
      </div>

      {/* Label */}
      <span
        className={[
          'block text-sm font-medium leading-snug',
          isActive ? 'text-accent' : 'text-text',
        ].join(' ')}
      >
        {feature.label}
      </span>

      {/* Description */}
      <p className="mt-1 text-xs text-text-muted leading-relaxed">
        {feature.description}
      </p>
    </button>
  )
}
