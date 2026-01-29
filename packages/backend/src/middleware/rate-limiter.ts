/**
 * Rate Limiter Middleware
 * Uses Redis for distributed rate limiting
 */

import type { MiddlewareHandler } from 'hono'
import { redis } from '../lib/redis'
import { env } from '../lib/env'

export function rateLimiter(options?: {
  windowMs?: number
  maxRequests?: number
}): MiddlewareHandler {
  const windowMs = options?.windowMs || env.RATE_LIMIT_WINDOW * 60 * 1000
  const maxRequests = options?.maxRequests || env.RATE_LIMIT_MAX_REQUESTS
  const windowSeconds = Math.floor(windowMs / 1000)

  return async (c, next) => {
    // Get client identifier (IP or user ID)
    const identifier =
      c.get('userId') ||
      c.req.header('x-forwarded-for') ||
      c.req.header('x-real-ip') ||
      'unknown'

    const key = `rate-limit:${identifier}`

    try {
      // Get current count
      const current = await redis.get(key)
      const count = current ? parseInt(current) : 0

      // Check if limit exceeded
      if (count >= maxRequests) {
        const ttl = await redis.ttl(key)
        return c.json(
          {
            error: 'Too many requests',
            message: `Rate limit exceeded. Try again in ${ttl} seconds`,
            retryAfter: ttl,
          },
          429
        )
      }

      // Increment counter
      await redis.multi()
        .incr(key)
        .expire(key, windowSeconds)
        .exec()

      // Set rate limit headers
      c.header('X-RateLimit-Limit', maxRequests.toString())
      c.header('X-RateLimit-Remaining', (maxRequests - count - 1).toString())
      c.header('X-RateLimit-Reset', (Date.now() + windowMs).toString())

      await next()
    } catch (error) {
      console.error('Rate limiter error:', error)
      // If Redis fails, allow request to proceed
      await next()
    }
  }
}
