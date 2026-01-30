/**
 * Analytics Module Routes
 */

import { Hono } from 'hono'
import { requireAuth, requireStaff } from '../../middleware/auth'
import { container } from '../../core/di/container'
import { AnalyticsController } from './controllers/analytics.controller'

const analytics = new Hono()

// Lazy resolve controller
const getController = () => container.resolve(AnalyticsController)

/**
 * POST /track - Track user event
 */
analytics.post('/track', requireAuth, (c) => getController().track(c))

/**
 * GET /dashboard - Get dashboard summary (Staff only)
 */
analytics.get('/dashboard', requireAuth, requireStaff, (c) => getController().getDashboard(c))

/**
 * GET /feedback - Get feedback analytics (Staff only)
 */
analytics.get('/feedback', requireAuth, requireStaff, (c) => getController().getFeedback(c))

export default analytics
