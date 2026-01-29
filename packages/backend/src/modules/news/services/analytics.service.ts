/**
 * Analytics Service for News Module
 * Track events and analytics for news articles
 */

import type { PrismaClient } from '../../../core/database/prisma.client'
import type { ArticleWithRelations } from '../models/types'

export class NewsAnalyticsService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Track article created event
   */
  async trackArticleCreated(article: ArticleWithRelations): Promise<void> {
    try {
      await this.prisma.analyticsEvent.create({
        data: {
          userId: article.authorId,
          wardId: article.wardId,
          eventType: 'create',
          entityType: 'news',
          entityId: article.id,
          metadata: {
            title: article.title,
            category: article.category,
            isFeatured: article.isFeatured,
            isPinned: article.isPinned,
          },
        },
      })
    } catch (error) {
      console.error('Failed to track article created event:', error)
    }
  }

  /**
   * Track article view event
   */
  async trackArticleView(
    articleId: string,
    wardId: string,
    userId?: string
  ): Promise<void> {
    try {
      if (!userId) {
        // Don't track anonymous views
        return
      }

      await this.prisma.analyticsEvent.create({
        data: {
          userId,
          wardId,
          eventType: 'view',
          entityType: 'news',
          entityId: articleId,
        },
      })
    } catch (error) {
      console.error('Failed to track article view event:', error)
    }
  }

  /**
   * Track article updated event
   */
  async trackArticleUpdated(
    article: ArticleWithRelations,
    userId: string
  ): Promise<void> {
    try {
      await this.prisma.analyticsEvent.create({
        data: {
          userId,
          wardId: article.wardId,
          eventType: 'update',
          entityType: 'news',
          entityId: article.id,
        },
      })
    } catch (error) {
      console.error('Failed to track article updated event:', error)
    }
  }

  /**
   * Track article deleted event
   */
  async trackArticleDeleted(
    articleId: string,
    wardId: string,
    userId: string
  ): Promise<void> {
    try {
      await this.prisma.analyticsEvent.create({
        data: {
          userId,
          wardId,
          eventType: 'delete',
          entityType: 'news',
          entityId: articleId,
        },
      })
    } catch (error) {
      console.error('Failed to track article deleted event:', error)
    }
  }
}
