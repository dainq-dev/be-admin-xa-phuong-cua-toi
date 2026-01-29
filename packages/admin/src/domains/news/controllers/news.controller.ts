/**
 * News Controller
 * Handles control logic and API requests for news
 */

import { NewsAPI, type CreateArticleRequest, type UpdateArticleRequest, type ListArticlesParams } from '@/api/news.api'
import { APIError } from '@/api/client'
import type { ArticleResponse, ArticleListResponse } from '@phuong-xa/shared'

/**
 * News Controller
 * Orchestrates news article operations
 */
export class NewsController {
  /**
   * List articles with pagination
   */
  async listArticles(params?: ListArticlesParams): Promise<ArticleListResponse> {
    try {
      return await NewsAPI.listArticles(params)
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(error.data?.error || 'Không thể tải danh sách bài viết')
      }
      throw new Error('Không thể tải danh sách bài viết')
    }
  }

  /**
   * Get article by ID or slug
   */
  async getArticle(idOrSlug: string): Promise<ArticleResponse> {
    try {
      return await NewsAPI.getArticle(idOrSlug)
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(error.data?.error || 'Không thể tải bài viết')
      }
      throw new Error('Không thể tải bài viết')
    }
  }

  /**
   * Create new article
   */
  async createArticle(data: CreateArticleRequest): Promise<ArticleResponse> {
    try {
      return await NewsAPI.createArticle(data)
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(error.data?.error || 'Không thể tạo bài viết')
      }
      throw new Error('Không thể tạo bài viết')
    }
  }

  /**
   * Update article
   */
  async updateArticle(id: string, data: UpdateArticleRequest): Promise<ArticleResponse> {
    try {
      return await NewsAPI.updateArticle(id, data)
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(error.data?.error || 'Không thể cập nhật bài viết')
      }
      throw new Error('Không thể cập nhật bài viết')
    }
  }

  /**
   * Delete article
   */
  async deleteArticle(id: string): Promise<void> {
    try {
      await NewsAPI.deleteArticle(id)
    } catch (error) {
      if (error instanceof APIError) {
        throw new Error(error.data?.error || 'Không thể xóa bài viết')
      }
      throw new Error('Không thể xóa bài viết')
    }
  }
}
