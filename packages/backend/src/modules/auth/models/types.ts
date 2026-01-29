/**
 * Auth Module Types & DTOs
 * Type definitions for Authentication domain
 */

import type { User, UserSession, Ward } from '@prisma/client'

// ============================================
// INPUT DTOs
// ============================================

/**
 * Zalo OAuth login input
 */
export interface ZaloLoginInput {
  zaloAccessToken: string
  zaloId: string
  name: string
  avatar?: string
  phoneNumber?: string
}

/**
 * Email OTP login input
 */
export interface EmailLoginInput {
  email: string
}

/**
 * OTP verification input
 */
export interface VerifyOTPInput {
  email: string
  otp: string
}

/**
 * Token refresh input
 */
export interface RefreshTokenInput {
  refreshToken: string
}

// ============================================
// JWT PAYLOAD TYPES
// ============================================

export interface AccessTokenPayload {
  userId: string
  email?: string
  zaloId?: string
  role: string
  wardId?: string
}

export interface RefreshTokenPayload {
  userId: string
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

// ============================================
// USER TYPES
// ============================================

/**
 * User with Ward relation
 */
export type UserWithWard = User & {
  ward?: Ward | null
}

/**
 * Create user data
 */
export interface CreateUserData {
  zaloId?: string | null
  email?: string | null
  name: string
  avatarUrl?: string | null
  phoneNumber?: string | null
  role: string
  wardId?: string | null
}

// ============================================
// SESSION TYPES
// ============================================

/**
 * Create session data
 */
export interface CreateSessionData {
  userId: string
  token: string
  deviceInfo?: Record<string, any>
  ipAddress?: string | null
  expiresAt: Date
}

/**
 * Session with User relation
 */
export type SessionWithUser = UserSession & {
  user: User
}

// ============================================
// RESPONSE DTOs
// ============================================

/**
 * User info in auth responses
 */
export interface UserResponse {
  id: string
  name: string
  email?: string | null
  zaloId?: string | null
  avatarUrl?: string | null
  role: string
  wardId?: string | null
  ward?: {
    id: string
    name: string
    code: string
  } | null
}

/**
 * Login response with user & tokens
 */
export interface LoginResponse {
  user: UserResponse
  accessToken: string
  refreshToken: string
}

/**
 * OTP request response
 */
export interface OTPRequestResponse {
  message: string
  email: string
  expiresIn: number
}

/**
 * Token refresh response
 */
export interface TokenRefreshResponse {
  accessToken: string
  refreshToken: string
}

/**
 * Current user response
 */
export interface CurrentUserResponse {
  user: UserResponse
}

// ============================================
// OTP TYPES
// ============================================

export interface OTPData {
  code: string
  email: string
  expiresAt: Date
}
