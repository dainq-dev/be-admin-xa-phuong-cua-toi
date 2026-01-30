/**
 * Contacts Controller
 * Handles logic for staff and emergency contacts
 */

import { ContactsAPI, type ListContactsParams, type CreateContactRequest, type UpdateContactRequest } from '@/api/contacts.api'
import { APIError } from '@/api/client'

export class ContactsController {
  /**
   * List contacts
   */
  async listContacts(params?: ListContactsParams): Promise<any> {
    try {
      return await ContactsAPI.listContacts(params)
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(error.data?.error || 'Không thể tải danh sách liên hệ')
      }
      throw new Error('Không thể tải danh sách liên hệ')
    }
  }

  /**
   * List emergency contacts
   */
  async listEmergencyContacts(): Promise<any> {
    try {
      return await ContactsAPI.listEmergencyContacts()
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(error.data?.error || 'Không thể tải danh sách liên hệ khẩn cấp')
      }
      throw new Error('Không thể tải danh sách liên hệ khẩn cấp')
    }
  }

  /**
   * Create contact
   */
  async createContact(data: CreateContactRequest): Promise<any> {
    try {
      return await ContactsAPI.createContact(data)
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(error.data?.error || 'Không thể tạo liên hệ')
      }
      throw new Error('Không thể tạo liên hệ')
    }
  }

  /**
   * Update contact
   */
  async updateContact(id: string, data: UpdateContactRequest): Promise<any> {
    try {
      return await ContactsAPI.updateContact(id, data)
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(error.data?.error || 'Không thể cập nhật liên hệ')
      }
      throw new Error('Không thể cập nhật liên hệ')
    }
  }

  /**
   * Delete contact
   */
  async deleteContact(id: string): Promise<void> {
    try {
      await ContactsAPI.deleteContact(id)
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(error.data?.error || 'Không thể xóa liên hệ')
      }
      throw new Error('Không thể xóa liên hệ')
    }
  }
}
