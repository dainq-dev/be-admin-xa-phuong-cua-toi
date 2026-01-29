/**
 * News Module Routes
 * API routes for News module
 */

import { Hono } from 'hono'
import { requireAuth, requireStaff, optionalAuth } from '../../middleware/auth'
import { container } from '../../core/di/container'
import { NewsController } from './controllers/news.controller'
import { TagsController } from './controllers/tags.controller'

const news = new Hono()

// Resolve controllers from DI container
const newsController = container.resolve(NewsController)
const tagsController = container.resolve(TagsController)

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * GET / - List all articles with pagination
 */
news.get('/', optionalAuth, (c) => newsController.list(c))

/**
 * GET /:idOrSlug - Get single article by ID or slug
 */
news.get('/:idOrSlug', optionalAuth, (c) => newsController.getById(c))

// ============================================
// PROTECTED ROUTES (Staff/Admin only)
// ============================================

/**
 * POST / - Create new article
 */
news.post('/', requireAuth, requireStaff, (c) => newsController.create(c))

/**
 * PATCH /:id - Update article
 */
news.patch('/:id', requireAuth, requireStaff, (c) => newsController.update(c))

/**
 * DELETE /:id - Delete article (soft delete)
 */
news.delete('/:id', requireAuth, requireStaff, (c) => newsController.delete(c))

// ============================================
// TAGS ROUTES
// ============================================

/**
 * GET /tags/all - Get all tags
 */
news.get('/tags/all', (c) => tagsController.listAll(c))

export default news
