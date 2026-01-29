/**
 * News Module Entry Point
 * Register dependencies and export public API
 */

import { container } from '../../core/di/container'
import { prisma } from '../../core/database/prisma.client'

// Repositories
import { NewsRepository } from './repositories/news.repository'
import { TagRepository } from './repositories/tag.repository'

// Services
import { NewsService } from './services/news.service'
import { TagService } from './services/tag.service'
import { NewsCacheService } from './services/cache.service'
import { NewsAnalyticsService } from './services/analytics.service'

// Controllers
import { NewsController } from './controllers/news.controller'
import { TagsController } from './controllers/tags.controller'

// Utils
import { SlugGenerator } from './utils/slug.generator'

// Routes
import newsRoutes from './news.routes'

/**
 * Register all News module dependencies
 */
export function registerNewsModule(): void {
  // Register utilities
  container.register('SlugGenerator', () => new SlugGenerator(), true)

  // Register repositories
  container.register(
    NewsRepository,
    () => new NewsRepository(prisma),
    true
  )
  container.register(
    TagRepository,
    () => new TagRepository(prisma),
    true
  )

  // Register services
  container.register(
    NewsCacheService,
    () => new NewsCacheService(),
    true
  )
  container.register(
    NewsAnalyticsService,
    () => new NewsAnalyticsService(prisma),
    true
  )
  container.register(
    TagService,
    () => new TagService(
      container.resolve(TagRepository),
      container.resolve('SlugGenerator')
    ),
    true
  )
  container.register(
    NewsService,
    () => new NewsService(
      prisma,
      container.resolve(NewsRepository),
      container.resolve(TagService),
      container.resolve(NewsCacheService),
      container.resolve(NewsAnalyticsService),
      container.resolve('SlugGenerator')
    ),
    true
  )

  // Register controllers
  container.register(
    NewsController,
    () => new NewsController(container.resolve(NewsService)),
    true
  )
  container.register(
    TagsController,
    () => new TagsController(container.resolve(NewsService)),
    true
  )
}

// Export routes
export { newsRoutes }

// Export types for external use
export type { ArticleResponse, ArticleListResponse, TagResponse } from './models/types'
