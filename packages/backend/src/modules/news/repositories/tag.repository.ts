/**
 * Tag Repository
 * Data access layer for News Tags
 */

import type { NewsTag } from '@prisma/client'
import type { PrismaClient } from '../../../core/database/prisma.client'
import type { PrismaTransaction } from '../../../core/database/prisma.client'
import type { CreateTagData } from '../models/types'

export class TagRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new tag
   */
  async create(
    data: CreateTagData,
    tx?: PrismaTransaction
  ): Promise<NewsTag> {
    const prisma = (tx ?? this.prisma) as any

    return await prisma.newsTag.create({
      data,
    })
  }

  /**
   * Find tag by name
   */
  async findByName(
    name: string,
    tx?: PrismaTransaction
  ): Promise<NewsTag | null> {
    const prisma = (tx ?? this.prisma) as any

    return await prisma.newsTag.findFirst({
      where: { name },
    })
  }

  /**
   * Find tag by slug
   */
  async findBySlug(
    slug: string,
    tx?: PrismaTransaction
  ): Promise<NewsTag | null> {
    const prisma = (tx ?? this.prisma) as any

    return await prisma.newsTag.findUnique({
      where: { slug },
    })
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

    const count = await prisma.newsTag.count({ where })

    return count > 0
  }

  /**
   * Get all tags
   */
  async findAll(tx?: PrismaTransaction): Promise<NewsTag[]> {
    const prisma = (tx ?? this.prisma) as any

    return await prisma.newsTag.findMany({
      orderBy: { name: 'asc' },
    })
  }

  /**
   * Create article-tag link
   */
  async linkArticleTag(
    articleId: string,
    tagId: string,
    tx?: PrismaTransaction
  ): Promise<void> {
    const prisma = (tx ?? this.prisma) as any

    await prisma.newsArticleTag.create({
      data: {
        articleId,
        tagId,
      },
    })
  }

  /**
   * Remove all article-tag links for an article
   */
  async unlinkAllArticleTags(
    articleId: string,
    tx?: PrismaTransaction
  ): Promise<void> {
    const prisma = (tx ?? this.prisma) as any

    await prisma.newsArticleTag.deleteMany({
      where: { articleId },
    })
  }
}
