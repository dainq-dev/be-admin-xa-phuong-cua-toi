/**
 * Wards Module Entry Point
 */

import { container } from '../../core/di/container'
import { prisma } from '../../core/database/prisma.client'

// Repositories
import { WardsRepository } from './repositories/wards.repository'

// Services
import { WardsService } from './services/wards.service'

// Controllers
import { WardsController } from './controllers/wards.controller'

// Routes
import wardsRoutes from './wards.routes'

/**
 * Register all Wards module dependencies
 */
export function registerWardsModule(): void {
  // Register repositories
  container.register(
    WardsRepository,
    () => new WardsRepository(prisma),
    true
  )

  // Register services
  container.register(
    WardsService,
    () => new WardsService(container.resolve(WardsRepository)),
    true
  )

  // Register controllers
  container.register(
    WardsController,
    () => new WardsController(container.resolve(WardsService)),
    true
  )
}

// Export routes
export { wardsRoutes }
