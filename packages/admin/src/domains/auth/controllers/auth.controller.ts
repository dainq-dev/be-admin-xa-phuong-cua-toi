/**
 * Auth Controller
 * Handles control logic and API requests for authentication
 */

import { AuthAPI } from '@/api/auth.api'
import { TokenStorage } from '@/utils/token'
import { APIError } from '@/api/client'
import type { LoginResponse, OTPRequestResponse } from '@phuong-xa/shared'

export interface RequestOTPInput {
  email: string
}

export interface VerifyOTPInput {
  email: string
  otp: string
}

/**
 * Auth Controller
 * Orchestrates authentication flow
 */
export class AuthController {
  /**
   * Request OTP for email login
   */
  async requestOTP(input: RequestOTPInput): Promise<OTPRequestResponse> {
    try {
      const response = await AuthAPI.requestOTP(input)
      return response
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(error.data?.error || 'Không thể gửi mã OTP')
      }
      throw new Error('Không thể gửi mã OTP')
    }
  }

  /**
   * Verify OTP and login
   */
  async verifyOTPAndLogin(input: VerifyOTPInput): Promise<LoginResponse> {
    try {
      const response = await AuthAPI.loginWithEmail(input)

      // Save tokens
      TokenStorage.setTokens(response.accessToken, response.refreshToken)

      return response
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(error.data?.error || 'Đăng nhập thất bại')
      }
      throw new Error('Đăng nhập thất bại')
    }
  }

  /**
   * Get current user profile
   */
  async getProfile() {
    try {
      const user = await AuthAPI.getProfile()
      return user
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(error.data?.error || 'Không thể tải thông tin người dùng')
      }
      throw new Error('Không thể tải thông tin người dùng')
    }
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    try {
      await AuthAPI.logout()
    } catch (error) {
      console.error('Logout API failed:', error)
    } finally {
      // Always clear tokens
      TokenStorage.clearTokens()
    }
  }
}
