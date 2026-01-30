/**
 * Ward API Endpoints
 */

import apiClient from './client'

export interface UpdateThemeRequest {
  pageKey: string
  themeConfig: any
  isActive?: boolean
}

export interface UpdateFeatureRequest {
  featureKey: string
  isEnabled: boolean
  config?: any
}

export const WardAPI = {
  /**
   * Get ward details
   */
  async getWard(id: string): Promise<any> {
    return apiClient.get(`/wards/${id}`)
  },

  /**
   * Get page theme
   */
  async getTheme(wardId: string, pageKey: string): Promise<any> {
    return apiClient.get(`/wards/${wardId}/theme/${pageKey}`)
  },

  /**
   * Update page theme
   */
  async updateTheme(wardId: string, data: UpdateThemeRequest): Promise<any> {
    return apiClient.put(`/wards/${wardId}/theme`, data)
  },

  /**
   * Get feature flags
   */
  async getFeatures(wardId: string): Promise<any> {
    return apiClient.get(`/wards/${wardId}/features`)
  },

  /**
   * Update feature flag
   */
  async updateFeature(wardId: string, data: UpdateFeatureRequest): Promise<any> {
    return apiClient.put(`/wards/${wardId}/features`, data)
  },
}
