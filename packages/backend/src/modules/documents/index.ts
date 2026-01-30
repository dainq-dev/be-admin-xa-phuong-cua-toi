/**
 * Documents Module Entry Point
 */

import { container } from '../../core/di/container'
import { prisma } from '../../core/database/prisma.client'

// Repositories
import { DocumentsRepository } from './repositories/documents.repository'

// Services
import { DocumentsService } from './services/documents.service'

// Controllers
import { DocumentsController } from './controllers/documents.controller'

// Routes
import documentsRoutes from './documents.routes'

/**
 * Register all Documents module dependencies
 */
export function registerDocumentsModule(): void {
  // Register repositories
  container.register(
    DocumentsRepository,
    () => new DocumentsRepository(prisma),
    true
  )

  // Register services
  container.register(
    DocumentsService,
    () => new DocumentsService(container.resolve(DocumentsRepository)),
    true
  )

  // Register controllers
  container.register(
    DocumentsController,
    () => new DocumentsController(container.resolve(DocumentsService)),
    true
  )
}

// Export routes
export { documentsRoutes }
