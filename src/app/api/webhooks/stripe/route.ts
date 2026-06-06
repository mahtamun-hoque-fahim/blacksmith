// IMPORTANT: This route must run on Node runtime.
// Do NOT add `export const runtime = 'edge'` here — JSZip and stripe both require Node.
import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getStripe } from '@/lib/stripe'
import { getDb } from '@/lib/db'
import { subscriptions } from '@/lib/db/schema'
import { nanoid } from 'nanoid'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
  }

  let event
  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('[stripe webhook] signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const db = getDb()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as { customer: string; subscription: string; metadata?: { userId?: string } }
      const userId  = session.metadata?.userId

      if (!userId) break

      await db
        .insert(subscriptions)
        .values({
          id:                   nanoid(),
          userId,
          stripeCustomerId:     session.customer,
          stripeSubscriptionId: session.subscription,
          plan:                 'pro',
          status:               'active',
        })
        .onConflictDoUpdate({
          target: subscriptions.userId,
          set: {
            stripeCustomerId:     session.customer,
            stripeSubscriptionId: session.subscription,
            plan:                 'pro',
            status:               'active',
            updatedAt:            new Date(),
          },
        })
      break
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const sub    = event.data.object as { id: string; status: string; current_period_end: number }
      const status = sub.status as 'active' | 'canceled' | 'past_due' | 'trialing'

      await db
        .update(subscriptions)
        .set({
          status,
          plan:             status === 'active' ? 'pro' : 'free',
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
          updatedAt:        new Date(),
        })
        .where(eq(subscriptions.stripeSubscriptionId, sub.id))
      break
    }

    default:
      break
  }

  return NextResponse.json({ received: true })
}
