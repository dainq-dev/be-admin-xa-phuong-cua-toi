/**
 * Auth Service
 * Main authentication business logic orchestrator
 */

import type { PrismaClient } from '../../../core/database/prisma.client'
import { UserRepository } from '../repositories/user.repository'
import { SessionRepository } from '../repositories/session.repository'
import { JWTService } from './jwt.service'
import { OTPService } from './otp.service'
import { SessionService } from './session.service'
import { ZaloService } from './zalo.service'
import { sendOTPEmail } from '../../../lib/email'
import type {
  ZaloLoginInput,
  EmailLoginInput,
  VerifyOTPInput,
  RefreshTokenInput,
  LoginResponse,
  OTPRequestResponse,
  TokenRefreshResponse,
  UserResponse,
} from '../models/types'

export class AuthService {
  constructor(
    private prisma: PrismaClient,
    private userRepository: UserRepository,
    private sessionRepository: SessionRepository,
    private jwtService: JWTService,
    private otpService: OTPService,
    private sessionService: SessionService,
    private zaloService: ZaloService
  ) {}

  /**
   * Zalo OAuth Login
   */
  async loginWithZalo(
    input: ZaloLoginInput,
    deviceInfo?: Record<string, any>,
    ipAddress?: string
  ): Promise<LoginResponse> {
    // Verify Zalo access token (if enabled)
    const zaloResult = await this.zaloService.validateZaloId(
      input.zaloAccessToken,
      input.zaloId
    )

    if (!zaloResult.valid) {
      throw new Error(zaloResult.error || 'Invalid Zalo token')
    }

    // Find or create user in transaction
    const user = await this.prisma.$transaction(async (tx) => {
      let existingUser = await this.userRepository.findByZaloId(
        input.zaloId,
        tx
      )

      if (!existingUser) {
        // Create new user
        const newUser = await this.userRepository.create(
          {
            zaloId: input.zaloId,
            name: input.name,
            avatarUrl: input.avatar,
            phoneNumber: input.phoneNumber,
            role: 'citizen',
          },
          tx
        )

        // Create default settings
        await this.userRepository.createUserSettings(newUser.id, tx)

        return newUser
      }

      return existingUser
    })

    // Check if user is active
    if (!user.isActive || user.deletedAt) {
      throw new Error('Account is inactive or deleted')
    }

    // Generate tokens
    const tokens = await this.jwtService.generateTokenPair({
      userId: user.id,
      zaloId: user.zaloId!,
      role: user.role,
      wardId: user.wardId || undefined,
    })

    // Create session
    await this.sessionService.createSession({
      userId: user.id,
      token: tokens.refreshToken,
      deviceInfo,
      ipAddress,
      expiresAt: this.sessionService.getSessionExpiry(),
    })

    return {
      user: this.formatUserResponse(user),
      ...tokens,
    }
  }

  /**
   * Request OTP for email login (Step 1)
   */
  async requestOTP(input: EmailLoginInput): Promise<OTPRequestResponse> {
    // Check if user exists and is admin/staff
    const user = await this.userRepository.findByEmail(input.email)

    if (!user) {
      throw new Error('Không tìm thấy thông tin quản trị viên')
    }

    if (!['admin', 'staff'].includes(user.role)) {
      throw new Error('Not authorized')
    }

    if (!user.isActive || user.deletedAt) {
      throw new Error('Account is inactive or deleted')
    }

    // Check if can request OTP (respects cooldown and lockout)
    const canRequest = await this.otpService.canRequestOTP(input.email)
    if (!canRequest.allowed) {
      const isLocked = await this.otpService.isLocked(input.email)
      if (isLocked) {
        throw new Error(
          `Account temporarily locked due to too many failed attempts. Try again in ${canRequest.waitSeconds} seconds`
        )
      }
      throw new Error(
        `Please wait ${canRequest.waitSeconds} seconds before requesting a new OTP`
      )
    }

    // Generate and store OTP
    const otp = this.otpService.generate()
    await this.otpService.store(input.email, otp)

    // Send email
    try {
      await sendOTPEmail(input.email, otp, user.name)
    } catch (error) {
      console.error('Failed to send OTP email:', error)
      throw new Error('Failed to send OTP email')
    }

    return {
      message: 'OTP sent successfully',
      email: input.email,
      expiresIn: 300, // 5 minutes
    }
  }

