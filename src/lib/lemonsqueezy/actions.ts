'use server'

// ─────────────────────────────────────────────────────────
//  lib/lemonsqueezy/actions.ts
//  LemonSqueezy Server Actions — checkout URL creation and
//  customer portal URL retrieval.
// ─────────────────────────────────────────────────────────

import { createCheckout, getSubscription } from '@lemonsqueezy/lemonsqueezy.js'

import { requireUser }         from '@/lib/auth/session'
import { setupLemonSqueezy, getUserSubscription } from '@/lib/lemonsqueezy'

// ── createCheckoutUrl ──────────────────────────────────────
// Called from UpgradeModal ("Upgrade Now" button) and the
// dashboard "Upgrade to Pro" form action.
// Returns the LemonSqueezy Checkout URL or an error string.

export async function createCheckoutUrl(): Promise<
  { url: string } | { error: string }
> {
  try {
    const session = await requireUser()
    const { id: userId, email, name } = session.user

    setupLemonSqueezy()

    const storeId   = process.env.LEMONSQUEEZY_STORE_ID!
    const variantId = process.env.LEMONSQUEEZY_PRO_VARIANT_ID!

    const { data, error } = await createCheckout(storeId, variantId, {
      checkoutData: {
        email:  email  ?? undefined,
        name:   name   ?? undefined,
        // Passed through to the webhook so we can match the subscription to the user
        custom: { user_id: userId },
      },
      productOptions: {
        redirectUrl:         `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
        receiptButtonText:   'Go to dashboard',
        receiptThankYouNote: 'Thank you for upgrading to Blacksmith Pro!',
      },
    })

    if (error) throw new Error(error.message)

    const url = data?.data?.attributes?.url
    if (!url) throw new Error('LemonSqueezy did not return a checkout URL.')

    return { url }
  } catch (e) {
    console.error('[createCheckoutUrl]', e)
    return { error: 'Unable to start checkout. Please try again.' }
  }
}

// ── getPortalUrl ───────────────────────────────────────────
// Returns the LemonSqueezy customer portal URL for the
// current user's active subscription.
// Used by the dashboard "Manage subscription" form action.

export async function getPortalUrl(): Promise<
  { url: string } | { error: string }
> {
  try {
    const session = await requireUser()
    const userId  = session.user.id

    const sub = await getUserSubscription(userId)

    if (!sub?.lsSubscriptionId) {
      return { error: 'No active subscription found.' }
    }

    setupLemonSqueezy()

    const { data, error } = await getSubscription(sub.lsSubscriptionId)

    if (error) throw new Error(error.message)

    const url = data?.data?.attributes?.urls?.customer_portal
    if (!url) throw new Error('Could not retrieve customer portal URL.')

    return { url }
  } catch (e) {
    console.error('[getPortalUrl]', e)
    return { error: 'Unable to open billing portal. Please try again.' }
  }
}
