/**
 * Profile Service
 */

import { ProfileRepository } from '../repositories/profile.repository'

export class ProfileService {
  constructor(private readonly repository: ProfileRepository) {}

  /**
   * Get user profile with details
   */
  async getProfile(userId: string) {
    return this.repository.findUserWithDetails(userId)
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: any) {
    return this.repository.updateUser(userId, data)
  }

  /**
   * Get user settings
   */
  async getSettings(userId: string) {
    let settings = await this.repository.findSettingsByUserId(userId)

    if (!settings) {
      settings = await this.repository.createSettings(userId)
    }

    return settings
  }

  /**
   * Update user settings
   */
  async updateSettings(userId: string, data: any) {
    return this.repository.upsertSettings(userId, data)
  }

  /**
   * Get user's feedback history with stats
   */
  async getFeedbackHistory(userId: string) {
    const feedbacks = await this.repository.findFeedbackHistory(userId)

    const [totalCount, pendingCount, resolvedCount] = await Promise.all([
      this.repository.countFeedbacks({ userId }),
      this.repository.countFeedbacks({ 
        userId, 
        status: { in: ['pending', 'reviewing', 'in_progress'] } 
      }),
      this.repository.countFeedbacks({ userId, status: 'resolved' }),
    ])

    return {
      feedbacks,
      totalCount,
      pendingCount,
      resolvedCount,
    }
  }
}
