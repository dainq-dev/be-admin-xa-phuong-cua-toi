/**
 * Wards Module Routes
 */

import { Hono } from 'hono'
import { requireAuth, requireAdmin, optionalAuth } from '../../middleware/auth'
import { container } from '../../core/di/container'
import { WardsController } from './controllers/wards.controller'

const wards = new Hono()

// Lazy resolve controller
const getController = () => container.resolve(WardsController)

/**
 * GET / - List all wards
 */
wards.get('/', (c) => getController().list(c))

/**
 * GET /:id - Get ward details
 */
wards.get('/:id', (c) => getController().get(c))

/**
 * GET /:id/theme/:pageKey - Get page theme
 */
wards.get('/:id/theme/:pageKey', optionalAuth, (c) => getController().getTheme(c))

/**
 * PUT /:id/theme - Update page theme (Admin only)
 */
wards.put('/:id/theme', requireAuth, requireAdmin, (c) => getController().updateTheme(c))

/**
 * GET /:id/features - Get feature flags
 */
wards.get('/:id/features', optionalAuth, (c) => getController().getFeatures(c))

/**
 * PUT /:id/features - Update feature flag (Admin only)
 */
wards.put('/:id/features', requireAuth, requireAdmin, (c) => getController().updateFeature(c))

export default wards
