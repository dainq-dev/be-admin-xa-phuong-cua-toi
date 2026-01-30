/**
 * News Service
 * Main business logic for News module
 */

import type { PrismaClient } from '../../../core/database/prisma.client'
import { NewsRepository } from '../repositories/news.repository'
import { TagService } from './tag.service'
import { NewsCacheService } from './cache.service'
import { NewsAnalyticsService } from './analytics.service'
import { SlugGenerator } from '../utils/slug.generator'
import type {
  CreateArticleInput,
  UpdateArticleInput,
  NewsFiltersInput,
  ArticleWithRelations,
  ArticleListResponse,
  ArticleResponse,
} from '../models/types'
import { articlesToResponses, articleToResponse } from '../models/article.model'

export class NewsService {
  constructor(
    private prisma: PrismaClient,
    private newsRepository: NewsRepository,
    private tagService: TagService,
    private cacheService: NewsCacheService,
    private analyticsService: NewsAnalyticsService,
    private slugGenerator: SlugGenerator
  ) {}

  /**
   * Create a new article
   */
  async createArticle(input: CreateArticleInput): Promise<ArticleResponse> {
    // Business rule: Featured articles must have images
    if (input.isFeatured && !input.imageUrl) {
      throw new Error('Featured articles must have an image')
    }

    // Execute in transaction for data consistency
    const article = await this.prisma.$transaction(async (tx) => {
      // Generate unique slug
      const slug = await this.slugGenerator.generateUnique(
        input.title,
        (slug) => this.newsRepository.existsBySlug(slug, undefined, tx)
      )

      // Create article
      const createdArticle = await this.newsRepository.create(
        {
          title: input.title,
          slug,
          summary: input.summary,
          content: input.content,
          imageUrl: input.imageUrl,
          category: input.category,
          isFeatured: input.isFeatured ?? false,
          isPinned: input.isPinned ?? false,
          status: input.status,
          blocks: input.blocks,
          publishedAt: input.publishedAt ? new Date(input.publishedAt) : new Date(),
          wardId: input.wardId,
          authorId: input.authorId,
        },
        tx
      )

      // Attach tags if provided
      if (input.tags && input.tags.length > 0) {
        await this.tagService.attachTagsToArticle(
          createdArticle.id,
          input.tags,
          tx as any
        )
      }

      // Reload with relations
      const articleWithRelations = await this.newsRepository.findById(
        createdArticle.id,
        tx
      )

      if (!articleWithRelations) {
        throw new Error('Failed to create article')
      }

      return articleWithRelations
    })

    // Post-transaction side effects
    await this.cacheService.invalidateNewsCache()

    // Track analytics (fire-and-forget)
    this.analyticsService.trackArticleCreated(article).catch(console.error)

    return articleToResponse(article)
  }

  /**
   * List articles with filters and pagination
   */
  async listArticles(filters: NewsFiltersInput): Promise<ArticleListResponse> {
    // Try cache first
    const cacheKey = this.cacheService.buildListCacheKey(filters)
    const cached = await this.cacheService.get<ArticleListResponse>(cacheKey)

    if (cached) {
      return cached
    }

    // Fetch from database
    const { items, total } = await this.newsRepository.findMany(filters)

    // Transform to response format
    const response: ArticleListResponse = {
      items: articlesToResponses(items),
      total,
      limit: filters.limit,
      offset: filters.offset,
      hasMore: total > filters.offset + filters.limit,
    }

    // Cache result for 5 minutes
    await this.cacheService.set(cacheKey, response, 300)

    return response
  }

  /**
   * Get article by ID or slug
   */
  async getArticleById(
    idOrSlug: string,
    userId?: string
  ): Promise<ArticleResponse | null> {
    // Try cache first
    const cacheKey = this.cacheService.buildArticleCacheKey(idOrSlug)
    const cached = await this.cacheService.get<ArticleResponse>(cacheKey)

    if (cached) {
      // Track view (fire-and-forget)
      if (userId) {
        this.analyticsService
          .trackArticleView(cached.id, cached.wardId, userId)
          .catch(console.error)
      }

      // Increment view count (fire-and-forget)
      this.newsRepository.incrementViewCount(cached.id)

      return cached
    }

    // Fetch from database
    const article = await this.newsRepository.findByIdOrSlug(idOrSlug)

    if (!article) {
      return null
    }

    // Transform to response
    const response = articleToResponse(article)

    // Cache for 10 minutes
    await this.cacheService.set(cacheKey, response, 600)

    // Track view (fire-and-forget)
    if (userId) {
      this.analyticsService
        .trackArticleView(article.id, article.wardId, userId)
        .catch(console.error)
    }

    // Increment view count (fire-and-forget)
    this.newsRepository.incrementViewCount(article.id)

    return response
  }

  /**
   * Update article
   */
  async updateArticle(
    id: string,
    input: UpdateArticleInput,
    userId: string
  ): Promise<ArticleResponse> {
    // Check if article exists
    const existing = await this.newsRepository.findById(id)

    if (!existing) {
      throw new Error('Article not found')
    }

    // Business rule: Featured articles must have images
    const willBeFeatured = input.isFeatured ?? existing.isFeatured
    const finalImageUrl = input.imageUrl !== undefined ? input.imageUrl : existing.imageUrl

    if (willBeFeatured && !finalImageUrl) {
      throw new Error('Featured articles must have an image')
    }

    // Execute in transaction
    const article = await this.prisma.$transaction(async (tx) => {
      // Update slug if title changed
      let slug = existing.slug
      if (input.title && input.title !== existing.title) {
        slug = await this.slugGenerator.generateUnique(
          input.title,
          (slug) => this.newsRepository.existsBySlug(slug, id, tx)
        )
      }

      // Update article
      const updatedArticle = await this.newsRepository.update(
        id,
        {
          ...input,
          slug,
          publishedAt: input.publishedAt ? new Date(input.publishedAt) : undefined,
        },
        tx
      )

      // Reload with full relations
      const articleWithRelations = await this.newsRepository.findById(id, tx)

      if (!articleWithRelations) {
        throw new Error('Failed to update article')
      }

      return articleWithRelations
    })

    // Post-transaction side effects
    await this.cacheService.invalidateArticleCaches(article.id, article.slug)

    // Track analytics (fire-and-forget)
    this.analyticsService.trackArticleUpdated(article, userId).catch(console.error)

    return articleToResponse(article)
  }

  /**
   * Delete article (soft delete)
   */
  async deleteArticle(id: string, wardId: string, userId: string): Promise<void> {
    // Check if article exists
    const existing = await this.newsRepository.findById(id)

    if (!existing) {
      throw new Error('Article not found')
    }

    // Soft delete
    await this.newsRepository.softDelete(id)

    // Invalidate caches
    await this.cacheService.invalidateArticleCaches(existing.id, existing.slug)

    // Track analytics (fire-and-forget)
    this.analyticsService
      .trackArticleDeleted(id, wardId, userId)
      .catch(console.error)
  }

  /**
   * Get all tags
   */
  async getAllTags() {
    return await this.tagService.getAllTags()
  }
}
