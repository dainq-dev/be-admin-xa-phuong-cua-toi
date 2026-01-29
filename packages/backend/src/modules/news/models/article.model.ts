/**
 * Article Domain Model
 * Business logic and transformations for News Articles
 */

import type { User } from '@prisma/client'
import type {
  ArticleWithRelations,
  ArticleResponse,
  ArticleAuthorResponse,
  ArticleWardResponse,
} from './types'

export class Article {
  constructor(private data: ArticleWithRelations) {}

  /**
   * Check if article is currently published
   */
  isPublished(): boolean {
    return (
      this.data.publishedAt !== null &&
      this.data.publishedAt <= new Date() &&
      this.data.deletedAt === null
    )
  }

  /**
   * Check if article is scheduled for future publish
   */
  isScheduled(): boolean {
    return (
      this.data.publishedAt !== null &&
      this.data.publishedAt > new Date() &&
      this.data.deletedAt === null
    )
  }

  /**
   * Check if article is deleted (soft delete)
   */
  isDeleted(): boolean {
    return this.data.deletedAt !== null
  }

  /**
   * Check if user can edit this article
   * Rules:
   * - Author can edit their own article
   * - Admin can edit any article
   * - Staff from same ward can edit
   */
  canEdit(user: User): boolean {
    // Admin can edit everything
    if (user.role === 'admin') {
      return true
    }

    // Author can edit their own article
    if (user.id === this.data.authorId) {
      return true
    }

    // Staff from same ward can edit
    if (user.role === 'staff' && user.wardId === this.data.wardId) {
      return true
    }

    return false
  }

  /**
   * Check if user can delete this article
   * Same rules as edit, but maybe stricter in the future
   */
  canDelete(user: User): boolean {
    return this.canEdit(user)
  }

  /**
   * Check if article is featured
   */
  isFeatured(): boolean {
    return this.data.isFeatured
  }

  /**
   * Check if article is pinned
   */
  isPinned(): boolean {
    return this.data.isPinned
  }

  /**
   * Get tag names as array
   */
  getTagNames(): string[] {
    return this.data.tags?.map((t) => t.tag.name) ?? []
  }

  /**
   * Transform to API response format
   */
  toResponse(): ArticleResponse {
    return {
      id: this.data.id,
      wardId: this.data.wardId,
      title: this.data.title,
      slug: this.data.slug,
      summary: this.data.summary,
      content: this.data.content,
      imageUrl: this.data.imageUrl,
      category: this.data.category,
      viewCount: this.data.viewCount,
      isFeatured: this.data.isFeatured,
      isPinned: this.data.isPinned,
      publishedAt: this.data.publishedAt,
      createdAt: this.data.createdAt,
      updatedAt: this.data.updatedAt,
      tags: this.getTagNames(),
      author: this.data.author
        ? {
            id: this.data.author.id,
            name: this.data.author.name,
            avatarUrl: this.data.author.avatarUrl,
          }
        : null,
      ward: this.data.ward
        ? {
            id: this.data.ward.id,
            name: this.data.ward.name,
            code: this.data.ward.code,
          }
        : undefined,
    }
  }

  /**
   * Get the underlying data
   */
  getData(): ArticleWithRelations {
    return this.data
  }

  /**
   * Get article ID
   */
  getId(): string {
    return this.data.id
  }

  /**
   * Get article slug
   */
  getSlug(): string {
    return this.data.slug
  }

  /**
   * Get article title
   */
  getTitle(): string {
    return this.data.title
  }
}

/**
 * Helper function to transform raw article data to response
 * Use this when you don't need the full Article class
 */
export function articleToResponse(article: ArticleWithRelations): ArticleResponse {
  return new Article(article).toResponse()
}

/**
 * Transform array of articles to responses
 */
export function articlesToResponses(articles: ArticleWithRelations[]): ArticleResponse[] {
  return articles.map(articleToResponse)
}
