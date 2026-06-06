import { requireUser } from '@/lib/auth/session'
import { getGenerationCount } from '@/lib/redis'
import { isProUser } from '@/lib/stripe'
import { Code2 } from 'lucide-react'

export default async function GeneratePage() {
  const session = await requireUser()
  const userId  = session.user.id
  const limit   = parseInt(process.env.FREE_TIER_GENERATION_LIMIT ?? '5', 10)

  const [count, pro] = await Promise.all([
    getGenerationCount(userId),
    isProUser(userId),
  ])

  const atLimit = !pro && count >= limit

  return (
    <main className="min-h-screen px-6 py-10 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Code2 size={20} className="text-accent" />
        <h1 className="font-syne text-2xl font-bold text-text">New project</h1>
      </div>

      {atLimit && (
        <div className="bg-warning/10 border border-warning/30 rounded-lg px-5 py-4 mb-6">
          <p className="text-sm text-warning font-medium">
            You have used all {limit} free generations this month.
          </p>
          <p className="text-xs text-text-muted mt-1">
            Upgrade to Pro for unlimited projects.
          </p>
        </div>
      )}

      {/* Feature selector — Phase 2 */}
      <div className="bg-surface border border-border rounded-lg p-8 text-center text-text-muted text-sm">
        Generation engine — Phase 2
      </div>
    </main>
  )
}
