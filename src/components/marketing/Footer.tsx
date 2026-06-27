import Link from 'next/link'

// ─────────────────────────────────────────────────────────
//  components/marketing/Footer.tsx
// ─────────────────────────────────────────────────────────

export function Footer() {
  return (
    <footer className="border-t border-border mt-24 py-10 px-6">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        {/* Brand */}
        <div>
          <span className="font-syne font-bold text-text">
            Black<span className="text-accent">smith</span>
          </span>
          <p className="text-xs text-text-faint mt-1">
            Android project generator
          </p>
        </div>

        {/* Links */}
        <nav
          className="flex items-center gap-6 text-sm text-text-muted"
          aria-label="Footer navigation"
        >
          <Link href="/pricing"  className="hover:text-text transition-colors duration-150">Pricing</Link>
          <Link href="/sign-in"  className="hover:text-text transition-colors duration-150">Sign in</Link>
          <Link href="/sign-up"  className="hover:text-text transition-colors duration-150">Start free</Link>
        </nav>

        {/* Legal */}
        <p className="text-xs text-text-faint">© 2026 Blacksmith</p>
      </div>
    </footer>
  )
}
