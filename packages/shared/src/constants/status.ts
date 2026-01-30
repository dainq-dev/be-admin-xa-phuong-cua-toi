export const NewsStatus = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
  HIDDEN: 'hidden',
} as const;

export type NewsStatusType = (typeof NewsStatus)[keyof typeof NewsStatus];
