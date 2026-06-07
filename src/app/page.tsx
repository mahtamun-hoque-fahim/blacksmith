import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="font-syne text-5xl font-bold text-text mb-4">
        Black<span className="text-accent">smith</span>
      </h1>
      <p className="text-text-muted text-lg mb-8 text-center max-w-md">
        Generate production-ready Android Studio Kotlin projects in seconds.
        Pick features, download, build.
      </p>
      <div className="flex gap-4">
        <Link href="/sign-up" className="bg-accent text-bg px-6 py-3 rounded-md font-semibold hover:bg-accent-hover transition-colors">
          Start for free
        </Link>
        <Link href="/sign-in" className="bg-surface text-text px-6 py-3 rounded-md border border-border hover:bg-surface-elevated transition-colors">
          Sign in
        </Link>
      </div>
    </main>
  )
}
