/**
 * Session Service
 * Session management business logic
 */

import { SessionRepository } from '../repositories/session.repository'
import type { CreateSessionData } from '../models/types'

export class SessionService {
  constructor(private sessionRepository: SessionRepository) {}

  /**
   * Create new session
   */
  async createSession(data: CreateSessionData) {
    return await this.sessionRepository.create(data)
  }

  /**
   * Validate session by token
   */
  async validateSession(token: string) {
    const session = await this.sessionRepository.findByToken(token, true)

    if (!session) {
      throw new Error('Invalid or expired session')
    }

    // Type guard for SessionWithUser
    if (!('user' in session)) {
      throw new Error('Session user not loaded')
    }

    // Check user is active
    if (!session.user.isActive || session.user.deletedAt) {
      throw new Error('User is inactive or deleted')
    }

    return session
  }

  /**
   * Update session token (for refresh)
   */
  async updateSessionToken(
    sessionId: string,
    newToken: string,
    expiresAt: Date
  ) {
    return await this.sessionRepository.updateToken(
      sessionId,
      newToken,
      expiresAt
    )
  }

  /**
   * Delete session (logout)
   */
  async deleteSession(userId: string, token: string) {
    await this.sessionRepository.delete(userId, token)
  }

  /**
   * Delete all sessions for user (logout all devices)
   */
  async deleteAllUserSessions(userId: string) {
    await this.sessionRepository.deleteAllForUser(userId)
  }

  /**
   * Cleanup expired sessions
   */
  async cleanupExpiredSessions() {
    return await this.sessionRepository.deleteExpired()
  }

  /**
   * Calculate session expiry date
   */
  getSessionExpiry(days = 7): Date {
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000)
  }
}
