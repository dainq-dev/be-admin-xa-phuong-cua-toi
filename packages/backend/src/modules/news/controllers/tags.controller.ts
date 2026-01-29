/**
 * Tags Controller
 * HTTP request/response handling for Tags API
 */

import type { Context } from 'hono'
import { NewsService } from '../services/news.service'
import { tagsToResponses } from '../models/tag.model'

export class TagsController {
  constructor(private newsService: NewsService) {}

  /**
   * GET /tags/all - Get all tags
   */
  async listAll(c: Context) {
    try {
      const tags = await this.newsService.getAllTags()

      return c.json(tagsToResponses(tags))
    } catch (error) {
      throw error
    }
  }
}
