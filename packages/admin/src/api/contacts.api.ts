/**
 * Contacts API Endpoints
 */

import apiClient from './client'

export interface ListContactsParams {
  department?: string
}

export interface CreateContactRequest {
  name: string
  position?: string
  department: string
  phoneNumber: string
  alternatePhone?: string
  email?: string
  officeLocation?: string
  workingHours?: string
  isEmergency?: boolean
  displayOrder?: number
}

export interface UpdateContactRequest extends Partial<CreateContactRequest> {}

export const ContactsAPI = {
  /**
   * List all contacts
   */
  async listContacts(params?: ListContactsParams): Promise<any> {
    return apiClient.get('/contacts', { params })
  },

  /**
   * List emergency contacts
   */
  async listEmergencyContacts(): Promise<any> {
    return apiClient.get('/contacts/emergency')
  },

  /**
   * Create new contact
   */
  async createContact(data: CreateContactRequest): Promise<any> {
    return apiClient.post('/contacts', data)
  },

  /**
   * Update contact
   */
  async updateContact(id: string, data: UpdateContactRequest): Promise<any> {
    return apiClient.patch(`/contacts/${id}`, data)
  },

  /**
   * Delete contact
   */
  async deleteContact(id: string): Promise<void> {
    await apiClient.delete(`/contacts/${id}`)
  },

  /**
   * Create emergency contact
   */
  async createEmergencyContact(data: any): Promise<any> {
    return apiClient.post('/contacts/emergency', data)
  },
}
