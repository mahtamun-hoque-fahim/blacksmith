'use server'

// ─────────────────────────────────────────────────────────
//  lib/generation/actions.ts
//  generateProject — the core Server Action for the generation engine.
//
//  Runtime: Node (not Edge). JSZip and Gemini SDK require Node.
//  Do NOT add `export const runtime = 'edge'` here or in any parent
//  layout/page segment that wraps this action.
// ─────────────────────────────────────────────────────────

import { nanoid }     from 'nanoid'
import { Ratelimit }  from '@upstash/ratelimit'
import { Redis }      from '@upstash/redis'

import { requireUser } from '@/lib/auth/session'
import { getDb }        from '@/lib/db'
import { generations }  from '@/lib/db/schema'
import { getGenerationModel }          from '@/lib/gemini'
import { isProUser }                   from '@/lib/lemonsqueezy'
import { getGenerationCount, incrementGenerationCount } from '@/lib/redis'

import {
  sanitizeInput,
  buildGenerationPrompt,
  FEATURE_CATALOG,
  type GenerationInput,
  type GeneratedFile,
} from './prompt'
import { parseAndPackage } from './packager'

// ── Per-user hourly generation rate limiter ────────────────
// Secondary guard on top of the monthly free-tier cap.
// Prevents a compromised Pro account or a script from exhausting
// Gemini API quota in a burst. 20 generations per hour per user.
const genRl = new Ratelimit({
  redis:   Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, '60 m'),
  prefix:  'blacksmith:rl:gen',
})

// ── Return types ───────────────────────────────────────────

export type GenerationSuccess = {
  success:   true
  files:     GeneratedFile[]
  zipBase64: string
  fileName:  string
}

export type GenerationFailure = {
  success:      false
  limitReached: boolean
  error?:       string
}

export type GenerationResult = GenerationSuccess | GenerationFailure

// ── Action ─────────────────────────────────────────────────

export async function generateProject(
  rawInput: GenerationInput,
): Promise<GenerationResult> {
  try {
    // 1 ── Auth ─────────────────────────────────────────────
    const session = await requireUser()
    const userId  = session.user.id

    // 2 ── Sanitize ─────────────────────────────────────────
    let input: GenerationInput
    try {
      input = sanitizeInput(rawInput)
    } catch (e) {
      return {
        success:      false,
        limitReached: false,
        error:        e instanceof Error ? e.message : 'Invalid input.',
      }
    }

    // 3 ── Plan check ───────────────────────────────────────
    const pro = await isProUser(userId)

    // 4 ── Generation limit (free users only) ───────────────
    if (!pro) {
      const limit = parseInt(process.env.FREE_TIER_GENERATION_LIMIT ?? '5', 10)
      const count = await getGenerationCount(userId)
      if (count >= limit) {
        return { success: false, limitReached: true }
      }
    }

    // 4b ── Hourly burst guard (all users) ──────────────────
    const { success: withinHourly } = await genRl.limit(userId)
    if (!withinHourly) {
      return {
        success:      false,
        limitReached: false,
        error:        'Too many generations in a short time. Please wait a moment and try again.',
      }
    }

    // 5 ── Strip pro features if user is on free tier ───────
    if (!pro) {
      const proIds = new Set(
        FEATURE_CATALOG.filter(f => f.tier === 'pro').map(f => f.id),
      )
      input = {
        ...input,
        features: input.features.filter(id => !proIds.has(id)),
      }
    }

    // 6 ── Build prompt ─────────────────────────────────────
    const prompt = buildGenerationPrompt(input)

    // 7 ── Gemini API call ──────────────────────────────────
    const model    = getGenerationModel()
    const result   = await model.generateContent(prompt)
    const rawText  = result.response.text()

    if (!rawText || rawText.trim().length === 0) {
      throw new Error('Gemini returned an empty response. Please try again.')
    }

    // 8 ── Parse JSON + build zip ───────────────────────────
    const { files, zipBase64 } = await parseAndPackage(rawText)

    // 9 ── Increment generation count in Redis ───────────────
    await incrementGenerationCount(userId)

    // 10 ── Persist generation record to Neon ───────────────
    const db = getDb()
    await db.insert(generations).values({
      id:           nanoid(),
      userId,
      projectName:  input.projectName,
      features:     input.features,
      architecture: input.architecture,
      uiLayer:      input.uiLayer,
    })

    // 11 ── Return ──────────────────────────────────────────
    return {
      success:   true,
      files,
      zipBase64,
      fileName:  `${input.projectName}_blacksmith.zip`,
    }
  } catch (e) {
    console.error('[generateProject]', e)
    return {
      success:      false,
      limitReached: false,
      error:        'Generation failed. Please try again.',
    }
  }
}
