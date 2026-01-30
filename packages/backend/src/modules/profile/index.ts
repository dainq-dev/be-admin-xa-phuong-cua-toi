/**
 * Profile Module Entry Point
 */

import { container } from '../../core/di/container'
import { prisma } from '../../core/database/prisma.client'

// Repositories
import { ProfileRepository } from './repositories/profile.repository'

// Services
import { ProfileService } from './services/profile.service'

// Controllers
import { ProfileController } from './controllers/profile.controller'

// Routes
import profileRoutes from './profile.routes'

/**
 * Register all Profile module dependencies
 */
export function registerProfileModule(): void {
  // Register repositories
  container.register(
    ProfileRepository,
    () => new ProfileRepository(prisma),
    true
  )

  // Register services
  container.register(
    ProfileService,
    () => new ProfileService(container.resolve(ProfileRepository)),
    true
  )

  // Register controllers
  container.register(
    ProfileController,
    () => new ProfileController(container.resolve(ProfileService)),
    true
  )
}

// Export routes
export { profileRoutes }
