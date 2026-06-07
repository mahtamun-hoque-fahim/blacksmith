import { requireUser } from '@/lib/auth/session'
import { getUserSubscription } from '@/lib/lemonsqueezy'
import { getGenerationCount } from '@/lib/redis'
import { getDb } from '@/lib/db'
import { generations } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import Link from 'next/link'
import { Zap, Clock, Code2 } from 'lucide-react'

export default async function DashboardPage() {
  const session = await requireUser()
  const userId  = session.user.id
  const limit   = parseInt(process.env.FREE_TIER_GENERATION_LIMIT ?? '5', 10)

  const [sub, count, recent] = await Promise.all([
    getUserSubscription(userId),
    getGenerationCount(userId),
    getDb().select().from(generations).where(eq(generations.userId, userId)).orderBy(desc(generations.createdAt)).limit(10),
  ])

  const isPro = sub?.plan === 'pro' && sub?.status === 'active'
  const pct   = Math.min((count / limit) * 100, 100)

  return (
    <main className="min-h-screen px-6 py-10 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-syne text-2xl font-bold text-text">Dashboard</h1>
          <p className="text-text-muted text-sm mt-0.5">{session.user.email}</p>
        </div>
        <Link href="/generate" className="bg-accent text-bg px-4 py-2 rounded-md text-sm font-semibold hover:bg-accent-hover transition-colors">
          New project
        </Link>
      </div>

      <div className="bg-surface border border-border rounded-lg p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap size={16} className={isPro ? 'text-accent' : 'text-text-muted'} />
            <span className="text-sm font-medium text-text">{isPro ? 'Pro plan' : 'Free plan'}</span>
            {isPro && <span className="text-xs bg-accent-faint text-accent px-2 py-0.5 rounded-sm font-semibold uppercase tracking-wide">PRO</span>}
          </div>
          {!isPro && <Link href="/pricing" className="text-xs text-accent hover:underline">Upgrade to Pro</Link>}
        </div>
        {!isPro ? (
          <div>
            <div className="flex justify-between text-xs text-text-muted mb-2">
              <span>Generations this month</span>
              <span>{count} / {limit}</span>
            </div>
            <div className="h-1.5 bg-border rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        ) : (
          <p className="text-sm text-text-muted">Unlimited generations. All features unlocked.</p>
        )}
      </div>

      <h2 className="text-sm font-semibold text-text-muted uppercase tracking-widest mb-4">Recent projects</h2>
      {recent.length === 0 ? (
        <div className="bg-surface border border-border rounded-lg p-10 text-center">
          <Code2 size={24} className="text-text-faint mx-auto mb-3" />
          <p className="text-text-muted text-sm">No projects yet.</p>
          <Link href="/generate" className="inline-block mt-3 text-accent text-sm hover:underline">Generate your first project</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {recent.map(gen => (
            <div key={gen.id} className="bg-surface border border-border rounded-lg px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text font-mono">{gen.projectName}</p>
                <p className="text-xs text-text-muted mt-0.5">
                  {gen.architecture.toUpperCase()} · {gen.uiLayer === 'compose' ? 'Jetpack Compose' : 'XML Layouts'}
                  {gen.features.length > 0 && ` · ${gen.features.length} features`}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-text-faint">
                <Clock size={12} />
                <span>{new Date(gen.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
