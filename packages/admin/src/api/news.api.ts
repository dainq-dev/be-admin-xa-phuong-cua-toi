/**
 * News API Endpoints
 * All news-related API calls
 */

import type { ArticleResponse, ArticleListResponse, NewsBlock } from '@phuong-xa/shared'
import apiClient from './client'

export type NewsCategory = 'su_kien' | 'thong_bao' | 'chinh_sach' | 'hoat_dong' | 'khac'
export type NewsStatus = 'draft' | 'published' | 'archived' | 'hidden'

export interface CreateArticleRequest {
  title: string
  content: string
  summary?: string
  category: NewsCategory
  tags?: string[]
  imageUrl?: string
  isFeatured?: boolean
  isPinned?: boolean
  status?: NewsStatus
  blocks?: NewsBlock[]
  publishedAt?: string
}

export interface UpdateArticleRequest {
  title?: string
  content?: string
  summary?: string
  category?: NewsCategory
  tags?: string[]
  imageUrl?: string
  isFeatured?: boolean
  isPinned?: boolean
  status?: NewsStatus
  blocks?: NewsBlock[]
  publishedAt?: string
}

export interface ListArticlesParams {
  limit?: number
  offset?: number
  category?: NewsCategory
  wardId?: string
  status?: NewsStatus
  isFeatured?: boolean
  isPinned?: boolean
  search?: string
}

export const NewsAPI = {
  /**
   * List articles with pagination and filters
   */
  async listArticles(params?: ListArticlesParams): Promise<ArticleListResponse> {
    return apiClient.get<ArticleListResponse>('/news', { params })
  },

  /**
   * Get article by ID or slug
   */
  async getArticle(idOrSlug: string): Promise<ArticleResponse> {
    return apiClient.get<ArticleResponse>(`/news/${idOrSlug}`)
  },

  /**
   * Create new article
   */
  async createArticle(data: CreateArticleRequest): Promise<ArticleResponse> {
    return apiClient.post<ArticleResponse>('/news', data)
  },

  /**
   * Update existing article
   */
  async updateArticle(id: string, data: UpdateArticleRequest): Promise<ArticleResponse> {
    return apiClient.patch<ArticleResponse>(`/news/${id}`, data)
  },

  /**
   * Delete article (soft delete)
   */
  async deleteArticle(id: string): Promise<void> {
    await apiClient.delete(`/news/${id}`)
  },
}
