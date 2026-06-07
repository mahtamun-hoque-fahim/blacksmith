import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { verifyWebhookSignature } from '@/lib/lemonsqueezy'
import { getDb } from '@/lib/db'
import { subscriptions } from '@/lib/db/schema'
import { nanoid } from 'nanoid'

export async function POST(req: NextRequest) {
  const rawBody  = await req.text()
  const signature = req.headers.get('x-signature') ?? ''

  if (!verifyWebhookSignature(rawBody, signature)) {
    console.error('[ls webhook] invalid signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payload: {
    meta: { event_name: string; custom_data?: { user_id?: string } }
    data: {
      id: string
      attributes: {
        customer_id:         number
        status:              string
        current_period_end?: string
        variant_id?:         number
      }
    }
  }

  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const db        = getDb()
  const eventName = payload.meta.event_name
  const userId    = payload.meta.custom_data?.user_id
  const attrs     = payload.data.attributes

  const status = ((): 'active' | 'canceled' | 'past_due' | 'trialing' => {
    if (attrs.status === 'active')    return 'active'
    if (attrs.status === 'cancelled') return 'canceled'
    if (attrs.status === 'past_due')  return 'past_due'
    if (attrs.status === 'on_trial')  return 'trialing'
    return 'canceled'
  })()

  switch (eventName) {
    case 'subscription_created': {
      if (!userId) break
      await db
        .insert(subscriptions)
        .values({
          id:                   nanoid(),
          userId,
          lsCustomerId:         String(attrs.customer_id),
          lsSubscriptionId:     payload.data.id,
          plan:                 'pro',
          status:               'active',
          currentPeriodEnd:     attrs.current_period_end ? new Date(attrs.current_period_end) : null,
        })
        .onConflictDoUpdate({
          target: subscriptions.userId,
          set: {
            lsCustomerId:     String(attrs.customer_id),
            lsSubscriptionId: payload.data.id,
            plan:             'pro',
            status:           'active',
            currentPeriodEnd: attrs.current_period_end ? new Date(attrs.current_period_end) : null,
            updatedAt:        new Date(),
          },
        })
      break
    }

    case 'subscription_updated':
    case 'subscription_cancelled': {
      await db
        .update(subscriptions)
        .set({
          status,
          plan:             status === 'active' ? 'pro' : 'free',
          currentPeriodEnd: attrs.current_period_end ? new Date(attrs.current_period_end) : null,
          updatedAt:        new Date(),
        })
        .where(eq(subscriptions.lsSubscriptionId, payload.data.id))
      break
    }

    default:
      break
  }

  return NextResponse.json({ received: true })
}
