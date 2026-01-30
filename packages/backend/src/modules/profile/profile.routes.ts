/**
 * Profile Module Routes
 */

import { Hono } from 'hono'
import { requireAuth } from '../../middleware/auth'
import { container } from '../../core/di/container'
import { ProfileController } from './controllers/profile.controller'

const profile = new Hono()

// Lazy resolve controller
const getController = () => container.resolve(ProfileController)

// All profile routes require authentication
profile.use('*', requireAuth)

/**
 * GET / - Get user profile
 */
profile.get('/', (c) => getController().getProfile(c))

/**
 * PATCH / - Update user profile
 */
profile.patch('/', (c) => getController().updateProfile(c))

/**
 * GET /settings - Get user settings
 */
profile.get('/settings', (c) => getController().getSettings(c))

/**
 * PATCH /settings - Update user settings
 */
profile.patch('/settings', (c) => getController().updateSettings(c))

/**
 * GET /feedback-history - Get feedback history for current user
 */
profile.get('/feedback-history', (c) => getController().getFeedbackHistory(c))

export default profile
