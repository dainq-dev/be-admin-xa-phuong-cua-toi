/**
 * Redis Client Setup
 * For caching, sessions, and rate limiting
 */

import { createClient } from 'redis'
import { env } from './env'

export const redis = createClient({
  url: env.REDIS_URL,
})

redis.on('error', (err) => {
  console.error('Redis Client Error:', err)
})

redis.on('connect', () => {
  console.log('✅ Redis connected')
})

// Connect to Redis
await redis.connect()

// Graceful shutdown
process.on('SIGINT', async () => {
  await redis.quit()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await redis.quit()
  process.exit(0)
})

// Cache utilities
export const cache = {
  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const value = await redis.get(key)
    return value ? JSON.parse(value) : null
  },

  /**
   * Set value in cache with TTL (seconds)
   */
  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    const stringValue = JSON.stringify(value)
    if (ttl) {
      await redis.setEx(key, ttl, stringValue)
    } else {
      await redis.set(key, stringValue)
    }
  },

  /**
   * Delete key from cache
   */
  async delete(key: string): Promise<void> {
    await redis.del(key)
  },

  /**
   * Delete all keys matching pattern
   */
  async deletePattern(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(keys)
    }
  },

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    return (await redis.exists(key)) === 1
  },

  /**
   * Get TTL of key
   */
  async ttl(key: string): Promise<number> {
    return await redis.ttl(key)
  },
}
