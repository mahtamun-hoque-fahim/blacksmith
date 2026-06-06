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

// Key format: gen_count:{userId}:{YYYY-MM}
function genCountKey(userId: string): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `gen_count:${userId}:${now.getFullYear()}-${month}`
}

export async function getGenerationCount(userId: string): Promise<number> {
  const redis = getRedis()
  const count = await redis.get<number>(genCountKey(userId))
  return count ?? 0
}

export async function incrementGenerationCount(userId: string): Promise<number> {
  const redis = getRedis()
  const key = genCountKey(userId)

  // INCR returns the new value; set expiry to 35 days to cover full billing month
  const newCount = await redis.incr(key)
  if (newCount === 1) {
    await redis.expire(key, 60 * 60 * 24 * 35)
  }
  return newCount
}
