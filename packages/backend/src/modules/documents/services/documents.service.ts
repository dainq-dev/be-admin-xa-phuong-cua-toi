/**
 * Documents Service
 */

import { DocumentsRepository } from '../repositories/documents.repository'
import { generateUniqueSlug } from '../../../utils/slug'

export class DocumentsService {
  constructor(private readonly repository: DocumentsRepository) {}

  /**
   * List documents with pagination and filters
   */
  async listDocuments(params: {
    wardId?: string;
    category?: string;
    search?: string;
    limit: number;
    offset: number;
  }) {
    const { wardId, category, search, limit, offset } = params
    
    const where: any = { deletedAt: null }
    if (wardId) where.wardId = wardId
    if (category) where.category = category
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [items, total] = await Promise.all([
      this.repository.findMany({
        where,
        limit,
        offset,
        orderBy: { viewCount: 'desc' },
      }),
      this.repository.count(where),
    ])

    return { items, total, limit, offset, hasMore: total > offset + limit }
  }

  /**
   * Get all unique document categories
   */
  async getCategories() {
    return this.repository.getUniqueCategories()
  }

  /**
   * Get document by ID or slug
   */
  async getDocument(idOrSlug: string) {
    const document = await this.repository.findFirst({
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      deletedAt: null,
    })

    if (document) {
      // Async increment view count
      this.repository.incrementViewCount(document.id).catch(console.error)
    }

    return document
  }

  /**
   * Create a document
   */
  async createDocument(data: any, wardId: string) {
    const slug = await generateUniqueSlug(data.title, async (slug) => {
      const existing = await this.repository.findBySlug(slug)
      return !!existing
    })

    return this.repository.create({
      ...data,
      slug,
      wardId,
      steps: data.steps ? {
        create: data.steps.map((step: any, index: number) => ({
          ...step,
          stepOrder: index + 1,
        })),
      } : undefined,
      requiredDocs: data.requiredDocs ? {
        create: data.requiredDocs,
      } : undefined,
    })
  }

  /**
   * Update a document
   */
  async updateDocument(id: string, data: any) {
    const existing = await this.repository.findById(id)
    if (!existing || existing.deletedAt) {
      throw new Error('Document not found')
    }

    let slug = existing.slug
    if (data.title && data.title !== existing.title) {
      slug = await generateUniqueSlug(data.title, async (slug) => {
        const other = await this.repository.findFirst({
          where: { slug, id: { not: id } },
        })
        return !!other
      })
    }

    return this.repository.update(id, { ...data, slug })
  }

  /**
   * Delete a document (soft delete)
   */
  async deleteDocument(id: string) {
    return this.repository.update(id, {
      deletedAt: new Date(),
    })
  }

  /**
   * Track form download
   */
  async trackDownload(documentId: string, formId: string, userId?: string) {
    await this.repository.incrementDownloadCount(formId)
    
    if (userId) {
      await this.repository.createDownloadLog({
        userId,
        formId,
        documentId,
      })
    }
  }
}
