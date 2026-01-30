/**
 * Feedback Module Routes
 */

import { Hono } from 'hono'
import { requireAuth, requireStaff, optionalAuth } from '../../middleware/auth'
import { container } from '../../core/di/container'
import { FeedbackController } from './controllers/feedback.controller'

const feedback = new Hono()

// Lazy resolve controller
const getController = () => container.resolve(FeedbackController)

/**
 * GET / - List feedback (filtered by role)
 */
feedback.get('/', requireAuth, (c) => getController().list(c))

/**
 * GET /categories - List feedback categories
 */
feedback.get('/categories', optionalAuth, (c) => getController().getCategories(c))

/**
 * GET /stats/summary - Get stats (Staff only)
 */
feedback.get('/stats/summary', requireAuth, requireStaff, (c) => getController().getStats(c))

/**
 * GET /:id - Get feedback details
 */
feedback.get('/:id', requireAuth, (c) => getController().get(c))

/**
 * POST / - Submit feedback (Citizens)
 */
feedback.post('/', requireAuth, (c) => getController().submit(c))

/**
 * PATCH /:id/status - Update status (Staff only)
 */
feedback.patch('/:id/status', requireAuth, requireStaff, (c) => getController().updateStatus(c))

export default feedback
