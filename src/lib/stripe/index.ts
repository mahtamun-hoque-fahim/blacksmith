import Stripe from 'stripe'
import { eq } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { subscriptions } from '@/lib/db/schema'

let _stripe: Stripe | null = null

export function getStripe() {
  if (_stripe) return _stripe
  _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-04-30.basil',
  })
  return _stripe
}

export async function getUserSubscription(userId: string) {
  const db = getDb()
  const rows = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1)
  return rows[0] ?? null
}

export async function isProUser(userId: string): Promise<boolean> {
  const sub = await getUserSubscription(userId)
  return sub?.plan === 'pro' && sub?.status === 'active'
}
