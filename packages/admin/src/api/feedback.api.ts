/**
 * Feedback API Endpoints
 */

import apiClient from './client'

export interface ListFeedbackParams {
  limit?: number
  offset?: number
  category?: string
  status?: string
  userId?: string
}

export interface UpdateFeedbackStatusRequest {
  status: string
  responseMessage?: string
  assignedTo?: string
}

export const FeedbackAPI = {
  /**
   * List feedback submissions with pagination and filters
   */
  async listFeedback(params?: ListFeedbackParams): Promise<any> {
    return apiClient.get('/feedback', { params })
  },

  /**
   * Get feedback by ID
   */
  async getFeedback(id: string): Promise<any> {
    return apiClient.get(`/feedback/${id}`)
  },

  /**
   * Update feedback status
   */
  async updateStatus(id: string, data: UpdateFeedbackStatusRequest): Promise<any> {
    return apiClient.patch(`/feedback/${id}/status`, data)
  },

  /**
   * Get feedback statistics
   */
  async getStats(): Promise<any> {
    return apiClient.get('/feedback/stats/summary')
  },
}
