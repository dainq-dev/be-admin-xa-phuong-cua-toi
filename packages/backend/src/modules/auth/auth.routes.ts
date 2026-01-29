/**
 * Auth Module Routes
 * API routes for Authentication
 */

import { Hono } from 'hono'
import { requireAuth } from '../../middleware/auth'
import { container } from '../../core/di/container'
import { AuthController } from './controllers/auth.controller'

const auth = new Hono()

// Resolve controller from DI container
const authController = container.resolve(AuthController)

// ============================================
// ZALO OAUTH LOGIN (Mini App Users)
// ============================================

/**
 * POST /zalo/login - Zalo OAuth login
 */
auth.post('/zalo/login', (c) => authController.loginWithZalo(c))

// ============================================
// EMAIL OTP LOGIN (Admin Users)
// ============================================

/**
 * POST /admin/request-otp - Request OTP (Step 1)
 */
auth.post('/admin/request-otp', (c) => authController.requestOTP(c))

/**
 * POST /admin/verify-otp - Verify OTP and login (Step 2)
 */
auth.post('/admin/verify-otp', (c) => authController.verifyOTP(c))

// ============================================
// TOKEN REFRESH
// ============================================

/**
 * POST /refresh - Refresh access token
 */
auth.post('/refresh', (c) => authController.refreshToken(c))

// ============================================
// LOGOUT (Requires Auth)
// ============================================

/**
 * POST /logout - Logout current session
 */
auth.post('/logout', requireAuth, (c) => authController.logout(c))

// ============================================
// CURRENT USER (Requires Auth)
// ============================================

/**
 * GET /me - Get current user info
 */
auth.get('/me', requireAuth, (c) => authController.getCurrentUser(c))

export default auth
