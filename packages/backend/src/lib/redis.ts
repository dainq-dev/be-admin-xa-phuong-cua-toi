/**
 * Redis Client Setup
 * For caching, sessions, and rate limiting
 */

import Redis from 'ioredis'
import { env } from './env'

// Create Redis client instance
export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false
})

redis.on('error', (err) => {
  console.error('Redis Client Error:', err)
})

redis.on('connect', () => {
  console.log('✅ Redis connected')
})

// IORedis connects automatically, no need to call connect()

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
      await redis.set(key, stringValue, 'EX', ttl)
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
    const stream = redis.scanStream({
      match: pattern,
    })
    
    stream.on('data', (keys) => {
      if (keys.length) {
        const pipeline = redis.pipeline()
        keys.forEach((key: string) => {
          pipeline.del(key)
        })
        pipeline.exec()
      }
    })
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
