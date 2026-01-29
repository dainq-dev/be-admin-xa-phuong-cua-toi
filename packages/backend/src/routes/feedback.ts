/**
 * Feedback Routes
 * Citizen feedback and complaints
 */

import { Hono } from 'hono'
import { prisma } from '../lib/prisma'
import { requireAuth, requireStaff } from '../middleware/auth'
import { sendFeedbackResponseEmail } from '../lib/email'
import { createFeedbackSchema, updateFeedbackStatusSchema, feedbackFiltersSchema, validateBody } from '../utils/validators'

const feedback = new Hono()

/**
 * Get all feedback (with filters)
 */
feedback.get('/', requireAuth, async (c) => {
  const query = await validateBody(c.req.query(), feedbackFiltersSchema)
  const userRole = c.get('userRole') as string
  const userId = c.get('userId') as string
  const wardId = c.get('wardId') as string | undefined

  const where: any = {}

  // Citizens can only see their own feedback
  if (userRole === 'citizen') {
    where.userId = userId
  } else {
    // Staff/Admin see all in their ward
    if (wardId) where.wardId = wardId
    if (query.userId) where.userId = query.userId
  }

  if (query.category) where.category = query.category
  if (query.status) where.status = query.status

  const [items, total] = await Promise.all([
    prisma.feedbackSubmission.findMany({
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
      orderBy: [
        { isUrgent: 'desc' },
        { createdAt: 'desc' },
      ],
      take: query.limit,
      skip: query.offset,
    }),
    prisma.feedbackSubmission.count({ where }),
  ])

  return c.json({ items, total, limit: query.limit, offset: query.offset, hasMore: total > query.offset + query.limit })
})

/**
 * Get feedback by ID
 */
feedback.get('/:id', requireAuth, async (c) => {
  const id = c.req.param('id')
  const userRole = c.get('userRole') as string
  const userId = c.get('userId') as string

  const item = await prisma.feedbackSubmission.findUnique({
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

  if (!item) {
    return c.json({ error: 'Feedback not found' }, 404)
  }

  // Citizens can only view their own feedback
  if (userRole === 'citizen' && item.userId !== userId) {
    return c.json({ error: 'Forbidden' }, 403)
  }

  return c.json(item)
})

/**
 * Submit feedback (citizens)
 */
feedback.post('/', requireAuth, async (c) => {
  const body = await validateBody(await c.req.json(), createFeedbackSchema)
  const userId = c.get('userId') as string
  const wardId = c.get('wardId') as string | undefined

  if (!wardId) {
    return c.json({ error: 'User must belong to a ward' }, 400)
  }

  // Create feedback
  const item = await prisma.feedbackSubmission.create({
    data: {
      ...body,
      userId,
      wardId,
      priority: body.isUrgent ? 'high' : 'medium',
      photos: body.photoUrls ? {
        create: body.photoUrls.map((url, index) => ({
          photoUrl: url,
          uploadOrder: index,
        })),
      } : undefined,
    },
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

  // Create initial history entry
  await prisma.feedbackHistory.create({
    data: {
      feedbackId: item.id,
      newStatus: 'pending',
      message: 'Phản ánh đã được gửi',
      changedBy: userId,
    },
  })

  // Track analytics
  await prisma.analyticsEvent.create({
    data: {
      userId,
      wardId,
      eventType: 'submit',
      entityType: 'feedback',
      entityId: item.id,
    },
  })

  return c.json(item, 201)
})

/**
 * Update feedback status (staff/admin only)
 */
feedback.patch('/:id/status', requireAuth, requireStaff, async (c) => {
  const id = c.req.param('id')
  const body = await validateBody(await c.req.json(), updateFeedbackStatusSchema)
  const userId = c.get('userId') as string

  const existing = await prisma.feedbackSubmission.findUnique({
    where: { id },
    include: {
      user: true,
    },
  })

  if (!existing) {
    return c.json({ error: 'Feedback not found' }, 404)
  }

  // Update feedback
  const item = await prisma.feedbackSubmission.update({
    where: { id },
    data: {
      status: body.status,
      responseMessage: body.responseMessage,
      assignedTo: body.assignedTo,
      resolvedAt: body.status === 'resolved' ? new Date() : undefined,
    },
  })

  // Create history entry
  await prisma.feedbackHistory.create({
    data: {
      feedbackId: id,
      oldStatus: existing.status,
      newStatus: body.status,
      message: body.responseMessage || `Trạng thái đã được cập nhật sang ${body.status}`,
      changedBy: userId,
    },
  })

  // Send email notification if resolved
  if (body.status === 'resolved' && body.responseMessage && existing.user.email) {
    sendFeedbackResponseEmail(
      existing.user.email,
      existing.title,
      body.responseMessage
    ).catch(console.error)
  }

  return c.json(item)
})

/**
 * Get feedback statistics
 */
feedback.get('/stats/summary', requireAuth, requireStaff, async (c) => {
  const wardId = c.get('wardId') as string | undefined

  const where: any = {}
  if (wardId) where.wardId = wardId

  const [totalCount, pendingCount, reviewingCount, inProgressCount, resolvedCount, rejectedCount] = await Promise.all([
    prisma.feedbackSubmission.count({ where }),
    prisma.feedbackSubmission.count({ where: { ...where, status: 'pending' } }),
    prisma.feedbackSubmission.count({ where: { ...where, status: 'reviewing' } }),
    prisma.feedbackSubmission.count({ where: { ...where, status: 'in_progress' } }),
    prisma.feedbackSubmission.count({ where: { ...where, status: 'resolved' } }),
    prisma.feedbackSubmission.count({ where: { ...where, status: 'rejected' } }),
  ])

  // Get category breakdown
  const byCategory = await prisma.feedbackSubmission.groupBy({
    by: ['category'],
    where,
    _count: true,
  })

  return c.json({
    total: totalCount,
    byStatus: {
      pending: pendingCount,
      reviewing: reviewingCount,
      inProgress: inProgressCount,
      resolved: resolvedCount,
      rejected: rejectedCount,
    },
    byCategory: byCategory.map((item) => ({
      category: item.category,
      count: item._count,
    })),
  })
})

export default feedback
