/**
 * Profile Repository
 */

import { PrismaClient } from '@prisma/client'

export class ProfileRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Find user by ID with ward and settings
   */
  async findUserWithDetails(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        ward: {
          select: {
            id: true,
            name: true,
            code: true,
            contactInfo: true,
          },
        },
        settings: true,
      },
    })
  }

  /**
   * Update user profile
   */
  async updateUser(id: string, data: any) {
    return this.prisma.user.update({
      where: { id },
      data,
    })
  }

  /**
   * Find user settings by user ID
   */
  async findSettingsByUserId(userId: string) {
    return this.prisma.userSettings.findUnique({
      where: { userId },
    })
  }

  /**
   * Create user settings
   */
  async createSettings(userId: string) {
    return this.prisma.userSettings.create({
      data: { userId },
    })
  }

  /**
   * Upsert user settings
   */
  async upsertSettings(userId: string, data: any) {
    return this.prisma.userSettings.upsert({
      where: { userId },
      create: {
        userId,
        ...data,
      },
      update: data,
    })
  }

  /**
   * Find feedback history for user
   */
  async findFeedbackHistory(userId: string) {
    return this.prisma.feedbackSubmission.findMany({
      where: { userId },
      include: {
        photos: {
          orderBy: { uploadOrder: 'asc' },
        },
        ward: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * Count feedbacks by user and conditions
   */
  async countFeedbacks(where: any) {
    return this.prisma.feedbackSubmission.count({ where })
  }
}
