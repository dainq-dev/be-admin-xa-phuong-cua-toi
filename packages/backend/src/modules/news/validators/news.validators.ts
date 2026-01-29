/**
 * News Module Validators
 * Zod schemas for News API validation
 */

import { z } from 'zod'

// ============================================
// NEWS SCHEMAS
// ============================================

export const createNewsSchema = z.object({
  title: z.string().min(1).max(500),
  summary: z.string().optional(),
  content: z.string().min(1),
  imageUrl: z.string().url().optional(),
  category: z.enum(['su_kien', 'thong_bao', 'chinh_sach', 'hoat_dong', 'khac']),
  isFeatured: z.boolean().default(false),
  isPinned: z.boolean().default(false),
  publishedAt: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
})

export const updateNewsSchema = createNewsSchema.partial()

export const newsFiltersSchema = z.object({
  category: z.enum(['su_kien', 'thong_bao', 'chinh_sach', 'hoat_dong', 'khac']).optional(),
  isFeatured: z.string().transform((v) => v === 'true').optional(),
  isPinned: z.string().transform((v) => v === 'true').optional(),
  search: z.string().optional(),
  limit: z.string().transform(Number).default('10'),
  offset: z.string().transform(Number).default('0'),
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
export type CreateNewsInput = z.infer<typeof createNewsSchema>
export type UpdateNewsInput = z.infer<typeof updateNewsSchema>
export type NewsFilters = z.infer<typeof newsFiltersSchema>
