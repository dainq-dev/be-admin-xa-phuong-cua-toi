/**
 * Contacts Service
 */

import { ContactsRepository } from '../repositories/contacts.repository'

export class ContactsService {
  constructor(private readonly repository: ContactsRepository) {}

  /**
   * List contacts with filters
   */
  async listContacts(wardId?: string, department?: string) {
    const where: any = { deletedAt: null }
    if (wardId) where.wardId = wardId
    if (department) where.department = department

    return this.repository.findMany(where, [
      { isEmergency: 'desc' },
      { displayOrder: 'asc' },
    ])
  }

  /**
   * Get distinct departments
   */
  async getDepartments() {
    return this.repository.getUniqueDepartments()
  }

  /**
   * List emergency contacts
   */
  async listEmergencyContacts(wardId?: string) {
    const where: any = {}
    if (wardId) where.wardId = wardId

    return this.repository.findManyEmergency(where)
  }

  /**
   * Create a contact
   */
  async createContact(data: any, wardId: string) {
    return this.repository.create({
      ...data,
      wardId,
    })
  }

  /**
   * Update a contact
   */
  async updateContact(id: string, data: any) {
    return this.repository.update(id, data)
  }

  /**
   * Delete a contact (soft delete)
   */
  async deleteContact(id: string) {
    return this.repository.update(id, {
      deletedAt: new Date(),
    })
  }

  /**
   * Get contact by ID
   */
  async getContactById(id: string) {
    return this.repository.findUnique(id)
  }

  /**
   * Track call
   */
  async trackCall(userId: string, contactId: string, phoneNumber: string) {
    return this.repository.createCallLog({
      userId,
      contactId,
      phoneNumber,
    })
  }

  /**
   * Create emergency contact
   */
  async createEmergencyContact(data: any, wardId: string) {
    return this.repository.createEmergency({
      ...data,
      wardId,
    })
  }
}
