/**
 * Backend API Server
 * Phường Xã Của Tôi
 */

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { secureHeaders } from 'hono/secure-headers'

// Old routes (kept for reference, can be deleted later)
// import oldAuthRoutes from './routes/auth'
// import oldNewsRoutes from './routes/news'

// MVC Modules
import { registerNewsModule, newsRoutes } from './modules/news'
import { registerAuthModule, authRoutes } from './modules/auth'
import { registerContactsModule, contactsRoutes } from './modules/contacts'
import { registerDocumentsModule, documentsRoutes } from './modules/documents'
import { registerFeedbackModule, feedbackRoutes } from './modules/feedback'
import { registerProfileModule, profileRoutes } from './modules/profile'
import { registerWardsModule, wardsRoutes } from './modules/wards'
import { registerAnalyticsModule, analyticsRoutes } from './modules/analytics'

// Middleware
import { errorHandler } from './middleware/error-handler'
import { rateLimiter } from './middleware/rate-limiter'

// Config
import { env } from './lib/env'
import { runHealthChecks, getHealthStatus } from './lib/health-check'

// Initialize app
const app = new Hono()

// Register MVC module dependencies
registerNewsModule()
registerAuthModule()
registerContactsModule()
registerDocumentsModule()
registerFeedbackModule()
registerProfileModule()
registerWardsModule()
registerAnalyticsModule()
console.log('✅ MVC modules registered (News, Auth, Contacts, Documents, Feedback, Profile, Wards, Analytics)')

// Global middleware
app.use('*', logger())
app.use('*', secureHeaders())
app.use('*', cors({
  origin: env.CORS_ORIGIN.split(','),
  credentials: true,
}))
app.use('*', prettyJSON())
app.use('*', rateLimiter())

// Health check
app.get('/health', async (c) => {
  const health = await getHealthStatus()
  return c.json({
    ...health,
    environment: env.NODE_ENV,
  })
})

// API routes
const api = new Hono()

// MVC routes
api.route('/auth', authRoutes)
api.route('/news', newsRoutes)
api.route('/contacts', contactsRoutes)
api.route('/documents', documentsRoutes)
api.route('/feedback', feedbackRoutes)
api.route('/profile', profileRoutes)
api.route('/wards', wardsRoutes)
api.route('/analytics', analyticsRoutes)

// Mount API routes
app.route(env.API_PREFIX, api)

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found', path: c.req.path }, 404)
})

// Error handler
app.onError(errorHandler)

// Run health checks on startup
runHealthChecks().then(() => {
  console.log(`🚀 Server starting on port ${env.PORT}...`)
  console.log(`📝 Environment: ${env.NODE_ENV}`)
  console.log(`🔗 API Base: http://localhost:${env.PORT}${env.API_PREFIX}\n`)
})

export default {
  port: env.PORT,
  fetch: app.fetch,
}
