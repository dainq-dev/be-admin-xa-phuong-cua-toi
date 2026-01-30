import { z } from 'zod';
import { NewsStatus } from '../constants/status';

// Block Types
export type NewsBlockType = 
  | 'heading' 
  | 'text' 
  | 'image' 
  | 'youtube' 
  | 'carousel' 
  | 'divider' 
  | 'quote' 
  | 'qr-code' 
  | 'collapse';

export interface BaseBlock {
  id: string;
  type: NewsBlockType;
  className?: string; // Tailwind classes for rendering
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  content: string;
  settings: {
    color?: string;
    fontSize?: number;
    align?: 'left' | 'center' | 'right' | 'justify';
  };
}

export interface HeadingBlock extends BaseBlock {
  type: 'heading';
  content: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  settings: {
    color?: string;
    align?: 'left' | 'center' | 'right';
  };
}

export interface ImageBlock extends BaseBlock {
  type: 'image';
  src: string;
  alt?: string;
  settings: {
    width?: string; // %, px
    height?: string;
    objectFit?: 'cover' | 'contain';
  };
}

export interface YoutubeBlock extends BaseBlock {
  type: 'youtube';
  videoId: string;
  settings: {
    width?: string;
    aspectRatio?: string;
  };
}

export interface CarouselItem {
  id: string;
  src: string;
  alt?: string;
  caption?: string;
}

export interface CarouselBlock extends BaseBlock {
  type: 'carousel';
  items: CarouselItem[];
  settings: {
    autoplay?: boolean;
    interval?: number;
  };
}

export interface DividerBlock extends BaseBlock {
  type: 'divider';
  settings: {
    paddingTop?: string;
    paddingBottom?: string;
    style?: 'solid' | 'dashed' | 'dotted';
    color?: string;
  };
}

export interface QuoteBlock extends BaseBlock {
  type: 'quote';
  content: string;
  author?: string;
  settings: {
    align?: 'left' | 'center' | 'right';
    backgroundColor?: string;
  };
}

export interface QrCodeBlock extends BaseBlock {
  type: 'qr-code';
  value: string;
  settings: {
    size?: number;
    level?: 'L' | 'M' | 'Q' | 'H'; 
    includeMargin?: boolean;
    color?: string;
  };
}

// export interface IconBlock extends BaseBlock {
//   type: 'icon';
//   iconName: string; // Lucide icon name
//   settings: {
//     size?: number;
//     color?: string;
//     align?: 'left' | 'center' | 'right';
//     url?: string; // Optional link
//   };
// }

export interface CollapseBlock extends BaseBlock {
  type: 'collapse';
  title: string;
  content: string; 
  settings: {
    isOpen?: boolean;
  };
}

export type NewsBlock = TextBlock | HeadingBlock | ImageBlock | YoutubeBlock | CarouselBlock | DividerBlock | QuoteBlock | QrCodeBlock |  CollapseBlock;

// News Types & Schemas
export const CreateNewsSchema = z.object({
  title: z.string().min(5).max(500),
  slug: z.string().min(5),
  summary: z.string().optional(),
  content: z.string().optional(), // Fallback for simple content
  blocks: z.array(z.record(z.string(), z.any())).optional(), // TODO: refine zod schema for blocks if needed
  category: z.string(),
  imageUrl: z.string().optional(),
  status: z.nativeEnum(NewsStatus).default(NewsStatus.DRAFT),
  isFeatured: z.boolean().default(false),
});

export const UpdateNewsSchema = CreateNewsSchema.partial();

export type CreateNewsRequest = z.infer<typeof CreateNewsSchema>;
export type UpdateNewsRequest = z.infer<typeof UpdateNewsSchema>;

export interface News {
  id: string;
  wardId?: string;
  title: string;
  slug: string;
  summary?: string | null;
  content?: string;
  imageUrl?: string | null;
  category: string;
  viewCount: number;
  isFeatured: boolean;
  isPinned?: boolean;
  blocks: NewsBlock[];
  status: string;
  tags?: string[];
  createdAt: Date;
  updatedAt?: Date;
  publishedAt?: Date | null;
  author?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  } | null;
  ward?: {
    id: string;
    name: string;
    code: string;
  } | null;
}

export interface ArticleListResponse {
  items: News[];
  total: number;
  hasMore: boolean;
}

export type ArticleResponse = News;
