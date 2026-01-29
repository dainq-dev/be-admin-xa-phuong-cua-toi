/**
 * News Routes
 * CRUD operations for news articles
 */

import { Hono } from 'hono'
import { prisma } from '../lib/prisma'
import { cache } from '../lib/redis'
import { requireAuth, requireStaff, optionalAuth } from '../middleware/auth'
import { generateUniqueSlug } from '../utils/slug'
import {
  createNewsSchema,
  updateNewsSchema,
  newsFiltersSchema,
  validateBody,
} from '../utils/validators'

const news = new Hono()

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * Get all news articles (with filters & pagination)
 */
news.get('/', optionalAuth, async (c) => {
  const query = await validateBody(c.req.query(), newsFiltersSchema)
  const wardId = c.get('wardId') as string | undefined

  // Build where clause
  const where: any = {
    deletedAt: null,
    publishedAt: { lte: new Date() },
  }

  if (wardId) {
    where.wardId = wardId
  }

  if (query.category) {
    where.category = query.category
  }

  if (query.isFeatured !== undefined) {
    where.isFeatured = query.isFeatured
  }

  if (query.isPinned !== undefined) {
    where.isPinned = query.isPinned
  }

  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { summary: { contains: query.search, mode: 'insensitive' } },
    ]
  }

  // Get articles
  const [items, total] = await Promise.all([
    prisma.newsArticle.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: [
        { isPinned: 'desc' },
        { isFeatured: 'desc' },
        { publishedAt: 'desc' },
      ],
      take: query.limit,
      skip: query.offset,
    }),
    prisma.newsArticle.count({ where }),
  ])

  return c.json({
    items: items.map((item) => ({
      ...item,
      tags: item.tags.map((t) => t.tag),
    })),
    total,
    limit: query.limit,
    offset: query.offset,
    hasMore: total > query.offset + query.limit,
  })
})

/**
 * Get single news article by ID or slug
 */
news.get('/:idOrSlug', optionalAuth, async (c) => {
  const idOrSlug = c.req.param('idOrSlug')

  // Try UUID first, then slug
  const article = await prisma.newsArticle.findFirst({
    where: {
      OR: [
        { id: idOrSlug },
        { slug: idOrSlug },
      ],
      deletedAt: null,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
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

  if (!article) {
    return c.json({ error: 'Article not found' }, 404)
  }

  // Increment view count (async, don't wait)
  prisma.newsArticle.update({
    where: { id: article.id },
    data: { viewCount: { increment: 1 } },
  }).catch(console.error)

  // Log analytics event
  const userId = c.get('userId') as string | undefined
  if (userId) {
    prisma.analyticsEvent.create({
      data: {
        userId,
        wardId: article.wardId,
        eventType: 'view',
        entityType: 'news',
        entityId: article.id,
      },
    }).catch(console.error)
  }

  return c.json({
    ...article,
    tags: article.tags.map((t) => t.tag),
  })
})

// ============================================
// PROTECTED ROUTES (Staff/Admin only)
// ============================================

/**
 * Create news article
 */
news.post('/', requireAuth, requireStaff, async (c) => {
  const body = await validateBody(await c.req.json(), createNewsSchema)
  const userId = c.get('userId') as string
  const wardId = c.get('wardId') as string

  if (!wardId) {
    return c.json({ error: 'User must belong to a ward' }, 400)
  }

  // Generate unique slug
  const slug = await generateUniqueSlug(
    body.title,
    async (slug) => {
      const existing = await prisma.newsArticle.findUnique({ where: { slug } })
      return !!existing
    }
  )

  // Create article
  const article = await prisma.newsArticle.create({
    data: {
      ...body,
      slug,
      wardId,
      authorId: userId,
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : new Date(),
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  })

  // Create tags if provided
  if (body.tags && body.tags.length > 0) {
    for (const tagName of body.tags) {
      // Find or create tag
      let tag = await prisma.newsTag.findFirst({
        where: { name: tagName },
      })

      if (!tag) {
        const tagSlug = await generateUniqueSlug(
          tagName,
          async (slug) => {
            const existing = await prisma.newsTag.findUnique({ where: { slug } })
            return !!existing
          }
        )

        tag = await prisma.newsTag.create({
          data: {
            name: tagName,
            slug: tagSlug,
          },
        })
      }

      // Link tag to article
      await prisma.newsArticleTag.create({
        data: {
          articleId: article.id,
          tagId: tag.id,
        },
      })
    }
  }

  // Invalidate cache
  await cache.deletePattern(`news:*`)

  return c.json(article, 201)
})

/**
 * Update news article
 */
news.patch('/:id', requireAuth, requireStaff, async (c) => {
  const id = c.req.param('id')
  const body = await validateBody(await c.req.json(), updateNewsSchema)

  // Check if article exists
  const existing = await prisma.newsArticle.findUnique({
    where: { id },
  })

  if (!existing || existing.deletedAt) {
    return c.json({ error: 'Article not found' }, 404)
  }

  // Update slug if title changed
  let slug = existing.slug
  if (body.title && body.title !== existing.title) {
    slug = await generateUniqueSlug(
      body.title,
      async (slug) => {
        const existing = await prisma.newsArticle.findFirst({
          where: { slug, id: { not: id } },
        })
        return !!existing
      }
    )
  }

  // Update article
  const article = await prisma.newsArticle.update({
    where: { id },
    data: {
      ...body,
      slug,
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : undefined,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  })

  // Invalidate cache
  await cache.deletePattern(`news:*`)

  return c.json(article)
})

/**
 * Delete news article (soft delete)
 */
news.delete('/:id', requireAuth, requireStaff, async (c) => {
  const id = c.req.param('id')

  const article = await prisma.newsArticle.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  // Invalidate cache
  await cache.deletePattern(`news:*`)

  return c.json({ message: 'Article deleted successfully', article })
})

/**
 * Get all tags
 */
news.get('/tags/all', async (c) => {
  const tags = await prisma.newsTag.findMany({
    orderBy: { name: 'asc' },
  })

  return c.json(tags)
})

export default news
