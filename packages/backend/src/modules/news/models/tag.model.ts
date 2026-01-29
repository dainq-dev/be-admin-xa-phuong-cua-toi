/**
 * Tag Domain Model
 * Business logic for News Tags
 */

import type { NewsTag } from '@prisma/client'
import type { TagResponse } from './types'

export class Tag {
  constructor(private data: NewsTag) {}

  /**
   * Get tag ID
   */
  getId(): string {
    return this.data.id
  }

  /**
   * Get tag name
   */
  getName(): string {
    return this.data.name
  }

  /**
   * Get tag slug
   */
  getSlug(): string {
    return this.data.slug
  }

  /**
   * Transform to API response format
   */
  toResponse(): TagResponse {
    return {
      id: this.data.id,
      name: this.data.name,
      slug: this.data.slug,
      createdAt: this.data.createdAt,
    }
  }

  /**
   * Get the underlying data
   */
  getData(): NewsTag {
    return this.data
  }
}

/**
 * Helper function to transform raw tag data to response
 */
export function tagToResponse(tag: NewsTag): TagResponse {
  return new Tag(tag).toResponse()
}

/**
 * Transform array of tags to responses
 */
export function tagsToResponses(tags: NewsTag[]): TagResponse[] {
  return tags.map(tagToResponse)
}
