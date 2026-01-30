/**
 * Analytics Service
 */

import { AnalyticsRepository } from '../repositories/analytics.repository'

export class AnalyticsService {
  constructor(private readonly repository: AnalyticsRepository) {}

  /**
   * Track account event
   */
  async trackEvent(userId: string, wardId: string | undefined, data: any) {
    return this.repository.createEvent({
      userId,
      wardId,
      eventType: data.eventType,
      entityType: data.entityType,
      entityId: data.entityId,
      metadata: data.metadata || {},
    })
  }

  /**
   * Get dashboard summary
   */
  async getDashboardSummary(wardId?: string) {
    const where: any = {}
    if (wardId) where.wardId = wardId

    const [counts, popularNews, popularDocuments, recentActivities] = await Promise.all([
      this.repository.getCounts(where),
      this.repository.getPopularNews(where),
      this.repository.getPopularDocuments(where),
      this.repository.getRecentEvents(where),
    ])

    return {
      counts,
      popularNews,
      popularDocuments,
      recentActivities,
    }
  }

  /**
   * Get deep feedback analytics
   */
  async getFeedbackAnalytics(wardId?: string) {
    const where: any = {}
    if (wardId) where.wardId = wardId

    const [byStatus, byCategory, resolvedFeedbacks] = await Promise.all([
      this.repository.groupFeedbackByStatus(where),
      this.repository.groupFeedbackByCategory(where),
      this.repository.findResolvedFeedbacks(where),
    ])

    const avgResolutionTime = resolvedFeedbacks.length > 0
      ? resolvedFeedbacks.reduce((sum, item) => {
          const diff = item.resolvedAt!.getTime() - item.createdAt.getTime()
          return sum + diff
        }, 0) / resolvedFeedbacks.length / (1000 * 60 * 60 * 24)
      : 0

    return {
      byStatus: byStatus.map((item) => ({
        status: item.status,
        count: item._count,
      })),
      byCategory: byCategory.map((item) => ({
        category: item.category,
        count: item._count,
      })),
      avgResolutionDays: Math.round(avgResolutionTime * 10) / 10,
    }
  }
}
