/**
 * Analytics Repository
 */

import { PrismaClient } from '@prisma/client'

export class AnalyticsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Create analytics event
   */
  async createEvent(data: any) {
    return this.prisma.analyticsEvent.create({
      data,
    })
  }

  /**
   * Get basic system counts
   */
  async getCounts(where: any) {
    const [
      users,
      news,
      documents,
      contacts,
      feedback,
      pendingFeedback,
    ] = await Promise.all([
      this.prisma.user.count({ where: { ...where, deletedAt: null, isActive: true } }),
      this.prisma.newsArticle.count({ where: { ...where, deletedAt: null } }),
      this.prisma.document.count({ where: { ...where, deletedAt: null } }),
      this.prisma.contact.count({ where: { ...where, deletedAt: null } }),
      this.prisma.feedbackSubmission.count({ where }),
      this.prisma.feedbackSubmission.count({ where: { ...where, status: { in: ['pending', 'reviewing'] } } }),
    ])

    return { users, news, documents, contacts, feedback, pendingFeedback }
  }

  /**
   * Get popular news
   */
  async getPopularNews(where: any, limit: number = 5) {
    return this.prisma.newsArticle.findMany({
      where: { ...where, deletedAt: null },
      orderBy: { viewCount: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        viewCount: true,
      },
    })
  }

  /**
   * Get popular documents
   */
  async getPopularDocuments(where: any, limit: number = 5) {
    return this.prisma.document.findMany({
      where: { ...where, deletedAt: null },
      orderBy: { viewCount: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        viewCount: true,
        downloadCount: true,
      },
    })
  }

  /**
   * Get recent events
   */
  async getRecentEvents(where: any, limit: number = 10) {
    return this.prisma.analyticsEvent.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  }

  /**
   * Group feedback by status
   */
  async groupFeedbackByStatus(where: any) {
    return this.prisma.feedbackSubmission.groupBy({
      by: ['status'],
      where,
      _count: true,
    })
  }

  /**
   * Group feedback by category
   */
  async groupFeedbackByCategory(where: any) {
    return this.prisma.feedbackSubmission.groupBy({
      by: ['category'],
      where,
      _count: true,
    })
  }

  /**
   * Find resolved feedbacks with timestamps
   */
  async findResolvedFeedbacks(where: any) {
    return this.prisma.feedbackSubmission.findMany({
      where: {
        ...where,
        status: 'resolved',
        resolvedAt: { not: null },
      },
      select: {
        createdAt: true,
        resolvedAt: true,
      },
    })
  }
}
