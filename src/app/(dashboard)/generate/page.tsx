import { requireUser }        from '@/lib/auth/session'
import { getGenerationCount } from '@/lib/redis'
import { isProUser }          from '@/lib/lemonsqueezy'
import { GenerateForm }       from '@/components/generator/GenerateForm'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Generate Project',
  robots: { index: false, follow: false },
}

export default async function GeneratePage() {
  const session = await requireUser()
  const userId  = session.user.id
  const limit   = parseInt(process.env.FREE_TIER_GENERATION_LIMIT ?? '5', 10)

  const [count, pro] = await Promise.all([
    getGenerationCount(userId),
    isProUser(userId),
  ])

  return (
    <main className="min-h-screen px-6 py-10 max-w-3xl mx-auto">
      <GenerateForm initialCount={count} limit={limit} isPro={pro} />
    </main>
  )
}
