/**
 * User Controller
 * Handles logic for citizen and staff user management
 */

import { UserAPI, type ListUsersParams, type UpdateUserRequest } from '@/api/user.api'
import { APIError } from '@/api/client'

export class UserController {
  /**
   * List users
   */
  async listUsers(params?: ListUsersParams): Promise<any> {
    try {
      return await UserAPI.listUsers(params)
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(error.data?.error || 'Không thể tải danh sách người dùng')
      }
      throw new Error('Không thể tải danh sách người dùng')
    }
  }

  /**
   * Get user details
   */
  async getUser(id: string): Promise<any> {
    try {
      return await UserAPI.getUser(id)
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(error.data?.error || 'Không thể tải thông tin người dùng')
      }
      throw new Error('Không thể tải thông tin người dùng')
    }
  }

  /**
   * Update user
   */
  async updateUser(id: string, data: UpdateUserRequest): Promise<any> {
    try {
      return await UserAPI.updateUser(id, data)
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(error.data?.error || 'Không thể cập nhật người dùng')
      }
      throw new Error('Không thể cập nhật người dùng')
    }
  }
}
