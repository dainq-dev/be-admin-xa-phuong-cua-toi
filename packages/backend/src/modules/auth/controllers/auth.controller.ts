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
      console.log(" 🚀- DaiNQ - 🚀: -> AuthController -> requestOTP -> body:", body)

      const result = await this.authService.requestOTP(body)
      console.log(" 🚀- DaiNQ - 🚀: -> AuthController -> requestOTP -> result:", result)

      return c.json(result)
    } catch (error) {
      if (error instanceof Error) {
        // Account locked
        if (error.message.includes('locked')) {
          return c.json({ error: error.message }, 429)
        }
        // Rate limited (cooldown)
        if (error.message.includes('wait')) {
          return c.json({ error: error.message }, 429)
        }
        // User not found
        if (error.message.includes('not found')) {
          return c.json({ error: error.message }, 404)
        }
        // Not authorized
        return c.json({ error: error.message }, 403)
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
      console.log(" 🚀- DaiNQ - 🚀: -> AuthController -> verifyOTP -> error:", error)
      if (error instanceof Error) {
        console.log(" 🚀- DaiNQ - 🚀: -> Error message:", error.message)
        // Account locked
        if (error.message.includes('locked')) {
          return c.json({ error: error.message }, 429)
        }
        // Invalid OTP with attempts remaining
        if (error.message.includes('Invalid') || error.message.includes('attempts')) {
          return c.json({ error: error.message }, 401)
        }
        // User not found
        return c.json({ error: error.message }, 404)
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

  /**
   * POST /logout-all - Logout all sessions (requires auth)
   */
  async logoutAll(c: Context) {
    try {
      const userId = c.get('userId') as string

      const result = await this.authService.logoutAll(userId)

      return c.json({
        message: 'All sessions have been logged out',
        ...result,
      })
    } catch (error) {
      throw error
    }
  }

  /**
   * GET /sessions - Get active sessions (requires auth)
   */
  async getSessions(c: Context) {
    try {
      const userId = c.get('userId') as string

      const sessions = await this.authService.getActiveSessions(userId)

      return c.json({
        sessions: sessions.map((s: any) => ({
          id: s.id,
          deviceInfo: s.deviceInfo,
          ipAddress: s.ipAddress,
          expiresAt: s.expiresAt,
          createdAt: s.createdAt,
        })),
      })
    } catch (error) {
      throw error
    }
  }
}
