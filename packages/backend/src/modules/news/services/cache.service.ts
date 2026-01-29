/**
 * Cache Service for News Module
 * Handles caching logic for news articles
 */

import type { ICacheService } from '../../../core/cache/redis.client'
import { cache } from '../../../core/cache/redis.client'
import type { NewsFiltersInput } from '../models/types'

export class NewsCacheService {
  constructor(private cacheClient: ICacheService = cache) {}

  /**
   * Build cache key for article list
   */
  buildListCacheKey(filters: NewsFiltersInput): string {
    const parts = [
      'news:list',
      filters.wardId || 'all',
      filters.category || 'all',
      filters.isFeatured !== undefined ? `featured:${filters.isFeatured}` : '',
      filters.isPinned !== undefined ? `pinned:${filters.isPinned}` : '',
      filters.search || '',
      `limit:${filters.limit}`,
      `offset:${filters.offset}`,
    ].filter(Boolean)

    return parts.join(':')
  }

  /**
   * Build cache key for single article
   */
  buildArticleCacheKey(idOrSlug: string): string {
    return `news:article:${idOrSlug}`
  }

  /**
   * Build cache key for featured articles
   */
  buildFeaturedCacheKey(wardId?: string): string {
    return `news:featured:${wardId || 'all'}`
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    return await this.cacheClient.get<T>(key)
  }

  /**
   * Set value in cache with TTL
   */
  async set(key: string, value: unknown, ttl = 300): Promise<void> {
    await this.cacheClient.set(key, value, ttl)
  }

  /**
   * Delete specific key
   */
  async delete(key: string): Promise<void> {
    await this.cacheClient.delete(key)
  }

  /**
   * Invalidate all news caches
   */
  async invalidateNewsCache(): Promise<void> {
    await Promise.all([
      this.cacheClient.deletePattern('news:list:*'),
      this.cacheClient.deletePattern('news:featured:*'),
      this.cacheClient.deletePattern('news:tags:*'),
    ])
  }

  /**
   * Invalidate specific article cache
   */
  async invalidateArticleCache(idOrSlug: string): Promise<void> {
    await this.delete(this.buildArticleCacheKey(idOrSlug))
  }

  /**
   * Invalidate all caches related to an article update
   */
  async invalidateArticleCaches(articleId: string, slug: string): Promise<void> {
    await Promise.all([
      this.invalidateArticleCache(articleId),
      this.invalidateArticleCache(slug),
      this.invalidateNewsCache(),
    ])
  }
}
