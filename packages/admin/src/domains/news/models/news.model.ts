/**
 * News Domain Model
 * Business data and logic for news articles
 */

import type { ArticleResponse } from '@phuong-xa/shared'

export interface CreateArticleInput {
  title: string
  content: string
  excerpt?: string
  categoryId: string
  tags?: string[]
  featuredImage?: string
  isFeatured?: boolean
  isPublished?: boolean
}

/**
 * News Model
 * Encapsulates news article business logic
 */
export class NewsModel {
  /**
   * Validate article title
   */
  static validateTitle(title: string): { valid: boolean; error?: string } {
    if (!title || title.trim().length === 0) {
      return { valid: false, error: 'Tiêu đề là bắt buộc' }
    }

    if (title.length < 10) {
      return { valid: false, error: 'Tiêu đề phải có ít nhất 10 ký tự' }
    }

    if (title.length > 200) {
      return { valid: false, error: 'Tiêu đề không được quá 200 ký tự' }
    }

    return { valid: true }
  }

  /**
   * Validate article content
   */
  static validateContent(content: string): { valid: boolean; error?: string } {
    if (!content || content.trim().length === 0) {
      return { valid: false, error: 'Nội dung là bắt buộc' }
    }

    if (content.length < 50) {
      return { valid: false, error: 'Nội dung phải có ít nhất 50 ký tự' }
    }

    return { valid: true }
  }

  /**
   * Check if article is published
   */
  static isPublished(article: ArticleResponse): boolean {
    return !!article.publishedAt
  }

  /**
   * Check if article is featured
   */
  static isFeatured(article: ArticleResponse): boolean {
    return article.isFeatured
  }

  /**
   * Get article status label
   */
  static getStatusLabel(article: ArticleResponse): string {
    if (this.isPublished(article)) {
      return 'Đã xuất bản'
    }
    return 'Bản nháp'
  }

  /**
   * Generate excerpt from content if not provided
   */
  static generateExcerpt(content: string, maxLength = 150): string {
    const plainText = content.replace(/<[^>]*>/g, '') // Remove HTML tags
    if (plainText.length <= maxLength) {
      return plainText
    }
    return plainText.substring(0, maxLength) + '...'
  }
}
