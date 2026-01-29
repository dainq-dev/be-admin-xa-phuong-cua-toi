/**
 * Wards Routes
 * Ward management and customization
 */

import { Hono } from 'hono'
import { prisma } from '../lib/prisma'
import { requireAuth, requireAdmin, optionalAuth } from '../middleware/auth'
import { updatePageThemeSchema, updateFeatureFlagSchema, validateBody } from '../utils/validators'

const wards = new Hono()

/**
 * Get all wards
 */
wards.get('/', async (c) => {
  const wards = await prisma.ward.findMany({
    where: { isActive: true },
    include: {
      district: {
        select: {
          id: true,
          name: true,
          province: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  return c.json(wards)
})

/**
 * Get ward by ID
 */
wards.get('/:id', async (c) => {
  const id = c.req.param('id')

  const ward = await prisma.ward.findUnique({
    where: { id },
    include: {
      district: {
        include: {
          province: true,
        },
      },
    },
  })

  if (!ward) {
    return c.json({ error: 'Ward not found' }, 404)
  }

  return c.json(ward)
})

/**
 * Get page theme
 */
wards.get('/:id/theme/:pageKey', optionalAuth, async (c) => {
  const { id, pageKey } = c.req.param()

  const theme = await prisma.pageTheme.findFirst({
    where: {
      wardId: id,
      pageKey,
      isActive: true,
    },
  })

  if (!theme) {
    // Return default theme
    return c.json({
      pageKey,
      themeConfig: {},
      isActive: true,
    })
  }

  return c.json(theme)
})

/**
 * Update page theme (admin only)
 */
wards.put('/:id/theme', requireAuth, requireAdmin, async (c) => {
  const id = c.req.param('id')
  const body = await validateBody(await c.req.json(), updatePageThemeSchema)

  const theme = await prisma.pageTheme.upsert({
    where: {
      wardId_pageKey: {
        wardId: id,
        pageKey: body.pageKey,
      },
    },
    create: {
      wardId: id,
      ...body,
    },
    update: body,
  })

  return c.json(theme)
})

/**
 * Get feature flags
 */
wards.get('/:id/features', optionalAuth, async (c) => {
  const id = c.req.param('id')

  const flags = await prisma.featureFlag.findMany({
    where: { wardId: id },
  })

  return c.json(flags)
})

/**
 * Update feature flag (admin only)
 */
wards.put('/:id/features', requireAuth, requireAdmin, async (c) => {
  const id = c.req.param('id')
  const body = await validateBody(await c.req.json(), updateFeatureFlagSchema)

  const flag = await prisma.featureFlag.upsert({
    where: {
      wardId_featureKey: {
        wardId: id,
        featureKey: body.featureKey,
      },
    },
    create: {
      wardId: id,
      ...body,
    },
    update: body,
  })

  return c.json(flag)
})

export default wards
