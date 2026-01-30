/**
 * Contacts Module Routes
 */

import { Hono } from 'hono'
import { requireAuth, requireStaff, optionalAuth } from '../../middleware/auth'
import { container } from '../../core/di/container'
import { ContactsController } from './controllers/contacts.controller'

const contacts = new Hono()

// Lazy resolve controller from DI container
const getController = () => container.resolve(ContactsController)

/**
 * GET / - List all contacts
 */
contacts.get('/', optionalAuth, (c) => getController().list(c))

/**
 * GET /departments - List all departments
 */
contacts.get('/departments', optionalAuth, (c) => getController().getDepartments(c))

/**
 * GET /emergency - List emergency contacts
 */
contacts.get('/emergency', optionalAuth, (c) => getController().listEmergency(c))

/**
 * POST / - Create contact (Staff only)
 */
contacts.post('/', requireAuth, requireStaff, (c) => getController().create(c))

/**
 * PATCH /:id - Update contact (Staff only)
 */
contacts.patch('/:id', requireAuth, requireStaff, (c) => getController().update(c))

/**
 * DELETE /:id - Delete contact (Staff only)
 */
contacts.delete('/:id', requireAuth, requireStaff, (c) => getController().delete(c))

/**
 * POST /:id/call - Track call
 */
contacts.post('/:id/call', optionalAuth, (c) => getController().trackCall(c))

/**
 * POST /emergency - Create emergency contact (Staff only)
 */
contacts.post('/emergency', requireAuth, requireStaff, (c) => getController().createEmergency(c))

export default contacts
