/**
 * OTP Service
 * OTP generation, storage, and verification
 */

import type { ICacheService } from '../../../core/cache/redis.client'
import { cache } from '../../../core/cache/redis.client'
import { env } from '../../../lib/env'

export class OTPService {
  constructor(private cacheClient: ICacheService = cache) {}

  /**
   * Generate OTP code
   */
  generate(): string {
    const digits = '0123456789'
    let otp = ''

    for (let i = 0; i < env.OTP_LENGTH; i++) {
      otp += digits[Math.floor(Math.random() * digits.length)]
    }

    return otp
  }

  /**
   * Store OTP in cache
   */
  async store(email: string, otp: string): Promise<void> {
    const key = this.buildKey(email)
    await this.cacheClient.set(key, otp, env.OTP_EXPIRY)
  }

  /**
   * Verify OTP
   */
  async verify(email: string, otp: string): Promise<boolean> {
    const key = this.buildKey(email)
    const storedOTP = await this.cacheClient.get<string>(key)

    if (!storedOTP || storedOTP !== otp) {
      return false
    }

    // Delete OTP after successful verification
    await this.cacheClient.delete(key)
    return true
  }

  /**
   * Check if OTP exists
   */
  async exists(email: string): Promise<boolean> {
    const key = this.buildKey(email)
    return await this.cacheClient.exists(key)
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
   * Build cache key for OTP
   */
  private buildKey(email: string): string {
    return `otp:${email}`
  }
}
