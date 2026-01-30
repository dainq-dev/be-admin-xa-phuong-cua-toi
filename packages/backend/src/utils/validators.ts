/**
 * Validation Schemas
 * Zod schemas for request validation
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
// DOCUMENT SCHEMAS
// ============================================

export const createDocumentSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  category: z.enum(['giay_to_ca_nhan', 'dich_vu_cong', 'ho_tich', 'dat_dai', 'xay_dung', 'khac']),
  department: z.string().optional(),
  processingTime: z.string().optional(),
  fee: z.string().optional(),
  steps: z.array(z.object({
    title: z.string(),
    description: z.string().optional(),
    location: z.string().optional(),
    estimatedTime: z.string().optional(),
  })).optional(),
  requiredDocs: z.array(z.object({
    name: z.string(),
    isRequired: z.boolean().default(true),
    notes: z.string().optional(),
  })).optional(),
})

export const updateDocumentSchema = createDocumentSchema.partial()

// ============================================
// CONTACT SCHEMAS
// ============================================

export const createContactSchema = z.object({
  name: z.string().min(1),
  position: z.string().optional(),
  department: z.enum(['cong_an', 'y_te', 'van_phong', 'kinh_te', 'van_hoa', 'khac']),
  phoneNumber: z.string().min(1),
  alternatePhone: z.string().optional(),
  email: z.string().email().optional(),
  officeLocation: z.string().optional(),
  workingHours: z.string().optional(),
  isEmergency: z.boolean().default(false),
  avatarUrl: z.string().url().optional(),
  zaloId: z.string().optional(),
  displayOrder: z.number().default(0),
})

export const updateContactSchema = createContactSchema.partial()

export const createEmergencyContactSchema = z.object({
  title: z.string().min(1).max(100),
  phoneNumber: z.string().min(1),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  description: z.string().optional(),
  displayOrder: z.number().default(0),
})

// ============================================
// FEEDBACK SCHEMAS
// ============================================

export const createFeedbackSchema = z.object({
  category: z.enum(['ha_tang', 'y_te', 'an_ninh', 'moi_truong', 'giao_thong', 'dich_vu_cong', 'khac']),
  title: z.string().min(1).max(255),
  description: z.string().min(20),
  locationLat: z.number().optional(),
  locationLng: z.number().optional(),
  locationAddress: z.string().optional(),
  contactPreference: z.enum(['phone', 'zalo', 'none']).optional(),
  isUrgent: z.boolean().default(false),
  photoUrls: z.array(z.string().url()).max(3).optional(),
})

export const updateFeedbackStatusSchema = z.object({
  status: z.enum(['pending', 'reviewing', 'in_progress', 'resolved', 'rejected']),
  responseMessage: z.string().optional(),
  assignedTo: z.string().uuid().optional(),
})

export const feedbackFiltersSchema = z.object({
  category: z.string().optional(),
  status: z.string().optional(),
  userId: z.string().uuid().optional(),
  wardId: z.string().uuid().optional(),
  limit: z.coerce.number().default(10),
  offset: z.coerce.number().default(0),
})

// ============================================
// PROFILE SCHEMAS
// ============================================

export const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  avatarUrl: z.string().url().optional(),
})

export const updateSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  language: z.enum(['vi', 'en']).optional(),
  notificationsEnabled: z.boolean().optional(),
  feedbackUpdates: z.boolean().optional(),
  newsAlerts: z.boolean().optional(),
  emergencyAlerts: z.boolean().optional(),
})

// ============================================
// WARD SCHEMAS
// ============================================

export const updatePageThemeSchema = z.object({
  pageKey: z.enum(['home', 'news', 'documents', 'contacts', 'profile', 'feedback']),
  themeConfig: z.record(z.any()),
  isActive: z.boolean().optional(),
})

export const updateFeatureFlagSchema = z.object({
  featureKey: z.string(),
  isEnabled: z.boolean(),
  config: z.record(z.any()).optional(),
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
