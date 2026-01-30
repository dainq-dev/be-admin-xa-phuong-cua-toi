/**
 * Feedback Module Entry Point
 */

import { container } from '../../core/di/container'
import { prisma } from '../../core/database/prisma.client'

// Repositories
import { FeedbackRepository } from './repositories/feedback.repository'

// Services
import { FeedbackService } from './services/feedback.service'

// Controllers
import { FeedbackController } from './controllers/feedback.controller'

// Routes
import feedbackRoutes from './feedback.routes'

/**
 * Register all Feedback module dependencies
 */
export function registerFeedbackModule(): void {
  // Register repositories
  container.register(
    FeedbackRepository,
    () => new FeedbackRepository(prisma),
    true
  )

  // Register services
  container.register(
    FeedbackService,
    () => new FeedbackService(container.resolve(FeedbackRepository)),
    true
  )

  // Register controllers
  container.register(
    FeedbackController,
    () => new FeedbackController(container.resolve(FeedbackService)),
    true
  )
}

// Export routes
export { feedbackRoutes }