  /**
   * Verify OTP and login (Step 2)
   */
  async verifyOTPAndLogin(
    input: VerifyOTPInput,
    deviceInfo?: Record<string, any>,
    ipAddress?: string
  ): Promise<LoginResponse> {
    // Verify OTP with attempt tracking
    const result = await this.otpService.verify(input.email, input.otp)

    if (!result.valid) {
      if (result.locked) {
        const lockTTL = await this.otpService.getLockTTL(input.email)
        throw new Error(
          `Account temporarily locked due to too many failed attempts. Try again in ${lockTTL} seconds`
        )
      }

      if (result.attemptsRemaining !== undefined && result.attemptsRemaining > 0) {
        throw new Error(
          `Invalid OTP. ${result.attemptsRemaining} attempts remaining`
        )
      }

      throw new Error('Invalid or expired OTP')
    }

    // Get user with ward
    const user = await this.userRepository.findByEmail(input.email, true)

    if (!user || !user.isActive || user.deletedAt) {
      throw new Error('User not found or inactive')
    }

    // Generate tokens
    const tokens = await this.jwtService.generateTokenPair({
      userId: user.id,
      email: user.email!,
      role: user.role,
      wardId: user.wardId || undefined,
    })

    // Create session
    await this.sessionService.createSession({
      userId: user.id,
      token: tokens.refreshToken,
      deviceInfo,
      ipAddress,
      expiresAt: this.sessionService.getSessionExpiry(),
    })

    return {
      user: this.formatUserResponse(user),
      ...tokens,
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(input: RefreshTokenInput): Promise<TokenRefreshResponse> {
    try {
      // Verify refresh token
      const payload = await this.jwtService.verifyRefreshToken(
        input.refreshToken
      )

      // Validate session
      const session = await this.sessionService.validateSession(
        input.refreshToken
      )

      // Generate new tokens
      const tokens = await this.jwtService.generateTokenPair({
        userId: session.user.id,
        email: session.user.email || undefined,
        zaloId: session.user.zaloId || undefined,
        role: session.user.role,
        wardId: session.user.wardId || undefined,
      })

      // Update session
      await this.sessionService.updateSessionToken(
        session.id,
        tokens.refreshToken,
        this.sessionService.getSessionExpiry()
      )

      return tokens
    } catch (error) {
      throw new Error('Invalid refresh token')
    }
  }

  /**
   * Logout (delete session)
   */
  async logout(userId: string, token: string): Promise<void> {
    await this.sessionService.deleteSession(userId, token)
  }

  /**
   * Logout all sessions for a user
   */
  async logoutAll(userId: string): Promise<{ deletedCount: number }> {
    const count = await this.sessionService.deleteAllUserSessions(userId)
    return { deletedCount: count }
  }

  /**
   * Get active sessions for a user
   */
  async getActiveSessions(userId: string) {
    return await this.sessionService.getUserSessions(userId)
  }

  /**
   * Get current user info
   */
  async getCurrentUser(userId: string): Promise<UserResponse> {
    const user = await this.userRepository.findById(userId, true)

    if (!user) {
      throw new Error('User not found')
    }

    return this.formatUserResponse(user)
  }

  /**
   * Format user for response
   */
  private formatUserResponse(user: any): UserResponse {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      zaloId: user.zaloId,
      avatarUrl: user.avatarUrl,
      role: user.role,
      wardId: user.wardId,
      ward: user.ward
        ? {
            id: user.ward.id,
            name: user.ward.name,
            code: user.ward.code,
          }
        : null,
    }
  }
}
