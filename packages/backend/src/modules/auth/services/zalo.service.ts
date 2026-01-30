/**
 * Zalo Service
 * Verify Zalo access tokens and fetch user info
 *
 * Documentation: https://developers.zalo.me/docs/api/social-api-4
 *
 * NOTE: This service requires ZALO_VERIFY_ENABLED=true and valid
 * ZALO_APP_ID + ZALO_APP_SECRET to actually verify tokens.
 * Without these, verification is skipped (development mode).
 */

import { env } from '../../../lib/env'

export interface ZaloUserInfo {
  id: string
  name: string
  picture?: {
    data?: {
      url?: string
    }
  }
}

export interface ZaloVerifyResult {
  valid: boolean
  user?: ZaloUserInfo
  error?: string
}

export class ZaloService {
  private readonly apiUrl = 'https://graph.zalo.me/v2.0/me'

  /**
   * Check if Zalo verification is enabled
   */
  isEnabled(): boolean {
    return !!(
      env.ZALO_APP_ID &&
      env.ZALO_APP_SECRET &&
      process.env.ZALO_VERIFY_ENABLED === 'true'
    )
  }

  /**
   * Verify Zalo access token and get user info
   *
   * @param accessToken - Zalo access token from Mini App
   * @returns ZaloVerifyResult with user info if valid
   */
  async verifyAccessToken(accessToken: string): Promise<ZaloVerifyResult> {
    // Skip verification if not enabled (development mode)
    if (!this.isEnabled()) {
      console.warn('[ZaloService] Verification disabled - skipping token check')
      return { valid: true }
    }

    try {
      // Call Zalo API to verify token and get user info
      const response = await fetch(
        `${this.apiUrl}?access_token=${encodeURIComponent(accessToken)}&fields=id,name,picture`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as {
          message?: string
        }
        console.error('[ZaloService] API error:', errorData)
        return {
          valid: false,
          error: errorData.message || 'Invalid token',
        }
      }

      const data = (await response.json()) as {
        id?: string
        name?: string
        picture?: { data?: { url?: string } }
      }

      // Check if we got a valid user ID
      if (!data.id) {
        return {
          valid: false,
          error: 'Invalid response from Zalo API',
        }
      }

      return {
        valid: true,
        user: {
          id: data.id,
          name: data.name || '',
          picture: data.picture,
        },
      }
    } catch (error) {
      console.error('[ZaloService] Verification failed:', error)
      return {
        valid: false,
        error: 'Failed to verify token',
      }
    }
  }

  /**
   * Validate that the provided Zalo ID matches the token
   *
   * @param accessToken - Zalo access token
   * @param expectedZaloId - The Zalo ID provided by client
   * @returns true if the token belongs to the expected user
   */
  async validateZaloId(
    accessToken: string,
    expectedZaloId: string
  ): Promise<{ valid: boolean; error?: string }> {
    const result = await this.verifyAccessToken(accessToken)

    if (!result.valid) {
      return { valid: false, error: result.error }
    }

    // If verification is disabled, trust the client
    if (!result.user) {
      return { valid: true }
    }

    // Check if Zalo ID matches
    if (result.user.id !== expectedZaloId) {
      return {
        valid: false,
        error: 'Zalo ID does not match token',
      }
    }

    return { valid: true }
  }
}
