'use client'

// ─────────────────────────────────────────────────────────
//  components/ui/Modal.tsx
//  Reusable modal overlay — Escape to close, backdrop click
//  to close, body scroll locked while open.
// ─────────────────────────────────────────────────────────

import { useCallback, useEffect } from 'react'
import { X } from 'lucide-react'

type Props = {
  isOpen:   boolean
  onClose:  () => void
  title?:   string
  children: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children }: Props) {
  const handleKey = useCallback(
    (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() },
    [onClose],
  )

  useEffect(() => {
    if (!isOpen) return
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKey])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-bg/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-sm bg-surface border border-border rounded-2xl shadow-xl">
        {/* Optional titled header */}
        {title && (
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
            <h2 className="font-syne text-base font-bold text-text">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="text-text-muted hover:text-text transition-colors"
            >
              <X size={18} aria-hidden />
            </button>
          </div>
        )}

        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
