/**
 * Contacts Module Entry Point
 */

import { container } from '../../core/di/container'
import { prisma } from '../../core/database/prisma.client'

// Repositories
import { ContactsRepository } from './repositories/contacts.repository'

// Services
import { ContactsService } from './services/contacts.service'

// Controllers
import { ContactsController } from './controllers/contacts.controller'

// Routes
import contactsRoutes from './contacts.routes'

/**
 * Register all Contacts module dependencies
 */
export function registerContactsModule(): void {
  // Register repositories
  container.register(
    ContactsRepository,
    () => new ContactsRepository(prisma),
    true
  )

  // Register services
  container.register(
    ContactsService,
    () => new ContactsService(container.resolve(ContactsRepository)),
    true
  )

  // Register controllers
  container.register(
    ContactsController,
    () => new ContactsController(container.resolve(ContactsService)),
    true
  )
}

// Export routes
export { contactsRoutes }
