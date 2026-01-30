/**
 * Analytics API Endpoints
 */

import apiClient from './client'

export const AnalyticsAPI = {
  /**
   * Get dashboard summary
   */
  async getDashboard(): Promise<any> {
    return apiClient.get('/analytics/dashboard')
  },

  /**
   * Get feedback analytics
   */
  async getFeedbackAnalytics(): Promise<any> {
    return apiClient.get('/analytics/feedback')
  },
}
