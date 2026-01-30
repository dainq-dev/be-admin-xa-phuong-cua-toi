/**
 * Feedback Controller
 * Handles logic for citizen feedback management
 */

import { FeedbackAPI, type ListFeedbackParams, type UpdateFeedbackStatusRequest } from '@/api/feedback.api'
import { APIError } from '@/api/client'

export class FeedbackController {
  /**
   * List feedback submissions
   */
  async listFeedback(params?: ListFeedbackParams): Promise<any> {
    try {
      return await FeedbackAPI.listFeedback(params)
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(error.data?.error || 'Không thể tải danh sách phản ánh')
      }
      throw new Error('Không thể tải danh sách phản ánh')
    }
  }

  /**
   * Get feedback details
   */
  async getFeedback(id: string): Promise<any> {
    try {
      return await FeedbackAPI.getFeedback(id)
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(error.data?.error || 'Không thể tải chi tiết phản ánh')
      }
      throw new Error('Không thể tải chi tiết phản ánh')
    }
  }

  /**
   * Update feedback status
   */
  async updateStatus(id: string, data: UpdateFeedbackStatusRequest): Promise<any> {
    try {
      return await FeedbackAPI.updateStatus(id, data)
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(error.data?.error || 'Không thể cập nhật trạng thái phản ánh')
      }
      throw new Error('Không thể cập nhật trạng thái phản ánh')
    }
  }

  /**
   * Get stats summary
   */
  async getStats(): Promise<any> {
    try {
      return await FeedbackAPI.getStats()
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(error.data?.error || 'Không thể tải thống kê phản ánh')
      }
      throw new Error('Không thể tải thống kê phản ánh')
    }
  }
}
