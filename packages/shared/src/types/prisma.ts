/**
 * Database Types
 * Type definitions matching Prisma schema
 * These are manually defined to avoid Prisma dependency in frontend
 */

// ============================================
// USER TYPES
// ============================================

export interface User {
  id: string
  zaloId: string | null
  email: string | null
  name: string
  avatarUrl: string | null
  phoneNumber: string | null
  address: string | null
  wardId: string | null
  role: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export interface UserSession {
  id: string
  userId: string
  token: string
  deviceInfo: any | null
  ipAddress: string | null
  expiresAt: Date
  createdAt: Date
}

export interface UserSettings {
  id: string
  userId: string
  theme: string
  language: string
  notificationsEnabled: boolean
  feedbackUpdates: boolean
  newsAlerts: boolean
  emergencyAlerts: boolean
  createdAt: Date
  updatedAt: Date
}

// ============================================
// ADMINISTRATIVE TYPES
// ============================================

export interface Province {
  id: string
  name: string
  code: string
  createdAt: Date
}

export interface District {
  id: string
  name: string
  code: string
  provinceId: string
  createdAt: Date
}

export interface Ward {
  id: string
  name: string
  code: string
  districtId: string
  provinceId: string
  contactInfo: any | null
  settings: any
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// ============================================
// NEWS TYPES
// ============================================

export interface NewsArticle {
  id: string
  wardId: string
  title: string
  slug: string
  summary: string | null
  content: string
  imageUrl: string | null
  category: string
  authorId: string | null
  viewCount: number
  isFeatured: boolean
  isPinned: boolean
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export interface NewsTag {
  id: string
  name: string
  slug: string
  createdAt: Date
}

export interface NewsArticleTag {
  articleId: string
  tagId: string
  createdAt: Date
}

// ============================================
// DOCUMENT TYPES
// ============================================

export interface Document {
  id: string
  wardId: string
  title: string
  slug: string
  description: string | null
  category: string
  department: string | null
  processingTime: string | null
  fee: string | null
  downloadCount: number
  viewCount: number
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export interface DocumentStep {
  id: string
  documentId: string
  stepOrder: number
  title: string
  description: string | null
  location: string | null
  estimatedTime: string | null
  createdAt: Date
}

export interface DocumentRequiredDoc {
  id: string
  documentId: string
  name: string
  isRequired: boolean
  notes: string | null
  createdAt: Date
}

export interface DocumentForm {
  id: string
  documentId: string
  name: string
  fileType: string
  fileUrl: string
  fileSize: number | null
  downloadCount: number
  createdAt: Date
  updatedAt: Date
}

// ============================================
// CONTACT TYPES
// ============================================

export interface Contact {
  id: string
  wardId: string
  name: string
  position: string | null
  department: string
  phoneNumber: string
  alternatePhone: string | null
  email: string | null
  officeLocation: string | null
  workingHours: string | null
  isEmergency: boolean
  avatarUrl: string | null
  zaloId: string | null
  displayOrder: number
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export interface EmergencyContact {
  id: string
  wardId: string
  title: string
  phoneNumber: string
  icon: string | null
  color: string | null
  description: string | null
  displayOrder: number
  createdAt: Date
  updatedAt: Date
}

// ============================================
// FEEDBACK TYPES
// ============================================

export interface FeedbackSubmission {
  id: string
  wardId: string
  userId: string
  category: string
  title: string
  description: string
  locationLat: number | null
  locationLng: number | null
  locationAddress: string | null
  status: string
  priority: string
  assignedTo: string | null
  responseMessage: string | null
  contactPreference: string | null
  isUrgent: boolean
  resolvedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface FeedbackPhoto {
  id: string
  feedbackId: string
  photoUrl: string
  thumbnailUrl: string | null
  uploadOrder: number
  createdAt: Date
}

export interface FeedbackHistory {
  id: string
  feedbackId: string
  oldStatus: string | null
  newStatus: string
  message: string | null
  changedBy: string | null
  createdAt: Date
}

// ============================================
// ANALYTICS TYPES
// ============================================

export interface AnalyticsEvent {
  id: string
  userId: string | null
  wardId: string | null
  eventType: string
  entityType: string | null
  entityId: string | null
  metadata: any | null
  createdAt: Date
}

export interface CallLog {
  id: string
  userId: string | null
  contactId: string | null
  phoneNumber: string
  callDuration: number | null
  createdAt: Date
}

export interface DownloadLog {
  id: string
  userId: string | null
  formId: string | null
  documentId: string | null
  createdAt: Date
}

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Add relations to a type
 */
export type WithRelations<T, R> = T & R

/**
 * Make all Date fields optional
 */
export type WithOptionalDates<T> = Omit<T, 'createdAt' | 'updatedAt' | 'deletedAt'> & {
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date | null
}
