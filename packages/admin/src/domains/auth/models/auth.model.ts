/**
 * Auth Domain Model
 * Business data and logic for authentication
 */

import type { UserResponse } from '@phuong-xa/shared'

export interface LoginCredentials {
  email: string
  otp: string
}

export interface OTPRequest {
  email: string
}

/**
 * Auth Model
 * Encapsulates authentication business logic
 */
export class AuthModel {
  /**
   * Validate email format
   */
  static validateEmail(email: string): { valid: boolean; error?: string } {
    if (!email) {
      return { valid: false, error: 'Email là bắt buộc' }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { valid: false, error: 'Email không hợp lệ' }
    }

    return { valid: true }
  }

  /**
   * Validate OTP format
   */
  static validateOTP(otp: string): { valid: boolean; error?: string } {
    if (!otp) {
      return { valid: false, error: 'Mã OTP là bắt buộc' }
    }

    if (otp.length !== 6) {
      return { valid: false, error: 'Mã OTP phải có 6 chữ số' }
    }

    if (!/^\d+$/.test(otp)) {
      return { valid: false, error: 'Mã OTP chỉ chứa số' }
    }

    return { valid: true }
  }

  /**
   * Check if user has admin role
   */
  static isAdmin(user: UserResponse): boolean {
    return user.role === 'ADMIN'
  }

  /**
   * Check if user has staff role
   */
  static isStaff(user: UserResponse): boolean {
    return user.role === 'STAFF' || user.role === 'ADMIN'
  }

  /**
   * Check if user can manage news
   */
  static canManageNews(user: UserResponse): boolean {
    return this.isStaff(user)
  }

  /**
   * Check if user can manage documents
   */
  static canManageDocuments(user: UserResponse): boolean {
    return this.isStaff(user)
  }

  /**
   * Get user display name
   */
  static getDisplayName(user: UserResponse): string {
    return user.name || user.email || 'Unknown User'
  }
}
