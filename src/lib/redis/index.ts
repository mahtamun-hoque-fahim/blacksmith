import { Redis } from '@upstash/redis'

let _redis: Redis | null = null

export function getRedis() {
  if (_redis) return _redis
  _redis = new Redis({
    url:   process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
  return _redis
}

function genCountKey(userId: string): string {
  const now   = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `gen_count:${userId}:${now.getFullYear()}-${month}`
}

export async function getGenerationCount(userId: string): Promise<number> {
  const count = await getRedis().get<number>(genCountKey(userId))
  return count ?? 0
}

export async function incrementGenerationCount(userId: string): Promise<number> {
  const key      = genCountKey(userId)
  const newCount = await getRedis().incr(key)
  if (newCount === 1) await getRedis().expire(key, 60 * 60 * 24 * 35)
  return newCount
}
