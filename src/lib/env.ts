function require(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error(`Missing required env var: ${name}`)
  return val
}

export const env = {
  // Database
  databaseUrl: require('DATABASE_URL'),
  databaseUrlUnpooled: require('DATABASE_URL_UNPOOLED'),

  // Auth
  betterAuthSecret: require('BETTER_AUTH_SECRET'),
  betterAuthUrl: require('BETTER_AUTH_URL'),

  // Anthropic — NEVER expose to client
  anthropicApiKey: require('ANTHROPIC_API_KEY'),

  // Upstash Redis
  upstashRedisRestUrl: require('UPSTASH_REDIS_REST_URL'),
  upstashRedisRestToken: require('UPSTASH_REDIS_REST_TOKEN'),

  // Stripe
  stripeSecretKey: require('STRIPE_SECRET_KEY'),
  stripeWebhookSecret: require('STRIPE_WEBHOOK_SECRET'),
  stripeProPriceId: require('STRIPE_PRO_PRICE_ID'),

  // Free tier
  freeTierLimit: parseInt(process.env.FREE_TIER_GENERATION_LIMIT ?? '5', 10),

  // Public
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
}
