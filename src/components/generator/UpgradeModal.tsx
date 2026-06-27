'use client'

// ─────────────────────────────────────────────────────────
//  components/generator/UpgradeModal.tsx
//  Shown when generateProject returns { limitReached: true }
//  or when the user clicks "Upgrade to Pro" in the limit banner.
//  Calls createCheckoutUrl Server Action → redirects to LS checkout.
// ─────────────────────────────────────────────────────────

import { useState, useTransition } from 'react'
import { Check, Loader2, Zap } from 'lucide-react'

import { Modal }             from '@/components/ui/Modal'
import { createCheckoutUrl } from '@/lib/lemonsqueezy/actions'

const PRO_PERKS = [
  'Unlimited generations — no monthly cap',
  'Room Database (Full) with migrations + TypeConverters',
  'GitHub Actions CI/CD workflow',
  'Multi-Module Gradle architecture',
]

type Props = {
  isOpen:  boolean
  onClose: () => void
  /** How many generations the user has consumed this month */
  count:   number
  /** The free tier monthly limit */
  limit:   number
}

export function UpgradeModal({ isOpen, onClose, count, limit }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError]            = useState<string | null>(null)

  function handleUpgrade() {
    setError(null)
    startTransition(async () => {
      const result = await createCheckoutUrl()
      if ('error' in result) {
        setError(result.error)
        return
      }
      // Hard redirect — LemonSqueezy Checkout is an external page
      window.location.href = result.url
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {/* Icon + heading */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-accent-faint border border-accent/30 mb-4">
          <Zap size={22} className="text-accent" aria-hidden />
        </div>
        <h2 className="font-syne text-xl font-bold text-text">Upgrade to Pro</h2>
        <p className="text-sm text-text-muted mt-1.5">
          You've used {count} of {limit} free generations this month.
        </p>
      </div>

      {/* Feature list */}
      <ul className="space-y-2.5 mb-6" aria-label="Pro features">
        {PRO_PERKS.map(perk => (
          <li key={perk} className="flex items-start gap-2.5">
            <Check size={14} className="text-accent mt-0.5 shrink-0" aria-hidden />
            <span className="text-sm text-text">{perk}</span>
          </li>
        ))}
      </ul>

      {/* Error */}
      {error && (
        <p role="alert" className="text-xs text-warning text-center mb-4">
          {error}
        </p>
      )}

      {/* CTAs */}
      <div className="flex flex-col gap-2.5">
        <button
          type="button"
          onClick={handleUpgrade}
          disabled={isPending}
          className="flex items-center justify-center gap-2 w-full bg-accent text-bg py-2.5 rounded-xl text-sm font-semibold hover:bg-accent-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 size={15} className="animate-spin" aria-hidden />
              Redirecting…
            </>
          ) : (
            <>
              <Zap size={15} aria-hidden />
              Upgrade to Pro
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="text-xs text-text-faint hover:text-text-muted transition-colors py-1 text-center"
        >
          Maybe later
        </button>
      </div>
    </Modal>
  )
}
