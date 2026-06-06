import {
  pgTable,
  pgEnum,
  text,
  boolean,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core'

// ---------------------------------------------------------------------------
// Better Auth tables (managed by Better Auth — do not modify column names)
// ---------------------------------------------------------------------------

export const user = pgTable('user', {
  id:            text('id').primaryKey(),
  name:          text('name').notNull(),
  email:         text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image:         text('image'),
  createdAt:     timestamp('created_at').notNull().defaultNow(),
  updatedAt:     timestamp('updated_at').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id:        text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token:     text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId:    text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id:                     text('id').primaryKey(),
  accountId:              text('account_id').notNull(),
  providerId:             text('provider_id').notNull(),
  userId:                 text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken:            text('access_token'),
  refreshToken:           text('refresh_token'),
  idToken:                text('id_token'),
  accessTokenExpiresAt:   timestamp('access_token_expires_at'),
  refreshTokenExpiresAt:  timestamp('refresh_token_expires_at'),
  scope:                  text('scope'),
  password:               text('password'),
  createdAt:              timestamp('created_at').notNull().defaultNow(),
  updatedAt:              timestamp('updated_at').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id:         text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value:      text('value').notNull(),
  expiresAt:  timestamp('expires_at').notNull(),
  createdAt:  timestamp('created_at').defaultNow(),
  updatedAt:  timestamp('updated_at').defaultNow(),
})

// ---------------------------------------------------------------------------
// Droidsmith domain tables
// ---------------------------------------------------------------------------

export const planEnum = pgEnum('plan', ['free', 'pro'])

export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'active',
  'canceled',
  'past_due',
  'trialing',
])

export const subscriptions = pgTable('subscriptions', {
  id:                     text('id').primaryKey(),
  userId:                 text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }).unique(),
  stripeCustomerId:       text('stripe_customer_id').unique(),
  stripeSubscriptionId:   text('stripe_subscription_id').unique(),
  plan:                   planEnum('plan').notNull().default('free'),
  status:                 subscriptionStatusEnum('status').notNull().default('active'),
  currentPeriodEnd:       timestamp('current_period_end'),
  createdAt:              timestamp('created_at').notNull().defaultNow(),
  updatedAt:              timestamp('updated_at').notNull().defaultNow(),
})

export const architectureEnum = pgEnum('architecture', ['mvvm', 'clean'])

export const uiLayerEnum = pgEnum('ui_layer', ['xml', 'compose'])

export const generations = pgTable('generations', {
  id:           text('id').primaryKey(),
  userId:       text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  projectName:  text('project_name').notNull(),
  features:     text('features').array().notNull().default([]),
  architecture: architectureEnum('architecture').notNull(),
  uiLayer:      uiLayerEnum('ui_layer').notNull(),
  createdAt:    timestamp('created_at').notNull().defaultNow(),
})

// ---------------------------------------------------------------------------
// Generation count reset tracking
// ---------------------------------------------------------------------------

export const generationResets = pgTable('generation_resets', {
  userId:      text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }).primaryKey(),
  resetMonth:  integer('reset_month').notNull(),   // 1-12
  resetYear:   integer('reset_year').notNull(),
  updatedAt:   timestamp('updated_at').notNull().defaultNow(),
})
