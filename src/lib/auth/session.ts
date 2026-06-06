import { cache } from 'react'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export const getSession = cache(async () => {
  const h = await headers()
  return auth.api.getSession({ headers: h })
})

export const requireUser = cache(async () => {
  const session = await getSession()
  if (!session?.user) redirect('/sign-in')
  return session
})
