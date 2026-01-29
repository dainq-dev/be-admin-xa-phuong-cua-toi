/**
 * Documents Routes
 * Official documents and procedures
 */

import { Hono } from 'hono'
import { prisma } from '../lib/prisma'
import { requireAuth, requireStaff, optionalAuth } from '../middleware/auth'
import { generateUniqueSlug } from '../utils/slug'
import { createDocumentSchema, updateDocumentSchema, validateBody } from '../utils/validators'

const documents = new Hono()

/**
 * Get all documents
 */
documents.get('/', optionalAuth, async (c) => {
  const wardId = c.get('wardId') as string | undefined
  const category = c.req.query('category')
  const search = c.req.query('search')
  const limit = parseInt(c.req.query('limit') || '10')
  const offset = parseInt(c.req.query('offset') || '0')

  const where: any = { deletedAt: null }
  if (wardId) where.wardId = wardId
  if (category) where.category = category
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [items, total] = await Promise.all([
    prisma.document.findMany({
      where,
      include: {
        ward: { select: { id: true, name: true } },
        _count: {
          select: { forms: true, steps: true },
        },
      },
      orderBy: { viewCount: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.document.count({ where }),
  ])

  return c.json({ items, total, limit, offset, hasMore: total > offset + limit })
})

/**
 * Get document by ID/slug with full details
 */
documents.get('/:idOrSlug', optionalAuth, async (c) => {
  const idOrSlug = c.req.param('idOrSlug')

  const document = await prisma.document.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      deletedAt: null,
    },
    include: {
      ward: { select: { id: true, name: true, code: true } },
      steps: { orderBy: { stepOrder: 'asc' } },
      requiredDocs: true,
      forms: true,
      contactInfo: {
        include: {
          contact: {
            select: {
              id: true,
              name: true,
              position: true,
              phoneNumber: true,
              email: true,
            },
          },
        },
      },
    },
  })

  if (!document) {
    return c.json({ error: 'Document not found' }, 404)
  }

  // Increment view count
  prisma.document.update({
    where: { id: document.id },
    data: { viewCount: { increment: 1 } },
  }).catch(console.error)

  return c.json(document)
})

/**
 * Create document
 */
documents.post('/', requireAuth, requireStaff, async (c) => {
  const body = await validateBody(await c.req.json(), createDocumentSchema)
  const wardId = c.get('wardId') as string

  if (!wardId) {
    return c.json({ error: 'User must belong to a ward' }, 400)
  }

  const slug = await generateUniqueSlug(body.title, async (slug) => {
    const existing = await prisma.document.findUnique({ where: { slug } })
    return !!existing
  })

  const document = await prisma.document.create({
    data: {
      ...body,
      slug,
      wardId,
      steps: body.steps ? {
        create: body.steps.map((step, index) => ({
          ...step,
          stepOrder: index + 1,
        })),
      } : undefined,
      requiredDocs: body.requiredDocs ? {
        create: body.requiredDocs,
      } : undefined,
    },
    include: {
      steps: true,
      requiredDocs: true,
    },
  })

  return c.json(document, 201)
})

/**
 * Update document
 */
documents.patch('/:id', requireAuth, requireStaff, async (c) => {
  const id = c.req.param('id')
  const body = await validateBody(await c.req.json(), updateDocumentSchema)

  const existing = await prisma.document.findUnique({ where: { id } })
  if (!existing || existing.deletedAt) {
    return c.json({ error: 'Document not found' }, 404)
  }

  let slug = existing.slug
  if (body.title && body.title !== existing.title) {
    slug = await generateUniqueSlug(body.title, async (slug) => {
      const existing = await prisma.document.findFirst({
        where: { slug, id: { not: id } },
      })
      return !!existing
    })
  }

  const document = await prisma.document.update({
    where: { id },
    data: { ...body, slug },
  })

  return c.json(document)
})

/**
 * Delete document
 */
documents.delete('/:id', requireAuth, requireStaff, async (c) => {
  const id = c.req.param('id')

  const document = await prisma.document.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  return c.json({ message: 'Document deleted', document })
})

/**
 * Track form download
 */
documents.post('/:id/forms/:formId/download', optionalAuth, async (c) => {
  const { id, formId } = c.req.param()
  const userId = c.get('userId') as string | undefined

  // Increment download count
  await prisma.documentForm.update({
    where: { id: formId },
    data: { downloadCount: { increment: 1 } },
  })

  // Log download
  if (userId) {
    await prisma.downloadLog.create({
      data: {
        userId,
        formId,
        documentId: id,
      },
    })
  }

  return c.json({ message: 'Download tracked' })
})

export default documents
