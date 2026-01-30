/**
 * Feedback Repository
 */

import { PrismaClient } from '@prisma/client'

export class FeedbackRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Find many feedback submissions with pagination and filters
   */
  async findMany(params: {
    where: any;
    limit: number;
    offset: number;
    orderBy: any[];
  }) {
    const { where, limit, offset, orderBy } = params
    
    return this.prisma.feedbackSubmission.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
          },
        },
        assignedUser: {
          select: {
            id: true,
            name: true,
          },
        },
        photos: {
          orderBy: { uploadOrder: 'asc' },
        },
        ward: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy,
      take: limit,
      skip: offset,
    })
  }

  /**
   * Count feedback submissions for pagination
   */
  async count(where: any) {
    return this.prisma.feedbackSubmission.count({ where })
  }

  /**
   * Get unique feedback categories
   */
  async getUniqueCategories() {
    const result = await this.prisma.feedbackSubmission.groupBy({
      by: ['category'],
    })
    return result.map((r: any) => r.category)
  }

  /**
   * Find unique feedback by ID with details
   */
  async findById(id: string) {
    return this.prisma.feedbackSubmission.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
            email: true,
          },
        },
        assignedUser: {
          select: {
            id: true,
            name: true,
          },
        },
        photos: {
          orderBy: { uploadOrder: 'asc' },
        },
        history: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        ward: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    })
  }

  /**
   * Create feedback submission
   */
  async create(data: any) {
    return this.prisma.feedbackSubmission.create({
      data,
      include: {
        photos: true,
        ward: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
  }

  /**
   * Update feedback submission
   */
  async update(id: string, data: any) {
    return this.prisma.feedbackSubmission.update({
      where: { id },
      data,
    })
  }

  /**
   * Create feedback history entry
   */
  async createHistory(data: any) {
    return this.prisma.feedbackHistory.create({
      data,
    })
  }

  /**
   * Create analytics event
   */
  async createAnalyticsEvent(data: any) {
    return this.prisma.analyticsEvent.create({
      data,
    })
  }

  /**
   * Get feedback counts grouped by status
   */
  async getCountsByStatus(where: any) {
    const statuses = ['pending', 'reviewing', 'in_progress', 'resolved', 'rejected']
    const counts = await Promise.all(
      statuses.map(async (status) => ({
        status,
        count: await this.prisma.feedbackSubmission.count({
          where: { ...where, status },
        }),
      }))
    )
    return counts
  }

  /**
   * Get feedback counts grouped by category
   */
  async getCountsByCategory(where: any) {
    return this.prisma.feedbackSubmission.groupBy({
      by: ['category'],
      where,
      _count: true,
    })
  }

  /**
   * Total count of feedback
   */
  async totalCount(where: any) {
    return this.prisma.feedbackSubmission.count({ where })
  }
}
