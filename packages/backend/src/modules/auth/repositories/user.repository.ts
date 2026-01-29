/**
 * User Repository
 * Data access layer for Users
 */

import type { User } from '@prisma/client'
import type { PrismaClient } from '../../../core/database/prisma.client'
import type { PrismaTransaction } from '../../../core/database/prisma.client'
import type { CreateUserData, UserWithWard } from '../models/types'

export class UserRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Find user by Zalo ID
   */
  async findByZaloId(
    zaloId: string,
    tx?: PrismaTransaction
  ): Promise<User | null> {
    const prisma = (tx ?? this.prisma) as any

    return await prisma.user.findUnique({
      where: { zaloId },
    })
  }

  /**
   * Find user by email
   */
  async findByEmail(
    email: string,
    includeWard = false,
    tx?: PrismaTransaction
  ): Promise<UserWithWard | null> {
    const prisma = (tx ?? this.prisma) as any

    return await prisma.user.findUnique({
      where: { email },
      include: includeWard ? { ward: true } : undefined,
    })
  }

  /**
   * Find user by ID
   */
  async findById(
    id: string,
    includeWard = false,
    tx?: PrismaTransaction
  ): Promise<UserWithWard | null> {
    const prisma = (tx ?? this.prisma) as any

    return await prisma.user.findUnique({
      where: { id },
      include: includeWard ? { ward: true } : undefined,
    })
  }

  /**
   * Create new user
   */
  async create(
    data: CreateUserData,
    tx?: PrismaTransaction
  ): Promise<User> {
    const prisma = (tx ?? this.prisma) as any

    return await prisma.user.create({
      data,
    })
  }

  /**
   * Create user settings
   */
  async createUserSettings(
    userId: string,
    tx?: PrismaTransaction
  ): Promise<void> {
    const prisma = (tx ?? this.prisma) as any

    await prisma.userSettings.create({
      data: { userId },
    })
  }

  /**
   * Check if user is active
   */
  async isUserActive(userId: string, tx?: PrismaTransaction): Promise<boolean> {
    const prisma = (tx ?? this.prisma) as any

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isActive: true, deletedAt: true },
    })

    return user ? user.isActive && user.deletedAt === null : false
  }

  /**
   * Check if user has admin/staff role
   */
  async isAdminOrStaff(userId: string, tx?: PrismaTransaction): Promise<boolean> {
    const prisma = (tx ?? this.prisma) as any

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    return user ? ['admin', 'staff'].includes(user.role) : false
  }
}
