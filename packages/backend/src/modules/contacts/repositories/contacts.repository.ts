/**
 * Contacts Repository
 */

import { PrismaClient } from '@prisma/client'

export class ContactsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Find many contacts with filters
   */
  async findMany(where: any, orderBy: any[]) {
    return this.prisma.contact.findMany({
      where,
      orderBy,
    })
  }

  /**
   * Get unique departments
   */
  async getUniqueDepartments() {
    const result = await this.prisma.contact.groupBy({
      by: ['department'],
      where: { deletedAt: null },
    })
    return result.map((r: any) => r.department)
  }

  /**
   * Find unique contact by ID
   */
  async findUnique(id: string) {
    return this.prisma.contact.findUnique({
      where: { id },
    })
  }

  /**
   * Create contact
   */
  async create(data: any) {
    return this.prisma.contact.create({
      data,
    })
  }

  /**
   * Update contact
   */
  async update(id: string, data: any) {
    return this.prisma.contact.update({
      where: { id },
      data,
    })
  }

  /**
   * Find many emergency contacts
   */
  async findManyEmergency(where: any) {
    return this.prisma.emergencyContact.findMany({
      where,
      orderBy: { displayOrder: 'asc' },
    })
  }

  /**
   * Create emergency contact
   */
  async createEmergency(data: any) {
    return this.prisma.emergencyContact.create({
      data,
    })
  }

  /**
   * Create call log
   */
  async createCallLog(data: any) {
    return this.prisma.callLog.create({
      data,
    })
  }
}
