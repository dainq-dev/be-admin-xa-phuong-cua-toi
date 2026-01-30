/**
 * Feedback Types
 */

import { z } from 'zod';
import {
  FeedbackCategory,
  FeedbackStatus,
  ContactPreference,
  type FeedbackCategoryType,
  type FeedbackStatusType,
  type ContactPreferenceType,
  type FeedbackPriorityType,
} from '../constants/feedback';

// ============================================
// SCHEMAS
// ============================================

export const CreateFeedbackSchema = z.object({
  category: z.nativeEnum(FeedbackCategory),
  title: z.string().min(1).max(255),
  description: z.string().min(20),
  locationLat: z.number().optional(),
  locationLng: z.number().optional(),
  locationAddress: z.string().optional(),
  contactPreference: z.nativeEnum(ContactPreference).optional(),
  isUrgent: z.boolean().default(false),
  photoUrls: z.array(z.string().url()).max(3).optional(),
});

export const UpdateFeedbackStatusSchema = z.object({
  status: z.nativeEnum(FeedbackStatus),
  responseMessage: z.string().optional(),
  assignedTo: z.string().uuid().optional(),
});

export const FeedbackFiltersSchema = z.object({
  category: z.string().optional(),
  status: z.string().optional(),
  userId: z.string().uuid().optional(),
  wardId: z.string().uuid().optional(),
  limit: z.coerce.number().default(10),
  offset: z.coerce.number().default(0),
});

// ============================================
// TYPES (inferred from schemas)
// ============================================

export type CreateFeedbackRequest = z.infer<typeof CreateFeedbackSchema>;
export type UpdateFeedbackStatusRequest = z.infer<typeof UpdateFeedbackStatusSchema>;
export type FeedbackFilters = z.infer<typeof FeedbackFiltersSchema>;

// ============================================
// RESPONSE TYPES
// ============================================

export interface FeedbackPhoto {
  id: string;
  photoUrl: string;
  uploadOrder: number;
}

export interface FeedbackUser {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface Feedback {
  id: string;
  userId: string;
  wardId: string;
  category: FeedbackCategoryType;
  title: string;
  description: string;
  locationLat: number | null;
  locationLng: number | null;
  locationAddress: string | null;
  contactPreference: ContactPreferenceType | null;
  status: FeedbackStatusType;
  priority: FeedbackPriorityType;
  isUrgent: boolean;
  responseMessage: string | null;
  assignedTo: string | null;
  resolvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user?: FeedbackUser;
  photos?: FeedbackPhoto[];
}

export interface FeedbackHistory {
  id: string;
  feedbackId: string;
  oldStatus: FeedbackStatusType | null;
  newStatus: FeedbackStatusType;
  message: string | null;
  changedBy: string;
  createdAt: Date;
}

export interface FeedbackListResponse {
  items: Feedback[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface FeedbackStats {
  total: number;
  byStatus: Record<FeedbackStatusType, number>;
  byCategory: Array<{
    category: FeedbackCategoryType;
    count: number;
  }>;
}
