function require(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error(`Missing required env var: ${name}`)
  return val
}

export const env = {
  databaseUrl:              require('DATABASE_URL'),
  databaseUrlUnpooled:      require('DATABASE_URL_UNPOOLED'),
  betterAuthSecret:         require('BETTER_AUTH_SECRET'),
  betterAuthUrl:            require('BETTER_AUTH_URL'),
  googleGenerativeAiKey:    require('GOOGLE_GENERATIVE_AI_API_KEY'),
  upstashRedisRestUrl:      require('UPSTASH_REDIS_REST_URL'),
  upstashRedisRestToken:    require('UPSTASH_REDIS_REST_TOKEN'),
  lemonSqueezyApiKey:       require('LEMONSQUEEZY_API_KEY'),
  lemonSqueezyWebhookSecret:require('LEMONSQUEEZY_WEBHOOK_SECRET'),
  lemonSqueezyStoreId:      require('LEMONSQUEEZY_STORE_ID'),
  lemonSqueezyProVariantId: require('LEMONSQUEEZY_PRO_VARIANT_ID'),
  freeTierLimit:            parseInt(process.env.FREE_TIER_GENERATION_LIMIT ?? '5', 10),
  appUrl:                   process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
}
