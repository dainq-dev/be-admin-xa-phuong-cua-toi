/**
 * Auth Controller
 * HTTP request/response handling for Auth API
 */

import type { Context } from 'hono'
import { AuthService } from '../services/auth.service'
import {
  validateBody,
  loginZaloSchema,
  loginAdminSchema,
  verifyOTPSchema,
  refreshTokenSchema,
} from '../validators/auth.validators'

export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * POST /zalo/login - Zalo OAuth login
   */
  async loginWithZalo(c: Context) {
    try {
      const body = await validateBody(await c.req.json(), loginZaloSchema)

      const deviceInfo = {
        userAgent: c.req.header('user-agent'),
      }
      const ipAddress =
        c.req.header('x-forwarded-for') || c.req.header('x-real-ip')

      const result = await this.authService.loginWithZalo(
        body,
        deviceInfo,
        ipAddress
      )

      return c.json(result)
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ error: error.message }, 403)
      }
      throw error
    }
  }

  /**
   * POST /admin/request-otp - Request OTP for email login
   */
  async requestOTP(c: Context) {
    try {
      const body = await validateBody(await c.req.json(), loginAdminSchema)

      const result = await this.authService.requestOTP(body)

      return c.json(result)
    } catch (error) {
      if (error instanceof Error) {
        const status = error.message.includes('not found') ? 404 : 403

        if (error.message.includes('already sent')) {
          return c.json({ error: error.message }, 429)
        }

        return c.json({ error: error.message }, status)
      }
      throw error
    }
  }

  /**
   * POST /admin/verify-otp - Verify OTP and login
   */
  async verifyOTP(c: Context) {
    try {
      const body = await validateBody(await c.req.json(), verifyOTPSchema)

      const deviceInfo = {
        userAgent: c.req.header('user-agent'),
      }
      const ipAddress =
        c.req.header('x-forwarded-for') || c.req.header('x-real-ip')

      const result = await this.authService.verifyOTPAndLogin(
        body,
        deviceInfo,
        ipAddress
      )

      return c.json(result)
    } catch (error) {
      if (error instanceof Error) {
        const status = error.message.includes('Invalid') ? 401 : 404
        return c.json({ error: error.message }, status)
      }
      throw error
    }
  }

  /**
   * POST /refresh - Refresh access token
   */
  async refreshToken(c: Context) {
    try {
      const body = await validateBody(await c.req.json(), refreshTokenSchema)

      const result = await this.authService.refreshToken(body)

      return c.json(result)
    } catch (error) {
      return c.json({ error: 'Invalid refresh token' }, 401)
    }
  }

  /**
   * POST /logout - Logout (requires auth)
   */
  async logout(c: Context) {
    try {
      const userId = c.get('userId') as string
      const authHeader = c.req.header('Authorization')
      const token = authHeader?.substring(7) // Remove 'Bearer '

      if (token) {
        await this.authService.logout(userId, token)
      }

      return c.json({ message: 'Logged out successfully' })
    } catch (error) {
      throw error
    }
  }

  /**
   * GET /me - Get current user (requires auth)
   */
  async getCurrentUser(c: Context) {
    try {
      const userId = c.get('userId') as string

      const user = await this.authService.getCurrentUser(userId)

      return c.json({ user })
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ error: error.message }, 404)
      }
      throw error
    }
  }
}
