/**
 * Slug Generator for News Module
 * Convert Vietnamese text to URL-friendly slug
 */

/**
 * Remove Vietnamese accents
 */
function removeVietnameseAccents(str: string): string {
  const accents: Record<string, string> = {
    á: 'a', à: 'a', ả: 'a', ã: 'a', ạ: 'a',
    ă: 'a', ắ: 'a', ằ: 'a', ẳ: 'a', ẵ: 'a', ặ: 'a',
    â: 'a', ấ: 'a', ầ: 'a', ẩ: 'a', ẫ: 'a', ậ: 'a',
    đ: 'd',
    é: 'e', è: 'e', ẻ: 'e', ẽ: 'e', ẹ: 'e',
    ê: 'e', ế: 'e', ề: 'e', ể: 'e', ễ: 'e', ệ: 'e',
    í: 'i', ì: 'i', ỉ: 'i', ĩ: 'i', ị: 'i',
    ó: 'o', ò: 'o', ỏ: 'o', õ: 'o', ọ: 'o',
    ô: 'o', ố: 'o', ồ: 'o', ổ: 'o', ỗ: 'o', ộ: 'o',
    ơ: 'o', ớ: 'o', ờ: 'o', ở: 'o', ỡ: 'o', ợ: 'o',
    ú: 'u', ù: 'u', ủ: 'u', ũ: 'u', ụ: 'u',
    ư: 'u', ứ: 'u', ừ: 'u', ử: 'u', ữ: 'u', ự: 'u',
    ý: 'y', ỳ: 'y', ỷ: 'y', ỹ: 'y', ỵ: 'y',
  }

  return str
    .toLowerCase()
    .split('')
    .map((char) => accents[char] || char)
    .join('')
}

export class SlugGenerator {
  /**
   * Generate slug from text
   */
  generate(text: string): string {
    return removeVietnameseAccents(text)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/-+/g, '-') // Replace multiple - with single -
      .replace(/^-+|-+$/g, '') // Trim - from start/end
  }

  /**
   * Generate unique slug (append number if exists)
   */
  async generateUnique(
    text: string,
    checkExists: (slug: string) => Promise<boolean>
  ): Promise<string> {
    let slug = this.generate(text)
    let counter = 1

    while (await checkExists(slug)) {
      slug = `${this.generate(text)}-${counter}`
      counter++
    }

    return slug
  }
}

/**
 * Default instance for convenience
 */
export const slugGenerator = new SlugGenerator()
