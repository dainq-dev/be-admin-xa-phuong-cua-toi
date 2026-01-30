/**
 * Wards Service
 */

import { WardsRepository } from '../repositories/wards.repository'

export class WardsService {
  constructor(private readonly repository: WardsRepository) {}

  /**
   * List all active wards
   */
  async listWards() {
    return this.repository.findAllActive()
  }

  /**
   * Get ward details
   */
  async getWardDetails(id: string) {
    return this.repository.findById(id)
  }

  /**
   * Get page theme for a ward
   */
  async getPageTheme(wardId: string, pageKey: string) {
    const theme = await this.repository.findPageTheme(wardId, pageKey)

    if (!theme) {
      // Return default empty config if not found
      return {
        pageKey,
        themeConfig: {},
        isActive: true,
      }
    }

    return theme
  }

  /**
   * Update page theme (Admin only)
   */
  async updatePageTheme(wardId: string, data: any) {
    return this.repository.upsertPageTheme(wardId, data.pageKey, data)
  }

  /**
   * Get feature flags for a ward
   */
  async getFeatureFlags(wardId: string) {
    return this.repository.findFeatureFlags(wardId)
  }

  /**
   * Update feature flag (Admin only)
   */
  async updateFeatureFlag(wardId: string, data: any) {
    return this.repository.upsertFeatureFlag(wardId, data.featureKey, data)
  }
}
