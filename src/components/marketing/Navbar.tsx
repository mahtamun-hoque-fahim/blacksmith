import Link from 'next/link'

// ─────────────────────────────────────────────────────────
//  components/marketing/Navbar.tsx
//  Server Component — no interactivity needed.
// ─────────────────────────────────────────────────────────

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-bg/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-syne text-lg font-bold text-text tracking-tight">
          Black<span className="text-accent">smith</span>
        </Link>

        {/* Centre links */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          <Link
            href="/pricing"
            className="text-sm text-text-muted hover:text-text transition-colors duration-150"
          >
            Pricing
          </Link>
        </nav>

        {/* Auth CTAs */}
        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="hidden sm:block text-sm text-text-muted hover:text-text transition-colors duration-150"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="bg-accent text-bg text-sm px-4 py-1.5 rounded-lg font-semibold hover:bg-accent-hover transition-colors duration-150"
          >
            Start free
          </Link>
        </div>
      </div>
    </header>
  )
}
