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
  status: z.enum(['draft', 'published', 'archived', 'hidden']).default('draft'),
  blocks: z.array(z.record(z.string(), z.any())).optional(),
  publishedAt: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
})

export const updateNewsSchema = createNewsSchema.partial()

export const newsFiltersSchema = z.object({
  wardId: z.string().optional(),
  category: z.enum(['su_kien', 'thong_bao', 'chinh_sach', 'hoat_dong', 'khac']).optional(),
  isFeatured: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  isPinned: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  status: z.enum(['draft', 'published', 'archived', 'hidden']).optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().positive().default(10),
  offset: z.coerce.number().int().min(0).default(0),
})

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Validate request body with Zod schema
 * Using ZodType with 'any' for input allows schemas with .default() and .transform()
 */
export async function validateBody<T>(
  body: unknown,
  schema: z.ZodType<T, z.ZodTypeDef, any>
): Promise<T> {
  return await schema.parseAsync(body)
}

/**
 * Type exports for use in other modules
 */
export type CreateNewsInput = z.infer<typeof createNewsSchema>
export type UpdateNewsInput = z.infer<typeof updateNewsSchema>
export type NewsFilters = z.infer<typeof newsFiltersSchema>
