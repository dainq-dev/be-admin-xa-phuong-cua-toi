/**
 * Feedback Controller
 */

import { Context } from 'hono'
import { FeedbackService } from '../services/feedback.service'
import { 
  createFeedbackSchema, 
  updateFeedbackStatusSchema, 
  feedbackFiltersSchema, 
  validateBody 
} from '../../../utils/validators'

export class FeedbackController {
  constructor(private readonly service: FeedbackService) {}

  /**
   * List feedback submissions
   */
  async list(c: Context) {
    const query = await validateBody(c.req.query(), feedbackFiltersSchema)
    const userId = c.get('userId') as string
    const userRole = c.get('userRole') as string
    const wardId = c.get('wardId') as string | undefined

    const result = await this.service.listFeedback({
      userId,
      userRole,
      wardId,
      category: query.category,
      status: query.status,
      limit: query.limit ?? 10,
      offset: query.offset ?? 0,
      filterUserId: query.userId,
    })

    return c.json(result)
  }

  /**
   * Get feedback categories
   */
  async getCategories(c: Context) {
    const categories = await this.service.getCategories()
    return c.json({ items: categories })
  }

  /**
   * Get feedback details
   */
  async get(c: Context) {
    const id = c.req.param('id')
    const userId = c.get('userId') as string
    const userRole = c.get('userRole') as string

    try {
      const item = await this.service.getFeedback(id, userId, userRole)
      return c.json(item)
    } catch (error: any) {
      if (error.message === 'Feedback not found') {
        return c.json({ error: error.message }, 404)
      }
      if (error.message === 'Forbidden') {
        return c.json({ error: error.message }, 403)
      }
      throw error
    }
  }

  /**
   * Submit feedback
   */
  async submit(c: Context) {
    const body = await validateBody(await c.req.json(), createFeedbackSchema)
    const userId = c.get('userId') as string
    const wardId = c.get('wardId') as string | undefined

    if (!wardId) {
      return c.json({ error: 'User must belong to a ward' }, 400)
    }

    const item = await this.service.submitFeedback(body, userId, wardId)
    return c.json(item, 201)
  }

  /**
   * Update feedback status
   */
  async updateStatus(c: Context) {
    const id = c.req.param('id')
    const body = await validateBody(await c.req.json(), updateFeedbackStatusSchema)
    const staffId = c.get('userId') as string

    try {
      const item = await this.service.updateStatus(id, body, staffId)
      return c.json(item)
    } catch (error: any) {
      if (error.message === 'Feedback not found') {
        return c.json({ error: error.message }, 404)
      }
      throw error
    }
  }

  /**
   * Get stats summary
   */
  async getStats(c: Context) {
    const wardId = c.get('wardId') as string | undefined
    const stats = await this.service.getStats(wardId)
    return c.json(stats)
  }
}
