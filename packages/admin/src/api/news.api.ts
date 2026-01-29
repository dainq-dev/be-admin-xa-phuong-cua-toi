/**
 * News API Endpoints
 * All news-related API calls
 */

import type { ArticleResponse, ArticleListResponse } from '@phuong-xa/shared'
import apiClient from './client'

export interface CreateArticleRequest {
  title: string
  content: string
  excerpt?: string
  categoryId: string
  tags?: string[]
  featuredImage?: string
  isFeatured?: boolean
  isPublished?: boolean
}

export interface UpdateArticleRequest {
  title?: string
  content?: string
  excerpt?: string
  categoryId?: string
  tags?: string[]
  featuredImage?: string
  isFeatured?: boolean
  isPublished?: boolean
}

export interface ListArticlesParams {
  limit?: number
  offset?: number
  categoryId?: string
  wardId?: string
  isPublished?: boolean
  isFeatured?: boolean
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
