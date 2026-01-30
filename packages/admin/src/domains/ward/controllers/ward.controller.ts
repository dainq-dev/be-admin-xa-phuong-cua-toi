/**
 * Ward Controller
 * Handles logic for ward-specific settings and customization
 */

import { WardAPI, type UpdateThemeRequest, type UpdateFeatureRequest } from '@/api/ward.api'
import { APIError } from '@/api/client'

export class WardController {
  /**
   * Get ward details
   */
  async getWard(id: string): Promise<any> {
    try {
      return await WardAPI.getWard(id)
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(error.data?.error || 'Không thể tải thông tin đơn vị')
      }
      throw new Error('Không thể tải thông tin đơn vị')
    }
  }

  /**
   * Get page theme
   */
  async getTheme(wardId: string, pageKey: string): Promise<any> {
    try {
      return await WardAPI.getTheme(wardId, pageKey)
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(error.data?.error || 'Không thể tải cấu hình giao diện')
      }
      throw new Error('Không thể tải cấu hình giao diện')
    }
  }

  /**
   * Update page theme
   */
  async updateTheme(wardId: string, data: UpdateThemeRequest): Promise<any> {
    try {
      return await WardAPI.updateTheme(wardId, data)
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(error.data?.error || 'Không thể cập nhật giao diện')
      }
      throw new Error('Không thể cập nhật giao diện')
    }
  }

  /**
   * Get feature flags
   */
  async getFeatures(wardId: string): Promise<any> {
    try {
      return await WardAPI.getFeatures(wardId)
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(error.data?.error || 'Không thể tải cấu hình tính năng')
      }
      throw new Error('Không thể tải cấu hình tính năng')
    }
  }

  /**
   * Update feature flag
   */
  async updateFeature(wardId: string, data: UpdateFeatureRequest): Promise<any> {
    try {
      return await WardAPI.updateFeature(wardId, data)
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(error.data?.error || 'Không thể cập nhật tính năng')
      }
      throw new Error('Không thể cập nhật tính năng')
    }
  }
}
