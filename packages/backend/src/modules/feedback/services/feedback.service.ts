/**
 * Feedback Service
 */

import { FeedbackRepository } from '../repositories/feedback.repository'
import { sendFeedbackResponseEmail } from '../../../lib/email'

export class FeedbackService {
  constructor(private readonly repository: FeedbackRepository) {}

  /**
   * List feedback submissions with role-based filtering
   */
  async listFeedback(params: {
    userId: string;
    userRole: string;
    wardId?: string;
    category?: string;
    status?: string;
    limit: number;
    offset: number;
    filterUserId?: string;
  }) {
    const { userId, userRole, wardId, category, status, limit, offset, filterUserId } = params
    
    const where: any = {}

    // Citizens can only see their own feedback
    if (userRole === 'citizen') {
      where.userId = userId
    } else {
      // Staff/Admin see all in their ward
      if (wardId) where.wardId = wardId
      if (filterUserId) where.userId = filterUserId
    }

    if (category) where.category = category
    if (status) where.status = status

    const [items, total] = await Promise.all([
      this.repository.findMany({
        where,
        limit,
        offset,
        orderBy: [
          { isUrgent: 'desc' },
          { createdAt: 'desc' },
        ],
      }),
      this.repository.count(where),
    ])

    return { items, total, limit, offset, hasMore: total > offset + limit }
  }

  /**
   * Get feedback categories
   */
  async getCategories() {
    return this.repository.getUniqueCategories()
  }

  /**
   * Get feedback details with access control
   */
  async getFeedback(id: string, userId: string, userRole: string) {
    const feedback = await this.repository.findById(id)

    if (!feedback) {
      throw new Error('Feedback not found')
    }

    // Citizens can only view their own feedback
    if (userRole === 'citizen' && feedback.userId !== userId) {
      throw new Error('Forbidden')
    }

    return feedback
  }

  /**
   * Submit new feedback
   */
  async submitFeedback(data: any, userId: string, wardId: string) {
    const item = await this.repository.create({
      ...data,
      userId,
      wardId,
      priority: data.isUrgent ? 'high' : 'medium',
      photos: data.photoUrls ? {
        create: data.photoUrls.map((url: string, index: number) => ({
          photoUrl: url,
          uploadOrder: index,
        })),
      } : undefined,
    })

    // Create initial history entry
    await this.repository.createHistory({
      feedbackId: item.id,
      newStatus: 'pending',
      message: 'Phản ánh đã được gửi',
      changedBy: userId,
    })

    // Track analytics
    this.repository.createAnalyticsEvent({
      userId,
      wardId,
      eventType: 'submit',
      entityType: 'feedback',
      entityId: item.id,
    }).catch(console.error)

    return item
  }

  /**
   * Update feedback status (Staff only)
   */
  async updateStatus(id: string, data: any, staffId: string) {
    const existing = await this.repository.findById(id)

    if (!existing) {
      throw new Error('Feedback not found')
    }

    // Update feedback
    const item = await this.repository.update(id, {
      status: data.status,
      responseMessage: data.responseMessage,
      assignedTo: data.assignedTo,
      resolvedAt: data.status === 'resolved' ? new Date() : undefined,
    })

    // Create history entry
    await this.repository.createHistory({
      feedbackId: id,
      oldStatus: existing.status,
      newStatus: data.status,
      message: data.responseMessage || `Trạng thái đã được cập nhật sang ${data.status}`,
      changedBy: staffId,
    })

    // Send email notification if resolved
    if (data.status === 'resolved' && data.responseMessage && existing.user.email) {
      sendFeedbackResponseEmail(
        existing.user.email,
        existing.title,
        data.responseMessage
      ).catch(console.error)
    }

    return item
  }

  /**
   * Get feedback statistics summary
   */
  async getStats(wardId?: string) {
    const where: any = {}
    if (wardId) where.wardId = wardId

    const [total, statusCounts, categoryBreakdown] = await Promise.all([
      this.repository.totalCount(where),
      this.repository.getCountsByStatus(where),
      this.repository.getCountsByCategory(where),
    ])

    const byStatus: any = {}
    statusCounts.forEach((item) => {
      byStatus[item.status] = item.count
    })

    return {
      total,
      byStatus,
      byCategory: categoryBreakdown.map((item) => ({
        category: item.category,
        count: item._count,
      })),
    }
  }
}
