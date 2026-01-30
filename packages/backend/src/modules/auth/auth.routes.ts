/**
 * Auth Module Routes
 * API routes for Authentication
 */

import { Hono } from 'hono'
import { requireAuth } from '../../middleware/auth'
import { container } from '../../core/di/container'
import { AuthController } from './controllers/auth.controller'

const auth = new Hono()

// Lazy resolve controller from DI container
const getAuthController = () => container.resolve(AuthController)

// ============================================
// ZALO OAUTH LOGIN (Mini App Users)
// ============================================

/**
 * POST /zalo/login - Zalo OAuth login
 */
auth.post('/zalo/login', (c) => getAuthController().loginWithZalo(c))

// ============================================
// EMAIL OTP LOGIN (Admin Users)
// ============================================

/**
 * POST /admin/request-otp - Request OTP (Step 1)
 */
auth.post('/admin/request-otp', (c) => getAuthController().requestOTP(c))

/**
 * POST /admin/verify-otp - Verify OTP and login (Step 2)
 */
auth.post('/admin/verify-otp', (c) => getAuthController().verifyOTP(c))

// ============================================
// TOKEN REFRESH
// ============================================

/**
 * POST /refresh - Refresh access token
 */
auth.post('/refresh', (c) => getAuthController().refreshToken(c))

// ============================================
// LOGOUT (Requires Auth)
// ============================================

/**
 * POST /logout - Logout current session
 */
auth.post('/logout', requireAuth, (c) => getAuthController().logout(c))

// ============================================
// CURRENT USER (Requires Auth)
// ============================================

/**
 * GET /me - Get current user info
 */
auth.get('/me', requireAuth, (c) => getAuthController().getCurrentUser(c))

// ============================================
// SESSION MANAGEMENT (Requires Auth)
// ============================================

/**
 * GET /sessions - Get active sessions
 */
auth.get('/sessions', requireAuth, (c) => getAuthController().getSessions(c))

/**
 * POST /logout-all - Logout all sessions
 */
auth.post('/logout-all', requireAuth, (c) => getAuthController().logoutAll(c))

export default auth
