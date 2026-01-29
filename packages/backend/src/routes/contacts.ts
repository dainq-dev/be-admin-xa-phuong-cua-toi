/**
 * Contacts Routes
 */

import { Hono } from 'hono'
import { prisma } from '../lib/prisma'
import { requireAuth, requireStaff, optionalAuth } from '../middleware/auth'
import { createContactSchema, updateContactSchema, createEmergencyContactSchema, validateBody } from '../utils/validators'

const contacts = new Hono()

/**
 * Get all contacts
 */
contacts.get('/', optionalAuth, async (c) => {
  const wardId = c.get('wardId') as string | undefined
  const department = c.req.query('department')

  const where: any = { deletedAt: null }
  if (wardId) where.wardId = wardId
  if (department) where.department = department

  const items = await prisma.contact.findMany({
    where,
    orderBy: [
      { isEmergency: 'desc' },
      { displayOrder: 'asc' },
    ],
  })

  return c.json({ items })
})

/**
 * Get emergency contacts
 */
contacts.get('/emergency', optionalAuth, async (c) => {
  const wardId = c.get('wardId') as string | undefined

  const where: any = {}
  if (wardId) where.wardId = wardId

  const items = await prisma.emergencyContact.findMany({
    where,
    orderBy: { displayOrder: 'asc' },
  })

  return c.json({ items })
})

/**
 * Create contact
 */
contacts.post('/', requireAuth, requireStaff, async (c) => {
  const body = await validateBody(await c.req.json(), createContactSchema)
  const wardId = c.get('wardId') as string

  if (!wardId) {
    return c.json({ error: 'User must belong to a ward' }, 400)
  }

  const contact = await prisma.contact.create({
    data: { ...body, wardId },
  })

  return c.json(contact, 201)
})

/**
 * Update contact
 */
contacts.patch('/:id', requireAuth, requireStaff, async (c) => {
  const id = c.req.param('id')
  const body = await validateBody(await c.req.json(), updateContactSchema)

  const contact = await prisma.contact.update({
    where: { id },
    data: body,
  })

  return c.json(contact)
})

/**
 * Delete contact
 */
contacts.delete('/:id', requireAuth, requireStaff, async (c) => {
  const id = c.req.param('id')

  const contact = await prisma.contact.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  return c.json({ message: 'Contact deleted', contact })
})

/**
 * Track call
 */
contacts.post('/:id/call', optionalAuth, async (c) => {
  const id = c.req.param('id')
  const userId = c.get('userId') as string | undefined

  const contact = await prisma.contact.findUnique({ where: { id } })
  if (!contact) {
    return c.json({ error: 'Contact not found' }, 404)
  }

  if (userId) {
    await prisma.callLog.create({
      data: {
        userId,
        contactId: id,
        phoneNumber: contact.phoneNumber,
      },
    })
  }

  return c.json({ message: 'Call tracked' })
})

/**
 * Create emergency contact
 */
contacts.post('/emergency', requireAuth, requireStaff, async (c) => {
  const body = await validateBody(await c.req.json(), createEmergencyContactSchema)
  const wardId = c.get('wardId') as string

  if (!wardId) {
    return c.json({ error: 'User must belong to a ward' }, 400)
  }

  const contact = await prisma.emergencyContact.create({
    data: { ...body, wardId },
  })

  return c.json(contact, 201)
})

export default contacts
