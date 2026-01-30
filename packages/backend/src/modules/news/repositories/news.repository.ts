/**
 * News Repository
 * Data access layer for News Articles
 */

import type { NewsArticle } from '@prisma/client'
import type { PrismaClient } from '../../../core/database/prisma.client'
import type { PrismaTransaction } from '../../../core/database/prisma.client'
import type {
  CreateArticleData,
  UpdateArticleData,
  NewsFiltersInput,
  ArticleWithRelations,
} from '../models/types'

export class NewsRepository {
  /**
   * Default includes for article queries
   */
  private readonly defaultIncludes = {
    author: {
      select: {
        id: true,
        name: true,
        avatarUrl: true,
      },
    },
    tags: {
      include: {
        tag: true,
      },
    },
  }

  /**
   * Default ordering for article lists
   */
  private readonly defaultOrderBy = [
    { isPinned: 'desc' as const },
    { isFeatured: 'desc' as const },
    { publishedAt: 'desc' as const },
  ]

  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new article
   */
  async create(
    data: CreateArticleData,
    tx?: PrismaTransaction
  ): Promise<ArticleWithRelations> {
    const prisma = (tx ?? this.prisma) as any

    return await prisma.newsArticle.create({
      data,
      include: this.defaultIncludes,
    })
  }

  /**
   * Find article by ID
   */
  async findById(
    id: string,
    tx?: PrismaTransaction
  ): Promise<ArticleWithRelations | null> {
    const prisma = (tx ?? this.prisma) as any

    return await prisma.newsArticle.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        ...this.defaultIncludes,
        ward: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    })
  }

  /**
   * Find article by ID or slug
   */
  async findByIdOrSlug(
    idOrSlug: string,
    tx?: PrismaTransaction
  ): Promise<ArticleWithRelations | null> {
    const prisma = (tx ?? this.prisma) as any

    return await prisma.newsArticle.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        deletedAt: null,
      },
      include: {
        ...this.defaultIncludes,
        ward: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    })
  }

  /**
   * Find many articles with filters and pagination
   */
  async findMany(
    filters: NewsFiltersInput,
    tx?: PrismaTransaction
  ): Promise<{ items: ArticleWithRelations[]; total: number }> {
    const prisma = (tx ?? this.prisma) as any
    const where = this.buildWhereClause(filters)

    const [items, total] = await Promise.all([
      prisma.newsArticle.findMany({
        where,
        include: this.defaultIncludes,
        orderBy: this.defaultOrderBy,
        take: filters.limit,
        skip: filters.offset,
      }),
      prisma.newsArticle.count({ where }),
    ])

    return { items, total }
  }

  /**
   * Update article
   */
  async update(
    id: string,
    data: UpdateArticleData,
    tx?: PrismaTransaction
  ): Promise<ArticleWithRelations> {
    const prisma = (tx ?? this.prisma) as any

    return await prisma.newsArticle.update({
      where: { id },
      data,
      include: this.defaultIncludes,
    })
  }

  /**
   * Soft delete article
   */
  async softDelete(
    id: string,
    tx?: PrismaTransaction
  ): Promise<NewsArticle> {
    const prisma = (tx ?? this.prisma) as any

    return await prisma.newsArticle.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  }

  /**
   * Check if article exists by ID
   */
  async existsById(
    id: string,
    tx?: PrismaTransaction
  ): Promise<boolean> {
    const prisma = (tx ?? this.prisma) as any

    const count = await prisma.newsArticle.count({
      where: { id, deletedAt: null },
    })

    return count > 0
  }

  /**
   * Check if slug exists
   */
  async existsBySlug(
    slug: string,
    excludeId?: string,
    tx?: PrismaTransaction
  ): Promise<boolean> {
    const prisma = (tx ?? this.prisma) as any

    const where: any = { slug }

    if (excludeId) {
      where.id = { not: excludeId }
    }

    const count = await prisma.newsArticle.count({ where })

    return count > 0
  }

  /**
   * Increment view count (fire-and-forget)
   */
  incrementViewCount(id: string): void {
    this.prisma.newsArticle
      .update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      })
      .catch((err) => {
        console.error(`Failed to increment view count for article ${id}:`, err)
      })
  }

  /**
   * Get article by slug for slug uniqueness check
   */
  async findBySlug(
    slug: string,
    tx?: PrismaTransaction
  ): Promise<NewsArticle | null> {
    const prisma = (tx ?? this.prisma) as any

    return await prisma.newsArticle.findUnique({
      where: { slug },
    })
  }

  /**
   * Build where clause for filtering
   */
  private buildWhereClause(filters: NewsFiltersInput): any {
    const where: any = {
      deletedAt: null,
    }

    if (filters.wardId) {
      where.wardId = filters.wardId
    }

    if (filters.category) {
      where.category = filters.category
    }

    if (filters.status) {
      where.status = filters.status
      
      // If filtering by published status, ensure publishedAt is in the past
      if (filters.status === 'published') {
        where.publishedAt = { lte: new Date() }
      }
    }

    if (filters.isFeatured !== undefined) {
      where.isFeatured = filters.isFeatured
    }

    if (filters.isPinned !== undefined) {
      where.isPinned = filters.isPinned
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { summary: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    return where
  }
}
