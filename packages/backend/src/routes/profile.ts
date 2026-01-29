/**
 * Profile Routes
 * User profile and settings
 */

import { Hono } from 'hono'
import { prisma } from '../lib/prisma'
import { requireAuth } from '../middleware/auth'
import { updateProfileSchema, updateSettingsSchema, validateBody } from '../utils/validators'

const profile = new Hono()

/**
 * Get user profile
 */
profile.get('/', requireAuth, async (c) => {
  const userId = c.get('userId') as string

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      ward: {
        select: {
          id: true,
          name: true,
          code: true,
          contactInfo: true,
        },
      },
      settings: true,
    },
  })

  if (!user) {
    return c.json({ error: 'User not found' }, 404)
  }

  return c.json(user)
})

/**
 * Update profile
 */
profile.patch('/', requireAuth, async (c) => {
  const userId = c.get('userId') as string
  const body = await validateBody(await c.req.json(), updateProfileSchema)

  const user = await prisma.user.update({
    where: { id: userId },
    data: body,
  })

  return c.json(user)
})

/**
 * Get user settings
 */
profile.get('/settings', requireAuth, async (c) => {
  const userId = c.get('userId') as string

  let settings = await prisma.userSettings.findUnique({
    where: { userId },
  })

  // Create default settings if not exists
  if (!settings) {
    settings = await prisma.userSettings.create({
      data: { userId },
    })
  }

  return c.json(settings)
})

/**
 * Update user settings
 */
profile.patch('/settings', requireAuth, async (c) => {
  const userId = c.get('userId') as string
  const body = await validateBody(await c.req.json(), updateSettingsSchema)

  const settings = await prisma.userSettings.upsert({
    where: { userId },
    create: {
      userId,
      ...body,
    },
    update: body,
  })

  return c.json(settings)
})

/**
 * Get feedback history
 */
profile.get('/feedback-history', requireAuth, async (c) => {
  const userId = c.get('userId') as string

  const feedbacks = await prisma.feedbackSubmission.findMany({
    where: { userId },
    include: {
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
    orderBy: { createdAt: 'desc' },
  })

  // Get stats
  const [totalCount, pendingCount, resolvedCount] = await Promise.all([
    prisma.feedbackSubmission.count({ where: { userId } }),
    prisma.feedbackSubmission.count({ where: { userId, status: { in: ['pending', 'reviewing', 'in_progress'] } } }),
    prisma.feedbackSubmission.count({ where: { userId, status: 'resolved' } }),
  ])

  return c.json({
    feedbacks,
    totalCount,
    pendingCount,
    resolvedCount,
  })
})

export default profile
