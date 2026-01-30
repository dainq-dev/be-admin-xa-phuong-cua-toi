/**
 * Redis Client - Core Cache
 * Re-export from lib for core module usage
 */

// Basic export
export { redis, cache } from '../../lib/redis'

// Type exports
import { Redis } from 'ioredis'
export type RedisClientType = Redis

/**
 * Cache Service Interface
 * Abstraction for cache operations
 */
export interface ICacheService {
  get<T>(key: string): Promise<T | null>
  set(key: string, value: unknown, ttl?: number): Promise<void>
  delete(key: string): Promise<void>
  deletePattern(pattern: string): Promise<void>
  exists(key: string): Promise<boolean>
  ttl(key: string): Promise<number>
}
