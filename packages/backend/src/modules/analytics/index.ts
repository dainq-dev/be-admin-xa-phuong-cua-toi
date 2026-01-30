/**
 * Analytics Module Entry Point
 */

import { container } from '../../core/di/container'
import { prisma } from '../../core/database/prisma.client'

// Repositories
import { AnalyticsRepository } from './repositories/analytics.repository'

// Services
import { AnalyticsService } from './services/analytics.service'

// Controllers
import { AnalyticsController } from './controllers/analytics.controller'

// Routes
import analyticsRoutes from './analytics.routes'

/**
 * Register all Analytics module dependencies
 */
export function registerAnalyticsModule(): void {
  // Register repositories
  container.register(
    AnalyticsRepository,
    () => new AnalyticsRepository(prisma),
    true
  )

  // Register services
  container.register(
    AnalyticsService,
    () => new AnalyticsService(container.resolve(AnalyticsRepository)),
    true
  )

  // Register controllers
  container.register(
    AnalyticsController,
    () => new AnalyticsController(container.resolve(AnalyticsService)),
    true
  )
}

// Export routes
export { analyticsRoutes }
