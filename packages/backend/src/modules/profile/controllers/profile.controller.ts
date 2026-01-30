/**
 * Profile Controller
 */

import { Context } from 'hono'
import { ProfileService } from '../services/profile.service'
import { updateProfileSchema, updateSettingsSchema, validateBody } from '../../../utils/validators'

export class ProfileController {
  constructor(private readonly service: ProfileService) {}

  /**
   * Get profile
   */
  async getProfile(c: Context) {
    const userId = c.get('userId') as string
    const user = await this.service.getProfile(userId)

    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }

    return c.json(user)
  }

  /**
   * Update profile
   */
  async updateProfile(c: Context) {
    const userId = c.get('userId') as string
    const body = await validateBody(await c.req.json(), updateProfileSchema)

    const user = await this.service.updateProfile(userId, body)
    return c.json(user)
  }

  /**
   * Get settings
   */
  async getSettings(c: Context) {
    const userId = c.get('userId') as string
    const settings = await this.service.getSettings(userId)
    return c.json(settings)
  }

  /**
   * Update settings
   */
  async updateSettings(c: Context) {
    const userId = c.get('userId') as string
    const body = await validateBody(await c.req.json(), updateSettingsSchema)

    const settings = await this.service.updateSettings(userId, body)
    return c.json(settings)
  }

  /**
   * Get feedback history
   */
  async getFeedbackHistory(c: Context) {
    const userId = c.get('userId') as string
    const result = await this.service.getFeedbackHistory(userId)
    return c.json(result)
  }
}
