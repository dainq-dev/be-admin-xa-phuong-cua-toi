/**
 * Session Repository
 * Data access layer for User Sessions
 */

import type { UserSession } from '@prisma/client'
import type { PrismaClient } from '../../../core/database/prisma.client'
import type { PrismaTransaction } from '../../../core/database/prisma.client'
import type { CreateSessionData, SessionWithUser } from '../models/types'

export class SessionRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create new session
   */
  async create(
    data: CreateSessionData,
    tx?: PrismaTransaction
  ): Promise<UserSession> {
    const prisma = (tx ?? this.prisma) as any

    return await prisma.userSession.create({
      data,
    })
  }

  /**
   * Find session by token
   */
  async findByToken(
    token: string,
    includeUser = false,
    tx?: PrismaTransaction
  ): Promise<SessionWithUser | UserSession | null> {
    const prisma = (tx ?? this.prisma) as any

    return await prisma.userSession.findFirst({
      where: {
        token,
        expiresAt: { gt: new Date() },
      },
      include: includeUser ? { user: true } : undefined,
    })
  }

  /**
   * Find session by user and token
   */
  async findByUserAndToken(
    userId: string,
    token: string,
    includeUser = false,
    tx?: PrismaTransaction
  ): Promise<SessionWithUser | UserSession | null> {
    const prisma = (tx ?? this.prisma) as any

    return await prisma.userSession.findFirst({
      where: {
        userId,
        token,
        expiresAt: { gt: new Date() },
      },
      include: includeUser ? { user: true } : undefined,
    })
  }

  /**
   * Update session token
   */
  async updateToken(
    sessionId: string,
    newToken: string,
    expiresAt: Date,
    tx?: PrismaTransaction
  ): Promise<UserSession> {
    const prisma = (tx ?? this.prisma) as any

    return await prisma.userSession.update({
      where: { id: sessionId },
      data: {
        token: newToken,
        expiresAt,
      },
    })
  }

  /**
   * Delete session
   */
  async delete(
    userId: string,
    token: string,
    tx?: PrismaTransaction
  ): Promise<void> {
    const prisma = (tx ?? this.prisma) as any

    await prisma.userSession.deleteMany({
      where: {
        userId,
        token,
      },
    })
  }

  /**
   * Delete all sessions for user
   */
  async deleteAllForUser(
    userId: string,
    tx?: PrismaTransaction
  ): Promise<number> {
    const prisma = (tx ?? this.prisma) as any

    const result = await prisma.userSession.deleteMany({
      where: { userId },
    })

    return result.count
  }

  /**
   * Get all active sessions for user
   */
  async findAllByUser(
    userId: string,
    tx?: PrismaTransaction
  ): Promise<UserSession[]> {
    const prisma = (tx ?? this.prisma) as any

    return await prisma.userSession.findMany({
      where: {
        userId,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        deviceInfo: true,
        ipAddress: true,
        expiresAt: true,
        createdAt: true,
      },
    })
  }

  /**
   * Delete expired sessions (cleanup)
   */
  async deleteExpired(tx?: PrismaTransaction): Promise<number> {
    const prisma = (tx ?? this.prisma) as any

    const result = await prisma.userSession.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    })

    return result.count
  }
}
