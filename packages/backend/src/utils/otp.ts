/**
 * OTP Utilities
 */

import { cache } from '../lib/redis'
import { env } from '../lib/env'

/**
 * Generate OTP code
 */
export function generateOTP(): string {
  const digits = '0123456789'
  let otp = ''

  for (let i = 0; i < env.OTP_LENGTH; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)]
  }

  return otp
}

/**
 * Store OTP in Redis
 */
export async function storeOTP(email: string, otp: string): Promise<void> {
  const key = `otp:${email}`
  await cache.set(key, otp, env.OTP_EXPIRY)
}

/**
 * Verify OTP
 */
export async function verifyOTP(email: string, otp: string): Promise<boolean> {
  const key = `otp:${email}`
  const storedOTP = await cache.get<string>(key)

  if (!storedOTP || storedOTP !== otp) {
    return false
  }

  // Delete OTP after successful verification
  await cache.delete(key)
  return true
}

/**
 * Check if OTP exists
 */
export async function hasOTP(email: string): Promise<boolean> {
  const key = `otp:${email}`
  return await cache.exists(key)
}

/**
 * Get OTP TTL
 */
export async function getOTPTTL(email: string): Promise<number> {
  const key = `otp:${email}`
  return await cache.ttl(key)
}
