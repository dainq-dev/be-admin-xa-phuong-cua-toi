/**
 * News Module Types & DTOs
 * Type definitions for News domain
 */

import type { NewsArticle, NewsTag, User, Ward, NewsArticleTag } from '@prisma/client'
import type { NewsBlock } from '@phuong-xa/shared'

// ============================================
// ENUMS & CONSTANTS
// ============================================

export enum NewsCategory {
  SU_KIEN = 'su_kien',
  THONG_BAO = 'thong_bao',
  CHINH_SACH = 'chinh_sach',
  HOAT_DONG = 'hoat_dong',
  KHAC = 'khac',
}

// ============================================
// INPUT DTOs
// ============================================

export interface CreateArticleInput {
  title: string
  summary?: string
  content: string
  imageUrl?: string
  category: string
  isFeatured?: boolean
  isPinned?: boolean
  status?: string // draft, published, etc
  publishedAt?: string
  tags?: string[]
  blocks?: Record<string, unknown>[] // JSON blocks from request, validated at runtime
  wardId: string
  authorId: string
}

export interface UpdateArticleInput {
  title?: string
  summary?: string
  content?: string
  imageUrl?: string
  category?: string
  isFeatured?: boolean
  isPinned?: boolean
  status?: string
  publishedAt?: string
  blocks?: Record<string, unknown>[] // JSON blocks from request, validated at runtime
}

export interface NewsFiltersInput {
  wardId?: string
  category?: string
  isFeatured?: boolean
  isPinned?: boolean
  status?: string // Filter by status (published, draft)
  search?: string
  limit: number
  offset: number
}

// ============================================
// DATABASE RESULT TYPES
// ============================================

/**
 * Article with author relation
 */
export type ArticleWithAuthor = NewsArticle & {
  author: {
    id: string
    name: string
    avatarUrl: string | null
  } | null
}

/**
 * Article with tags relation
 */
export type ArticleWithTags = NewsArticle & {
  tags: Array<{
    tag: NewsTag
  }>
}

/**
 * Article with all relations
 */
export type ArticleWithRelations = NewsArticle & {
  author: {
    id: string
    name: string
    avatarUrl: string | null
  } | null
  tags: Array<{
    tag: NewsTag
  }>
  ward?: {
    id: string
    name: string
    code: string
  } | null
}

// ============================================
// RESPONSE DTOs
// ============================================

/**
 * Simplified author info for API responses
 */
export interface ArticleAuthorResponse {
  id: string
  name: string
  avatarUrl: string | null
}

/**
 * Ward info for API responses
 */
export interface ArticleWardResponse {
  id: string
  name: string
  code: string
}

/**
 * Article response DTO
 */
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
  status: string
  blocks?: NewsBlock[]
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
  tags: string[]
  author?: ArticleAuthorResponse | null
  ward?: ArticleWardResponse | null
}

/**
 * Paginated article list response
 */
export interface ArticleListResponse {
  items: ArticleResponse[]
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

// ============================================
// REPOSITORY DATA TYPES
// ============================================

/**
 * Data structure for creating article in repository
 */
export interface CreateArticleData {
  title: string
  slug: string
  summary?: string | null
  content: string
  imageUrl?: string | null
  category: string
  isFeatured?: boolean
  isPinned?: boolean
  status?: string
  publishedAt: Date
  blocks?: any // Prisma Json type
  wardId: string
  authorId: string
}

/**
 * Data structure for updating article in repository
 */
export interface UpdateArticleData {
  title?: string
  slug?: string
  summary?: string | null
  content?: string
  imageUrl?: string | null
  category?: string
  isFeatured?: boolean
  isPinned?: boolean
  status?: string
  publishedAt?: Date
  blocks?: any // Prisma Json type
}

// ============================================
// TAG TYPES
// ============================================

export interface CreateTagData {
  name: string
  slug: string
}

export interface TagResponse {
  id: string
  name: string
  slug: string
  createdAt: Date
}
