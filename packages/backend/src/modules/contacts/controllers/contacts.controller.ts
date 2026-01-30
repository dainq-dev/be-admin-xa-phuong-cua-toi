/**
 * Contacts Controller
 */

import { Context } from 'hono'
import { ContactsService } from '../services/contacts.service'
import { 
  createContactSchema, 
  updateContactSchema, 
  createEmergencyContactSchema, 
  validateBody 
} from '../../../utils/validators'

export class ContactsController {
  constructor(private readonly service: ContactsService) {}

  /**
   * List contacts
   */
  async list(c: Context) {
    const wardId = c.get('wardId') as string | undefined
    const department = c.req.query('department')

    const items = await this.service.listContacts(wardId, department)
    return c.json({ items })
  }

  /**
   * Get departments
   */
  async getDepartments(c: Context) {
    const departments = await this.service.getDepartments()
    return c.json({ items: departments })
  }

  /**
   * List emergency contacts
   */
  async listEmergency(c: Context) {
    const wardId = c.get('wardId') as string | undefined

    const items = await this.service.listEmergencyContacts(wardId)
    return c.json({ items })
  }

  /**
   * Create contact
   */
  async create(c: Context) {
    const body = await validateBody(await c.req.json(), createContactSchema)
    const wardId = c.get('wardId') as string

    if (!wardId) {
      return c.json({ error: 'User must belong to a ward' }, 400)
    }

    const contact = await this.service.createContact(body, wardId)
    return c.json(contact, 201)
  }

  /**
   * Update contact
   */
  async update(c: Context) {
    const id = c.req.param('id')
    const body = await validateBody(await c.req.json(), updateContactSchema)

    const contact = await this.service.updateContact(id, body)
    return c.json(contact)
  }

  /**
   * Delete contact
   */
  async delete(c: Context) {
    const id = c.req.param('id')

    const contact = await this.service.deleteContact(id)
    return c.json({ message: 'Contact deleted', contact })
  }

  /**
   * Track call
   */
  async trackCall(c: Context) {
    const id = c.req.param('id')
    const userId = c.get('userId') as string | undefined

    const contact = await this.service.getContactById(id)
    if (!contact) {
      return c.json({ error: 'Contact not found' }, 404)
    }

    if (userId) {
      await this.service.trackCall(userId, id, contact.phoneNumber)
    }

    return c.json({ message: 'Call tracked' })
  }

  /**
   * Create emergency contact
   */
  async createEmergency(c: Context) {
    const body = await validateBody(await c.req.json(), createEmergencyContactSchema)
    const wardId = c.get('wardId') as string

    if (!wardId) {
      return c.json({ error: 'User must belong to a ward' }, 400)
    }

    const contact = await this.service.createEmergencyContact(body, wardId)
    return c.json(contact, 201)
  }
}
