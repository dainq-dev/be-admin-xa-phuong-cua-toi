/**
 * Documents Repository
 */

import { PrismaClient } from '@prisma/client'

export class DocumentsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Find many documents with pagination and filters
   */
  async findMany(params: {
    where: any;
    limit: number;
    offset: number;
    orderBy: any;
  }) {
    const { where, limit, offset, orderBy } = params
    
    return this.prisma.document.findMany({
      where,
      include: {
        ward: { select: { id: true, name: true } },
        _count: {
          select: { forms: true, steps: true },
        },
      },
      orderBy,
      take: limit,
      skip: offset,
    })
  }

  /**
   * Count documents for pagination
   */
  async count(where: any) {
    return this.prisma.document.count({ where })
  }

  /**
   * Get unique document categories
   */
  async getUniqueCategories() {
    const result = await this.prisma.document.groupBy({
      by: ['category'],
      where: { deletedAt: null },
    })
    return result.map((r: any) => r.category)
  }

  /**
   * Find first document by ID or slug
   */
  async findFirst(where: any) {
    return this.prisma.document.findFirst({
      where,
      include: {
        ward: { select: { id: true, name: true, code: true } },
        steps: { orderBy: { stepOrder: 'asc' } },
        requiredDocs: true,
        forms: true,
        contactInfo: {
          include: {
            contact: {
              select: {
                id: true,
                name: true,
                position: true,
                phoneNumber: true,
                email: true,
              },
            },
          },
        },
      },
    })
  }

  /**
   * Find unique document by ID
   */
  async findById(id: string) {
    return this.prisma.document.findUnique({
      where: { id },
    })
  }

  /**
   * Find unique document by slug
   */
  async findBySlug(slug: string) {
    return this.prisma.document.findUnique({
      where: { slug },
    })
  }

  /**
   * Create document with nested relations
   */
  async create(data: any) {
    return this.prisma.document.create({
      data,
      include: {
        steps: true,
        requiredDocs: true,
      },
    })
  }

  /**
   * Update document
   */
  async update(id: string, data: any) {
    return this.prisma.document.update({
      where: { id },
      data,
    })
  }

  /**
   * Increment view count
   */
  async incrementViewCount(id: string) {
    return this.prisma.document.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    })
  }

  /**
   * Increment form download count
   */
  async incrementDownloadCount(formId: string) {
    return this.prisma.documentForm.update({
      where: { id: formId },
      data: { downloadCount: { increment: 1 } },
    })
  }

  /**
   * Create download log
   */
  async createDownloadLog(data: any) {
    return this.prisma.downloadLog.create({
      data,
    })
  }
}
