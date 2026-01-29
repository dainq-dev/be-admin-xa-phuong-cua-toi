/**
 * JWT Utilities
 * Token generation and verification using jose
 */

import { SignJWT, jwtVerify } from 'jose'
import { env } from './env'

// Token payload types
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

// Convert expiry strings to seconds
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

/**
 * Generate Access Token
 */
export async function generateAccessToken(
  payload: AccessTokenPayload
): Promise<string> {
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
export async function generateRefreshToken(
  payload: RefreshTokenPayload
): Promise<string> {
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
export async function verifyAccessToken(
  token: string
): Promise<AccessTokenPayload> {
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
export async function verifyRefreshToken(
  token: string
): Promise<RefreshTokenPayload> {
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
export async function generateTokenPair(payload: AccessTokenPayload) {
  const [accessToken, refreshToken] = await Promise.all([
    generateAccessToken(payload),
    generateRefreshToken({ userId: payload.userId }),
  ])

  return { accessToken, refreshToken }
}
