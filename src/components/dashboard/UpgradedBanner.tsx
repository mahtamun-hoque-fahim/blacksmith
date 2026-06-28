'use client'

// ─────────────────────────────────────────────────────────
//  components/dashboard/UpgradedBanner.tsx
//  Shown on /dashboard?upgraded=true after LemonSqueezy
//  checkout completes. Cleans the query param from the URL
//  on mount and lets the user dismiss the banner.
// ─────────────────────────────────────────────────────────

import { useEffect, useState } from 'react'
import { useRouter }           from 'next/navigation'
import { CheckCircle2, X }     from 'lucide-react'

export function UpgradedBanner() {
  const router          = useRouter()
  const [show, setShow] = useState(true)

  // Strip ?upgraded=true from the URL immediately — we don't
  // want a page refresh to flash the banner again.
  useEffect(() => {
    router.replace('/dashboard')
  }, [router])

  if (!show) return null

  return (
    <div
      role="status"
      className="flex items-start gap-3 bg-accent-faint border border-accent/30 rounded-xl px-4 py-3.5 mb-6 animate-fade-up"
    >
      <CheckCircle2
        size={16}
        className="text-accent mt-0.5 shrink-0"
        aria-hidden
      />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-accent">
          Welcome to Blacksmith Pro!
        </p>
        <p className="text-xs text-text-muted mt-0.5">
          Unlimited generations and all pro features are now unlocked.
        </p>
      </div>

      <button
        type="button"
        onClick={() => setShow(false)}
        aria-label="Dismiss"
        className="text-text-faint hover:text-text-muted transition-colors mt-0.5 shrink-0"
      >
        <X size={15} aria-hidden />
      </button>
    </div>
  )
}
