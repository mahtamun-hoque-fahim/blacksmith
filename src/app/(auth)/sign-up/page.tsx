'use client'

import { useState } from 'react'
import { authClient } from '@/lib/auth/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
  const router = useRouter()
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await authClient.signUp.email({ name, email, password })
    if (error) { setError(error.message ?? 'Sign up failed'); setLoading(false); return }
    router.push('/dashboard')
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-syne text-2xl font-bold text-text mb-1">Create account</h1>
        <p className="text-text-muted text-sm mb-8">
          Already have one?{' '}
          <Link href="/sign-in" className="text-accent hover:underline">Sign in</Link>
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required
            className="bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder-text-faint focus:border-accent focus:outline-none transition-colors" />
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required
            className="bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder-text-faint focus:border-accent focus:outline-none transition-colors" />
          <input type="password" placeholder="Password (8+ characters)" value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
            className="bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder-text-faint focus:border-accent focus:outline-none transition-colors" />
          {error && <p className="text-danger text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="bg-accent text-bg py-2.5 rounded-md text-sm font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      </div>
    </main>
  )
}
