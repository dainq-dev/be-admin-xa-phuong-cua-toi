/**
 * Global Error Handler Middleware
 */

import type { ErrorHandler } from 'hono'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'

export const errorHandler: ErrorHandler = (err, c) => {
  console.error('Error:', err)

  // Zod validation errors
  if (err instanceof ZodError) {
    return c.json(
      {
        error: 'Validation failed',
        details: err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
      400
    )
  }

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (err.code === 'P2002') {
      return c.json(
        {
          error: 'Duplicate entry',
          message: `A record with this ${err.meta?.target} already exists`,
        },
        409
      )
    }

    // Record not found
    if (err.code === 'P2025') {
      return c.json(
        {
          error: 'Not found',
          message: 'The requested record was not found',
        },
        404
      )
    }
  }

  // JWT errors
  if (err.message.includes('token')) {
    return c.json(
      {
        error: 'Authentication failed',
        message: err.message,
      },
      401
    )
  }

  // Default error
  return c.json(
    {
      error: 'Internal server error',
      message: err.message || 'Something went wrong',
    },
    500
  )
}
