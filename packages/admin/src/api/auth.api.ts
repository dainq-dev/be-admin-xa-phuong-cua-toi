/**
 * Auth API Endpoints
 * All authentication-related API calls
 */

import type {
  LoginResponse,
  OTPRequestResponse,
  // TokenRefreshResponse,
  UserResponse,
} from '@phuong-xa/shared'
import apiClient from './client'

export interface LoginWithEmailRequest {
  email: string
  otp: string
}

export interface RequestOTPRequest {
  email: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export const AuthAPI = {
  /**
   * Request OTP for email login
   */
  async requestOTP(data: RequestOTPRequest): Promise<OTPRequestResponse> {
    return apiClient.post<OTPRequestResponse>('/auth/otp/request', data)
  },

  /**
   * Verify OTP and login
   */
  async loginWithEmail(data: LoginWithEmailRequest): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/auth/otp/verify', data)
  },

  /**
   * Refresh access token
   * NOTE: This is called automatically by the API client interceptor
   */
  async refreshToken(data: RefreshTokenRequest): Promise<any> {
    return apiClient.post<any>('/auth/refresh', data)
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<UserResponse> {
    return apiClient.get<UserResponse>('/auth/me')
  },

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    await apiClient.post('/auth/logout')
  },
}
