/**
 * Analytics Controller
 * Handles logic for dashboard statistics and reports
 */

import { AnalyticsAPI } from '@/api/analytics.api'
import { APIError } from '@/api/client'

export class AnalyticsController {
  /**
   * Get dashboard summary
   */
  async getDashboard(): Promise<any> {
    try {
      return await AnalyticsAPI.getDashboard()
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(error.data?.error || 'Không thể tải thống kê tổng quan')
      }
      throw new Error('Không thể tải thống kê tổng quan')
    }
  }

  /**
   * Get feedback analytics
   */
  async getFeedbackAnalytics(): Promise<any> {
    try {
      return await AnalyticsAPI.getFeedbackAnalytics()
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(error.data?.error || 'Không thể tải phân tích phản ánh')
      }
      throw new Error('Không thể tải phân tích phản ánh')
    }
  }
}
