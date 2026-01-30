/**
 * OTP Service
 * OTP generation, storage, and verification with security features
 */

import { randomInt } from 'crypto'
import type { ICacheService } from '../../../core/cache/redis.client'
import { cache } from '../../../core/cache/redis.client'
import { env } from '../../../lib/env'

// Security constants
const MAX_OTP_ATTEMPTS = 5
const LOCKOUT_DURATION = 30 * 60 // 30 minutes in seconds
const RESEND_COOLDOWN = 60 // 60 seconds

export class OTPService {
  constructor(private cacheClient: ICacheService = cache) {}

  /**
   * Generate cryptographically secure OTP code
   */
  generate(): string {
    const min = Math.pow(10, env.OTP_LENGTH - 1)
    const max = Math.pow(10, env.OTP_LENGTH) - 1
    return randomInt(min, max + 1).toString()
  }

  /**
   * Store OTP in cache
   */
  async store(email: string, otp: string): Promise<void> {
    const key = this.buildKey(email)
    await this.cacheClient.set(key, otp, env.OTP_EXPIRY)
    // Reset attempt counter when new OTP is stored
    await this.cacheClient.delete(this.buildAttemptKey(email))
  }

  /**
   * Verify OTP with attempt limiting
   * Returns: { valid: boolean, locked?: boolean, attemptsRemaining?: number }
   */
  async verify(
    email: string,
    otp: string
  ): Promise<{ valid: boolean; locked?: boolean; attemptsRemaining?: number }> {
    // Check if locked
    if (await this.isLocked(email)) {
      const lockTTL = await this.cacheClient.ttl(this.buildLockKey(email))
      return { valid: false, locked: true, attemptsRemaining: 0 }
    }

    const key = this.buildKey(email)
    const storedOTP = await this.cacheClient.get<string>(key)

    if (!storedOTP) {
      return { valid: false, attemptsRemaining: MAX_OTP_ATTEMPTS }
    }

    if (storedOTP !== otp) {
      // Increment failed attempts
      const attempts = await this.incrementAttempts(email)
      const remaining = MAX_OTP_ATTEMPTS - attempts

      if (remaining <= 0) {
        // Lock the email
        await this.lock(email)
        // Delete OTP and attempts
        await this.cacheClient.delete(key)
        await this.cacheClient.delete(this.buildAttemptKey(email))
        return { valid: false, locked: true, attemptsRemaining: 0 }
      }

      return { valid: false, attemptsRemaining: remaining }
    }

    // Success - cleanup
    await Promise.all([
      this.cacheClient.delete(key),
      this.cacheClient.delete(this.buildAttemptKey(email)),
    ])

    return { valid: true }
  }

  /**
   * Check if OTP exists (for resend check)
   */
  async exists(email: string): Promise<boolean> {
    const key = this.buildKey(email)
    return await this.cacheClient.exists(key)
  }

  /**
   * Check resend cooldown
   * Returns remaining cooldown seconds, or 0 if can resend
   */
  async getResendCooldown(email: string): Promise<number> {
    const key = this.buildKey(email)
    const ttl = await this.cacheClient.ttl(key)

    if (ttl <= 0) return 0

    // If OTP was created less than RESEND_COOLDOWN seconds ago
    const otpAge = env.OTP_EXPIRY - ttl
    if (otpAge < RESEND_COOLDOWN) {
      return RESEND_COOLDOWN - otpAge
    }

    return 0
  }

  /**
   * Check if can request new OTP (respects cooldown)
   */
  async canRequestOTP(email: string): Promise<{ allowed: boolean; waitSeconds?: number }> {
    // Check if locked
    if (await this.isLocked(email)) {
      const lockTTL = await this.cacheClient.ttl(this.buildLockKey(email))
      return { allowed: false, waitSeconds: lockTTL }
    }

    // Check resend cooldown
    const cooldown = await this.getResendCooldown(email)
    if (cooldown > 0) {
      return { allowed: false, waitSeconds: cooldown }
    }

    return { allowed: true }
  }

  /**
   * Get OTP TTL (time to live in seconds)
   */
  async getTTL(email: string): Promise<number> {
    const key = this.buildKey(email)
    return await this.cacheClient.ttl(key)
  }

  /**
   * Delete OTP
   */
  async delete(email: string): Promise<void> {
    const key = this.buildKey(email)
    await this.cacheClient.delete(key)
  }

  /**
   * Check if email is locked due to too many attempts
   */
  async isLocked(email: string): Promise<boolean> {
    return await this.cacheClient.exists(this.buildLockKey(email))
  }

  /**
   * Get lock remaining time
   */
  async getLockTTL(email: string): Promise<number> {
    return await this.cacheClient.ttl(this.buildLockKey(email))
  }

  // ============================================
  // Private methods
  // ============================================

  private buildKey(email: string): string {
    return `otp:${email}`
  }

  private buildAttemptKey(email: string): string {
    return `otp:attempts:${email}`
  }

  private buildLockKey(email: string): string {
    return `otp:lock:${email}`
  }

  private async incrementAttempts(email: string): Promise<number> {
    const key = this.buildAttemptKey(email)
    const current = await this.cacheClient.get<number>(key)
    const newCount = (current || 0) + 1
    await this.cacheClient.set(key, newCount, env.OTP_EXPIRY)
    return newCount
  }

  private async lock(email: string): Promise<void> {
    const key = this.buildLockKey(email)
    await this.cacheClient.set(key, true, LOCKOUT_DURATION)
  }
}
