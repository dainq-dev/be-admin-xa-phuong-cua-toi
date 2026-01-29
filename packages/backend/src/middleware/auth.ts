/**
 * Authentication Middleware
 * Verify JWT tokens and attach user to context
 */

import type { MiddlewareHandler } from 'hono'
import { verifyAccessToken } from '../lib/jwt'
import { prisma } from '../lib/prisma'

/**
 * Require authentication
 */
export const requireAuth: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized', message: 'Missing or invalid token' }, 401)
  }

  const token = authHeader.substring(7)

  try {
    const payload = await verifyAccessToken(token)

    // Verify user exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        zaloId: true,
        name: true,
        role: true,
        wardId: true,
        isActive: true,
        deletedAt: true,
      },
    })

    if (!user || !user.isActive || user.deletedAt) {
      return c.json({ error: 'Unauthorized', message: 'User not found or inactive' }, 401)
    }

    // Attach user to context
    c.set('user', user)
    c.set('userId', user.id)
    c.set('userRole', user.role)
    c.set('wardId', user.wardId || undefined)

    await next()
  } catch (error) {
    return c.json({ error: 'Unauthorized', message: 'Invalid token' }, 401)
  }
}

/**
 * Require specific role
 */
export function requireRole(...roles: string[]): MiddlewareHandler {
  return async (c, next) => {
    const userRole = c.get('userRole') as string | undefined

    if (!userRole || !roles.includes(userRole)) {
      return c.json(
        { error: 'Forbidden', message: 'Insufficient permissions' },
        403
      )
    }

    await next()
  }
}

/**
 * Require admin role
 */
export const requireAdmin = requireRole('admin')

/**
 * Require staff or admin role
 */
export const requireStaff = requireRole('staff', 'admin')

/**
 * Optional authentication (attach user if token provided)
 */
export const optionalAuth: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header('Authorization')

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7)

    try {
      const payload = await verifyAccessToken(token)
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          zaloId: true,
          name: true,
          role: true,
          wardId: true,
          isActive: true,
          deletedAt: true,
        },
      })

      if (user && user.isActive && !user.deletedAt) {
        c.set('user', user)
        c.set('userId', user.id)
        c.set('userRole', user.role)
        c.set('wardId', user.wardId || undefined)
      }
    } catch (error) {
      // Invalid token, continue without user
    }
  }

  await next()
}
