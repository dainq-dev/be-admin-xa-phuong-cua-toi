/**
 * Auth Module Validators
 * Zod schemas for Auth API validation
 */

import { z } from 'zod'

// ============================================
// AUTH SCHEMAS
// ============================================

export const loginZaloSchema = z.object({
  zaloAccessToken: z.string().min(1),
  zaloId: z.string().min(1),
  name: z.string().min(1),
  avatar: z.string().url().optional(),
  phoneNumber: z.string().optional(),
})

export const loginAdminSchema = z.object({
  email: z.string().email(),
})

export const verifyOTPSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
})

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
})

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Validate request body with Zod schema
 */
export async function validateBody<T>(
  body: unknown,
  schema: z.ZodSchema<T>
): Promise<T> {
  return await schema.parseAsync(body)
}

/**
 * Type exports for use in other modules
 */
export type ZaloLoginInput = z.infer<typeof loginZaloSchema>
export type EmailLoginInput = z.infer<typeof loginAdminSchema>
export type VerifyOTPInput = z.infer<typeof verifyOTPSchema>
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>
