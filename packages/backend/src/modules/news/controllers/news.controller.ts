/**
 * News Controller
 * HTTP request/response handling for News API
 */

import type { Context } from 'hono'
import { NewsService } from '../services/news.service'
import {
  validateBody,
  createNewsSchema,
  updateNewsSchema,
  newsFiltersSchema,
} from '../validators/news.validators'

export class NewsController {
  constructor(private newsService: NewsService) {}

  /**
   * GET / - List all articles with pagination
   */
  async list(c: Context) {
    try {
      const query = c.req.query()
      const filters = await validateBody(query, newsFiltersSchema)
      const wardId = c.get('wardId') as string | undefined

      const result = await this.newsService.listArticles({
        wardId,
        category: filters.category,
        isFeatured: filters.isFeatured as boolean | undefined,
        isPinned: filters.isPinned as boolean | undefined,
        status: filters.status,
        search: filters.search,
        limit: filters.limit ?? 10,
        offset: filters.offset ?? 0,
      })

      return c.json(result)
    } catch (error) {
      throw error
    }
  }

  /**
   * GET /:idOrSlug - Get single article by ID or slug
   */
  async getById(c: Context) {
    try {
      const idOrSlug = c.req.param('idOrSlug')
      const userId = c.get('userId') as string | undefined

      const article = await this.newsService.getArticleById(idOrSlug, userId)

      if (!article) {
        return c.json({ error: 'Article not found' }, 404)
      }

      return c.json(article)
    } catch (error) {
      throw error
    }
  }

  /**
   * POST / - Create new article
   */
  async create(c: Context) {
    try {
      const userId = c.get('userId') as string
      const wardId = c.get('wardId') as string

      if (!wardId) {
        return c.json({ error: 'User must belong to a ward' }, 400)
      }

      const body = await validateBody(await c.req.json(), createNewsSchema)

      const article = await this.newsService.createArticle({
        ...body,
        authorId: userId,
        wardId,
      })

      return c.json(article, 201)
    } catch (error) {
      throw error
    }
  }

  /**
   * PATCH /:id - Update article
   */
  async update(c: Context) {
    try {
      const id = c.req.param('id')
      const userId = c.get('userId') as string
      const body = await validateBody(await c.req.json(), updateNewsSchema)

      const article = await this.newsService.updateArticle(id, body, userId)

      return c.json(article)
    } catch (error) {
      throw error
    }
  }

  /**
   * DELETE /:id - Delete article (soft delete)
   */
  async delete(c: Context) {
    try {
      const id = c.req.param('id')
      const userId = c.get('userId') as string
      const wardId = c.get('wardId') as string

      await this.newsService.deleteArticle(id, wardId, userId)

      return c.json({ message: 'Article deleted successfully' })
    } catch (error) {
      throw error
    }
  }
}
