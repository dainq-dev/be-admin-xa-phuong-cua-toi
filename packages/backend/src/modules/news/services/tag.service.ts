/**
 * Tag Service for News Module
 * Business logic for managing news tags
 */

import type { NewsTag } from '@prisma/client'
import type { PrismaTransaction } from '../../../core/database/prisma.client'
import { TagRepository } from '../repositories/tag.repository'
import { SlugGenerator } from '../utils/slug.generator'

export class TagService {
  constructor(
    private tagRepository: TagRepository,
    private slugGenerator: SlugGenerator
  ) {}

  /**
   * Find or create tags and attach to article
   */
  async attachTagsToArticle(
    articleId: string,
    tagNames: string[],
    tx: PrismaTransaction
  ): Promise<void> {
    for (const tagName of tagNames) {
      // Find existing tag
      let tag = await this.tagRepository.findByName(tagName, tx)

      // Create tag if doesn't exist
      if (!tag) {
        const slug = await this.slugGenerator.generateUnique(
          tagName,
          (slug) => this.tagRepository.existsBySlug(slug, undefined, tx)
        )

        tag = await this.tagRepository.create(
          {
            name: tagName,
            slug,
          },
          tx
        )
      }

      // Link tag to article
      await this.tagRepository.linkArticleTag(articleId, tag.id, tx)
    }
  }

  /**
   * Get all tags
   */
  async getAllTags(): Promise<NewsTag[]> {
    return await this.tagRepository.findAll()
  }

  /**
   * Update article tags (remove all and add new)
   */
  async updateArticleTags(
    articleId: string,
    tagNames: string[],
    tx: PrismaTransaction
  ): Promise<void> {
    // Remove all existing tags
    await this.tagRepository.unlinkAllArticleTags(articleId, tx)

    // Add new tags if provided
    if (tagNames && tagNames.length > 0) {
      await this.attachTagsToArticle(articleId, tagNames, tx)
    }
  }
}
