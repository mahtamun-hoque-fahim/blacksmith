import { lemonSqueezySetup, getSubscription } from '@lemonsqueezy/lemonsqueezy.js'
import crypto from 'crypto'
import { eq } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { subscriptions } from '@/lib/db/schema'

export function setupLemonSqueezy() {
  lemonSqueezySetup({ apiKey: process.env.LEMONSQUEEZY_API_KEY! })
}

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!
  const hmac   = crypto.createHmac('sha256', secret)
  hmac.update(rawBody)
  const digest = hmac.digest('hex')
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))
  } catch {
    return false
  }
}

export async function getUserSubscription(userId: string) {
  const db   = getDb()
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
