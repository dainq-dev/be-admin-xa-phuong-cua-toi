/**
 * Analytics Controller
 */

import { Context } from 'hono'
import { AnalyticsService } from '../services/analytics.service'

export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  /**
   * Track event
   */
  async track(c: Context) {
    const userId = c.get('userId') as string
    const wardId = c.get('wardId') as string | undefined
    const body = await c.req.json()

    await this.service.trackEvent(userId, wardId, body)
    return c.json({ message: 'Event tracked' })
  }

  /**
   * Get dashboard summary
   */
  async getDashboard(c: Context) {
    const wardId = c.get('wardId') as string | undefined
    const summary = await this.service.getDashboardSummary(wardId)
    return c.json(summary)
  }

  /**
   * Get feedback analytics
   */
  async getFeedback(c: Context) {
    const wardId = c.get('wardId') as string | undefined
    const analytics = await this.service.getFeedbackAnalytics(wardId)
    return c.json(analytics)
  }
}
