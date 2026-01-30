/**
 * Documents Controller
 */

import { Context } from 'hono'
import { DocumentsService } from '../services/documents.service'
import { createDocumentSchema, updateDocumentSchema, validateBody } from '../../../utils/validators'

export class DocumentsController {
  constructor(private readonly service: DocumentsService) {}

  /**
   * List documents
   */
  async list(c: Context) {
    const wardId = c.get('wardId') as string | undefined
    const category = c.req.query('category')
    const search = c.req.query('search')
    const limit = parseInt(c.req.query('limit') || '10')
    const offset = parseInt(c.req.query('offset') || '0')

    const result = await this.service.listDocuments({
      wardId,
      category,
      search,
      limit,
      offset,
    })

    return c.json(result)
  }

  /**
   * Get document
   */
  async get(c: Context) {
    const idOrSlug = c.req.param('idOrSlug')
    const document = await this.service.getDocument(idOrSlug)

    if (!document) {
      return c.json({ error: 'Document not found' }, 404)
    }

    return c.json(document)
  }

  /**
   * Create document
   */
  async create(c: Context) {
    const body = await validateBody(await c.req.json(), createDocumentSchema)
    const wardId = c.get('wardId') as string

    if (!wardId) {
      return c.json({ error: 'User must belong to a ward' }, 400)
    }

    const document = await this.service.createDocument(body, wardId)
    return c.json(document, 201)
  }

  /**
   * Update document
   */
  async update(c: Context) {
    const id = c.req.param('id')
    const body = await validateBody(await c.req.json(), updateDocumentSchema)

    try {
      const document = await this.service.updateDocument(id, body)
      return c.json(document)
    } catch (error: any) {
      if (error.message === 'Document not found') {
        return c.json({ error: error.message }, 404)
      }
      throw error
    }
  }

  /**
   * Delete document
   */
  async delete(c: Context) {
    const id = c.req.param('id')

    const document = await this.service.deleteDocument(id)
    return c.json({ message: 'Document deleted', document })
  }

  /**
   * Track download
   */
  async trackDownload(c: Context) {
    const { id, formId } = c.req.param()
    const userId = c.get('userId') as string | undefined

    await this.service.trackDownload(id, formId, userId)
    return c.json({ message: 'Download tracked' })
  }
}
