/**
 * Analytics Routes
 * Track user actions and generate insights
 */

import { Hono } from 'hono'
import { prisma } from '../lib/prisma'
import { requireAuth, requireStaff } from '../middleware/auth'

const analytics = new Hono()

/**
 * Track event
 */
analytics.post('/track', requireAuth, async (c) => {
  const userId = c.get('userId') as string
  const wardId = c.get('wardId') as string | undefined
  const body = await c.req.json()

  await prisma.analyticsEvent.create({
    data: {
      userId,
      wardId,
      eventType: body.eventType,
      entityType: body.entityType,
      entityId: body.entityId,
      metadata: body.metadata || {},
    },
  })

  return c.json({ message: 'Event tracked' })
})

/**
 * Get dashboard stats (admin/staff)
 */
analytics.get('/dashboard', requireAuth, requireStaff, async (c) => {
  const wardId = c.get('wardId') as string | undefined

  const where: any = {}
  if (wardId) where.wardId = wardId

  // Get counts
  const [
    totalUsers,
    totalNews,
    totalDocuments,
    totalContacts,
    totalFeedback,
    pendingFeedback,
  ] = await Promise.all([
    prisma.user.count({ where: { ...where, deletedAt: null, isActive: true } }),
    prisma.newsArticle.count({ where: { ...where, deletedAt: null } }),
    prisma.document.count({ where: { ...where, deletedAt: null } }),
    prisma.contact.count({ where: { ...where, deletedAt: null } }),
    prisma.feedbackSubmission.count({ where }),
    prisma.feedbackSubmission.count({ where: { ...where, status: { in: ['pending', 'reviewing'] } } }),
  ])

  // Get popular content
  const popularNews = await prisma.newsArticle.findMany({
    where: { ...where, deletedAt: null },
    orderBy: { viewCount: 'desc' },
    take: 5,
    select: {
      id: true,
      title: true,
      viewCount: true,
    },
  })

  const popularDocuments = await prisma.document.findMany({
    where: { ...where, deletedAt: null },
    orderBy: { viewCount: 'desc' },
    take: 5,
    select: {
      id: true,
      title: true,
      viewCount: true,
      downloadCount: true,
    },
  })

  // Recent activities
  const recentActivities = await prisma.analyticsEvent.findMany({
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
    take: 10,
  })

  return c.json({
    counts: {
      users: totalUsers,
      news: totalNews,
      documents: totalDocuments,
      contacts: totalContacts,
      feedback: totalFeedback,
      pendingFeedback,
    },
    popularNews,
    popularDocuments,
    recentActivities,
  })
})

/**
 * Get feedback analytics
 */
analytics.get('/feedback', requireAuth, requireStaff, async (c) => {
  const wardId = c.get('wardId') as string | undefined

  const where: any = {}
  if (wardId) where.wardId = wardId

  // By status
  const byStatus = await prisma.feedbackSubmission.groupBy({
    by: ['status'],
    where,
    _count: true,
  })

  // By category
  const byCategory = await prisma.feedbackSubmission.groupBy({
    by: ['category'],
    where,
    _count: true,
  })

  // Average resolution time
  const resolved = await prisma.feedbackSubmission.findMany({
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

  const avgResolutionTime = resolved.length > 0
    ? resolved.reduce((sum, item) => {
        const diff = item.resolvedAt!.getTime() - item.createdAt.getTime()
        return sum + diff
      }, 0) / resolved.length / (1000 * 60 * 60 * 24) // Convert to days
    : 0

  return c.json({
    byStatus: byStatus.map((item) => ({
      status: item.status,
      count: item._count,
    })),
    byCategory: byCategory.map((item) => ({
      category: item.category,
      count: item._count,
    })),
    avgResolutionDays: Math.round(avgResolutionTime * 10) / 10,
  })
})

export default analytics
