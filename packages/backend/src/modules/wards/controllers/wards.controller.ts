/**
 * Wards Controller
 */

import { Context } from 'hono'
import { WardsService } from '../services/wards.service'
import { updatePageThemeSchema, updateFeatureFlagSchema, validateBody } from '../../../utils/validators'

export class WardsController {
  constructor(private readonly service: WardsService) {}

  /**
   * List wards
   */
  async list(c: Context) {
    const wards = await this.service.listWards()
    return c.json(wards)
  }

  /**
   * Get ward
   */
  async get(c: Context) {
    const id = c.req.param('id')
    const ward = await this.service.getWardDetails(id)

    if (!ward) {
      return c.json({ error: 'Ward not found' }, 404)
    }

    return c.json(ward)
  }

  /**
   * Get theme
   */
  async getTheme(c: Context) {
    const { id, pageKey } = c.req.param()
    const theme = await this.service.getPageTheme(id, pageKey)
    return c.json(theme)
  }

  /**
   * Update theme
   */
  async updateTheme(c: Context) {
    const id = c.req.param('id')
    const body = await validateBody(await c.req.json(), updatePageThemeSchema)

    const theme = await this.service.updatePageTheme(id, body)
    return c.json(theme)
  }

  /**
   * Get features
   */
  async getFeatures(c: Context) {
    const id = c.req.param('id')
    const flags = await this.service.getFeatureFlags(id)
    return c.json(flags)
  }

  /**
   * Update feature
   */
  async updateFeature(c: Context) {
    const id = c.req.param('id')
    const body = await validateBody(await c.req.json(), updateFeatureFlagSchema)

    const flag = await this.service.updateFeatureFlag(id, body)
    return c.json(flag)
  }
}
