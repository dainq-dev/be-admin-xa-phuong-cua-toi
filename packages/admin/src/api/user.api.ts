/**
 * User API Endpoints
 */

import apiClient from './client'

export interface ListUsersParams {
  role?: string
  search?: string
  limit?: number
  offset?: number
}

export interface UpdateUserRequest {
  name?: string
  role?: string
  isActive?: boolean
  phoneNumber?: string
}

export const UserAPI = {
  /**
   * List users in the current ward
   */
  async listUsers(params?: ListUsersParams): Promise<any> {
    // Current backend might need a specific endpoint for this
    // For now, using a generic /auth logic or similar
    return apiClient.get('/profile/all', { params }) // Assuming we add this or similar
  },

  /**
   * Get user profile
   */
  async getUser(id: string): Promise<any> {
    return apiClient.get(`/profile/${id}`)
  },

  /**
   * Update user
   */
  async updateUser(id: string, data: UpdateUserRequest): Promise<any> {
    return apiClient.patch(`/profile/${id}`, data)
  },
}
