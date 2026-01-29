/**
 * API Types
 * Shared DTOs between frontend and backend
 */

// ============================================
// AUTH TYPES
// ============================================

export interface LoginResponse {
  user: UserResponse
  accessToken: string
  refreshToken: string
}

export interface UserResponse {
  id: string
  name: string
  email?: string | null
  zaloId?: string | null
  avatarUrl?: string | null
  role: string
  wardId?: string | null
  ward?: {
    id: string
    name: string
    code: string
  } | null
}

export interface OTPRequestResponse {
  message: string
  email: string
  expiresIn: number
}

// ============================================
// NEWS TYPES
// ============================================

export interface ArticleResponse {
  id: string
  wardId: string
  title: string
  slug: string
  summary: string | null
  content: string
  imageUrl: string | null
  category: string
  viewCount: number
  isFeatured: boolean
  isPinned: boolean
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
  tags: string[]
  author?: {
    id: string
    name: string
    avatarUrl: string | null
  } | null
  ward?: {
    id: string
    name: string
    code: string
  } | null
}

export interface ArticleListResponse {
  items: ArticleResponse[]
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

export interface TagResponse {
  id: string
  name: string
  slug: string
  createdAt: Date
}

// ============================================
// DOCUMENT TYPES
// ============================================

export interface DocumentResponse {
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
  steps?: DocumentStepResponse[]
  requiredDocs?: RequiredDocResponse[]
  forms?: DocumentFormResponse[]
}

export interface DocumentStepResponse {
  id: string
  stepOrder: number
  title: string
  description: string | null
  location: string | null
  estimatedTime: string | null
}

export interface RequiredDocResponse {
  id: string
  name: string
  isRequired: boolean
  notes: string | null
}

export interface DocumentFormResponse {
  id: string
  name: string
  fileType: string
  fileUrl: string
  fileSize: number | null
  downloadCount: number
}

// ============================================
// CONTACT TYPES
// ============================================

export interface ContactResponse {
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
}

export interface EmergencyContactResponse {
  id: string
  wardId: string
  title: string
  phoneNumber: string
  icon: string | null
  color: string | null
  description: string | null
  displayOrder: number
}

// ============================================
// FEEDBACK TYPES
// ============================================

export interface FeedbackResponse {
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
  photos?: FeedbackPhotoResponse[]
  history?: FeedbackHistoryResponse[]
}

export interface FeedbackPhotoResponse {
  id: string
  photoUrl: string
  thumbnailUrl: string | null
  uploadOrder: number
}

export interface FeedbackHistoryResponse {
  id: string
  oldStatus: string | null
  newStatus: string
  message: string | null
  changedBy: string | null
  createdAt: Date
}

// ============================================
// COMMON TYPES
// ============================================

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

export interface ErrorResponse {
  error: string
  message?: string
  details?: Record<string, any>
}

export interface SuccessResponse<T = any> {
  success: boolean
  data?: T
  message?: string
}

// ============================================
// ENUMS
// ============================================

export enum NewsCategory {
  SU_KIEN = 'su_kien',
  THONG_BAO = 'thong_bao',
  CHINH_SACH = 'chinh_sach',
  HOAT_DONG = 'hoat_dong',
  KHAC = 'khac',
}

export enum DocumentCategory {
  GIAY_TO_CA_NHAN = 'giay_to_ca_nhan',
  DICH_VU_CONG = 'dich_vu_cong',
  HO_TICH = 'ho_tich',
  DAT_DAI = 'dat_dai',
  XAY_DUNG = 'xay_dung',
  KHAC = 'khac',
}

export enum ContactDepartment {
  CONG_AN = 'cong_an',
  Y_TE = 'y_te',
  VAN_PHONG = 'van_phong',
  KINH_TE = 'kinh_te',
  VAN_HOA = 'van_hoa',
  KHAC = 'khac',
}

export enum FeedbackCategory {
  HA_TANG = 'ha_tang',
  Y_TE = 'y_te',
  AN_NINH = 'an_ninh',
  MOI_TRUONG = 'moi_truong',
  GIAO_THONG = 'giao_thong',
  DICH_VU_CONG = 'dich_vu_cong',
  KHAC = 'khac',
}

export enum FeedbackStatus {
  PENDING = 'pending',
  REVIEWING = 'reviewing',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  REJECTED = 'rejected',
}

export enum UserRole {
  CITIZEN = 'citizen',
  STAFF = 'staff',
  ADMIN = 'admin',
}
