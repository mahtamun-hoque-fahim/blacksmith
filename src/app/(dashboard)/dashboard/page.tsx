import { redirect }           from 'next/navigation'
import Link                   from 'next/link'
import { Clock, Code2, Zap }  from 'lucide-react'
import { desc, eq }           from 'drizzle-orm'

import { requireUser }                         from '@/lib/auth/session'
import { getUserSubscription }                 from '@/lib/lemonsqueezy'
import { createCheckoutUrl, getPortalUrl }     from '@/lib/lemonsqueezy/actions'
import { getGenerationCount }                  from '@/lib/redis'
import { getDb }                               from '@/lib/db'
import { generations }                         from '@/lib/db/schema'
import { UpgradedBanner }                      from '@/components/dashboard/UpgradedBanner'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
}

// ── Inline Server Actions ──────────────────────────────────

async function handleUpgrade() {
  'use server'
  const result = await createCheckoutUrl()
  if ('url' in result) redirect(result.url)
}

async function handleManageSubscription() {
  'use server'
  const result = await getPortalUrl()
  if ('url' in result) redirect(result.url)
}

// ── Page ───────────────────────────────────────────────────

type Props = {
  searchParams: Promise<{ upgraded?: string }>
}

export default async function DashboardPage({ searchParams }: Props) {
  const params   = await searchParams
  const upgraded = params.upgraded === 'true'

  const session = await requireUser()
  const userId  = session.user.id
  const limit   = parseInt(process.env.FREE_TIER_GENERATION_LIMIT ?? '5', 10)

  const [sub, count, recent] = await Promise.all([
    getUserSubscription(userId),
    getGenerationCount(userId),
    getDb()
      .select()
      .from(generations)
      .where(eq(generations.userId, userId))
      .orderBy(desc(generations.createdAt))
      .limit(10),
  ])

  const isPro = sub?.plan === 'pro' && sub?.status === 'active'
  const pct   = Math.min((count / limit) * 100, 100)

  return (
    <main className="min-h-screen px-6 py-10 max-w-3xl mx-auto">

      {/* Success banner — rendered after LemonSqueezy checkout redirect */}
      {upgraded && <UpgradedBanner />}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-syne text-2xl font-bold text-text">Dashboard</h1>
          <p className="text-text-muted text-sm mt-0.5">{session.user.email}</p>
        </div>
        <Link
          href="/generate"
          className="bg-accent text-bg px-4 py-2 rounded-md text-sm font-semibold hover:bg-accent-hover transition-[transform,background-color] duration-150 active:scale-[0.97]"
        >
          New project
        </Link>
      </div>

      {/* Plan card */}
      <div className="bg-surface border border-border rounded-lg p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap size={16} className={isPro ? 'text-accent' : 'text-text-muted'} aria-hidden />
            <span className="text-sm font-medium text-text">
              {isPro ? 'Pro plan' : 'Free plan'}
            </span>
            {isPro && (
              <span className="text-xs bg-accent-faint text-accent px-2 py-0.5 rounded-sm font-semibold uppercase tracking-wide">
                PRO
              </span>
            )}
          </div>

          {isPro ? (
            <form action={handleManageSubscription}>
              <button type="submit" className="text-xs text-text-muted hover:text-text transition-colors">
                Manage subscription
              </button>
            </form>
          ) : (
            <form action={handleUpgrade}>
              <button type="submit" className="text-xs text-accent hover:underline font-medium">
                Upgrade to Pro
              </button>
            </form>
          )}
        </div>

        {isPro ? (
          <p className="text-sm text-text-muted">Unlimited generations. All features unlocked.</p>
        ) : (
          <div>
            <div className="flex justify-between text-xs text-text-muted mb-2">
              <span>Generations this month</span>
              <span>{count} / {limit}</span>
            </div>
            <div className="h-1.5 bg-border rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-[width] duration-300 ease-out" style={{ width: `${pct}%` }} />
            </div>
            {count >= limit && (
              <p className="text-xs text-warning mt-2">
                Monthly limit reached.{' '}
                <form action={handleUpgrade} className="inline">
                  <button type="submit" className="underline font-medium">Upgrade to Pro</button>
                </form>{''} for unlimited projects.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Recent projects */}
      <h2 className="text-sm font-semibold text-text-muted uppercase tracking-widest mb-4">
        Recent projects
      </h2>

      {recent.length === 0 ? (
        <div className="bg-surface border border-border rounded-lg p-10 text-center">
          {/* IMAGE-BRIEF: empty-01 | 1:1 | small friendly 2D illustration — abstract Android phone outline with a Kotlin spark symbol, accent-tinted on dark bg-surface, centered composition, communicates "nothing here yet, start building" without being sad */}
          <div
            data-image-slot="empty-01"
            aria-hidden
            className="w-20 h-20 mx-auto mb-4 rounded-2xl border border-dashed border-white/10 bg-surface/60"
          />
          <Code2 size={24} className="text-text-faint mx-auto mb-3" aria-hidden />
          <p className="text-text-muted text-sm">No projects yet.</p>
          <Link href="/generate" className="inline-block mt-3 text-accent text-sm hover:underline">
            Generate your first project
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {recent.map(gen => (
            <div key={gen.id} className="bg-surface border border-border rounded-lg px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text font-mono">{gen.projectName}</p>
                <p className="text-xs text-text-muted mt-0.5">
                  {gen.architecture.toUpperCase()}
                  {' · '}
                  {gen.uiLayer === 'compose' ? 'Jetpack Compose' : 'XML Layouts'}
                  {gen.features.length > 0 && ` · ${gen.features.length} feature${gen.features.length !== 1 ? 's' : ''}`}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-text-faint">
                <Clock size={12} aria-hidden />
                <time dateTime={new Date(gen.createdAt).toISOString()}>
                  {new Date(gen.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </time>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
