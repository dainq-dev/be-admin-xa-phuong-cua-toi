/**
 * News Repository Unit Tests
 * Tests for data access layer
 */

import { describe, it, expect, beforeEach, mock } from 'bun:test'
import { NewsRepository } from '../../../repositories/news.repository'
import type { PrismaClient } from '@prisma/client'

describe('NewsRepository', () => {
  let repository: NewsRepository
  let mockPrisma: any

  beforeEach(() => {
    // Mock Prisma client
    mockPrisma = {
      newsArticle: {
        create: mock(),
        findFirst: mock(),
        findMany: mock(),
        findUnique: mock(),
        update: mock(),
        count: mock(),
      },
    }

    repository = new NewsRepository(mockPrisma as PrismaClient)
  })

  describe('create', () => {
    it('should create article with correct data', async () => {
      const data = {
        title: 'Test Article',
        slug: 'test-article',
        content: 'Test content',
        category: 'su_kien',
        wardId: 'ward-1',
        authorId: 'user-1',
        publishedAt: new Date(),
      }

      const mockArticle = { id: 'article-1', ...data }
      mockPrisma.newsArticle.create.mockResolvedValue(mockArticle)

      const result = await repository.create(data)

      expect(result).toHaveProperty('id')
      expect(result.title).toBe('Test Article')
      expect(mockPrisma.newsArticle.create).toHaveBeenCalledWith({
        data,
        include: expect.any(Object),
      })
    })
  })

  describe('findMany', () => {
    it('should build correct where clause for filters', async () => {
      mockPrisma.newsArticle.findMany.mockResolvedValue([])
      mockPrisma.newsArticle.count.mockResolvedValue(0)

      await repository.findMany({
        category: 'su_kien',
        isFeatured: true,
        search: 'test',
        limit: 10,
        offset: 0,
      })

      const call = mockPrisma.newsArticle.findMany.mock.calls[0][0]
      expect(call.where).toMatchObject({
        category: 'su_kien',
        isFeatured: true,
        deletedAt: null,
      })
      expect(call.where.OR).toBeDefined()
      expect(call.where.OR).toHaveLength(2)
    })

    it('should return items and total count', async () => {
      const mockArticles = [
        { id: '1', title: 'Article 1' },
        { id: '2', title: 'Article 2' },
      ]

      mockPrisma.newsArticle.findMany.mockResolvedValue(mockArticles)
      mockPrisma.newsArticle.count.mockResolvedValue(2)

      const result = await repository.findMany({
        limit: 10,
        offset: 0,
      })

      expect(result.items).toHaveLength(2)
      expect(result.total).toBe(2)
    })
  })

  describe('existsBySlug', () => {
    it('should return true if slug exists', async () => {
      mockPrisma.newsArticle.count.mockResolvedValue(1)

      const result = await repository.existsBySlug('test-slug')

      expect(result).toBe(true)
    })

    it('should return false if slug does not exist', async () => {
      mockPrisma.newsArticle.count.mockResolvedValue(0)

      const result = await repository.existsBySlug('non-existent')

      expect(result).toBe(false)
    })

    it('should exclude ID when provided', async () => {
      mockPrisma.newsArticle.count.mockResolvedValue(0)

      await repository.existsBySlug('test-slug', 'exclude-id')

      const call = mockPrisma.newsArticle.count.mock.calls[0][0]
      expect(call.where.id).toEqual({ not: 'exclude-id' })
    })
  })
})
