/**
 * Documents Module Routes
 */

import { Hono } from 'hono'
import { requireAuth, requireStaff, optionalAuth } from '../../middleware/auth'
import { container } from '../../core/di/container'
import { DocumentsController } from './controllers/documents.controller'

const documents = new Hono()

// Lazy resolve controller
const getController = () => container.resolve(DocumentsController)

/**
 * GET / - List all documents
 */
documents.get('/', optionalAuth, (c) => getController().list(c))

/**
 * GET /:idOrSlug - Get document details
 */
documents.get('/:idOrSlug', optionalAuth, (c) => getController().get(c))

/**
 * POST / - Create document (Staff only)
 */
documents.post('/', requireAuth, requireStaff, (c) => getController().create(c))

/**
 * PATCH /:id - Update document (Staff only)
 */
documents.patch('/:id', requireAuth, requireStaff, (c) => getController().update(c))

/**
 * DELETE /:id - Delete document (Staff only)
 */
documents.delete('/:id', requireAuth, requireStaff, (c) => getController().delete(c))

/**
 * POST /:id/forms/:formId/download - Track download
 */
documents.post('/:id/forms/:formId/download', optionalAuth, (c) => getController().trackDownload(c))

export default documents
