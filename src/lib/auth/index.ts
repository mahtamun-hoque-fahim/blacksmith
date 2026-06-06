import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { getDb } from '@/lib/db'

export const auth = betterAuth({
  database: drizzleAdapter(getDb(), { provider: 'pg' }),

  emailAndPassword: {
    enabled: true,
  },

  session: {
    expiresIn:  60 * 60 * 24 * 7,  // 7 days
    updateAge:  60 * 60 * 24,       // refresh once per day
  },

  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  ],
})
