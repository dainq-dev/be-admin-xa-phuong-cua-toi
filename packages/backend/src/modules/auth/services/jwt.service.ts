/**
 * JWT Service
 * Token generation and verification
 */

import { SignJWT, jwtVerify } from 'jose'
import { env } from '../../../lib/env'
import type { AccessTokenPayload, RefreshTokenPayload, TokenPair } from '../models/types'

/**
 * Convert expiry strings to seconds
 */
function expiryToSeconds(expiry: string): number {
  const unit = expiry.slice(-1)
  const value = parseInt(expiry.slice(0, -1))

  switch (unit) {
    case 's':
      return value
    case 'm':
      return value * 60
    case 'h':
      return value * 60 * 60
    case 'd':
      return value * 24 * 60 * 60
    default:
      return 900 // Default 15 minutes
  }
}

export class JWTService {
  /**
   * Generate Access Token
   */
  async generateAccessToken(payload: AccessTokenPayload): Promise<string> {
    const secret = new TextEncoder().encode(env.JWT_SECRET)
    const expiresIn = expiryToSeconds(env.JWT_ACCESS_EXPIRY)

    return await new SignJWT({ ...payload })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(Math.floor(Date.now() / 1000) + expiresIn)
      .sign(secret)
  }

  /**
   * Generate Refresh Token
   */
  async generateRefreshToken(payload: RefreshTokenPayload): Promise<string> {
    const secret = new TextEncoder().encode(env.JWT_REFRESH_SECRET)
    const expiresIn = expiryToSeconds(env.JWT_REFRESH_EXPIRY)

    return await new SignJWT({ ...payload })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(Math.floor(Date.now() / 1000) + expiresIn)
      .sign(secret)
  }

  /**
   * Verify Access Token
   */
  async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    try {
      const secret = new TextEncoder().encode(env.JWT_SECRET)
      const { payload } = await jwtVerify(token, secret)
      return payload as unknown as AccessTokenPayload
    } catch (error) {
      throw new Error('Invalid or expired access token')
    }
  }

  /**
   * Verify Refresh Token
   */
  async verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    try {
      const secret = new TextEncoder().encode(env.JWT_REFRESH_SECRET)
      const { payload } = await jwtVerify(token, secret)
      return payload as unknown as RefreshTokenPayload
    } catch (error) {
      throw new Error('Invalid or expired refresh token')
    }
  }

  /**
   * Generate token pair (access + refresh)
   */
  async generateTokenPair(payload: AccessTokenPayload): Promise<TokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(payload),
      this.generateRefreshToken({ userId: payload.userId }),
    ])

    return { accessToken, refreshToken }
  }
}
