/**
 * Auth Types
 */

import { z } from 'zod';
import { type UserRoleType } from '../constants/roles';

// ============================================
// SCHEMAS
// ============================================

// Zalo Login (for Mini App users)
export const ZaloLoginSchema = z.object({
  zaloAccessToken: z.string().min(1),
  zaloId: z.string().min(1),
  name: z.string().min(1),
  avatar: z.string().url().optional(),
  phoneNumber: z.string().optional(),
});

// Admin Email Login - Request OTP
export const EmailLoginSchema = z.object({
  email: z.string().email(),
});

// Admin Email Login - Verify OTP
export const VerifyOTPSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

// Refresh Token
export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

// Update Profile
export const UpdateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

// Update Settings
export const UpdateSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  language: z.enum(['vi', 'en']).optional(),
  notificationsEnabled: z.boolean().optional(),
  feedbackUpdates: z.boolean().optional(),
  newsAlerts: z.boolean().optional(),
  emergencyAlerts: z.boolean().optional(),
});

// ============================================
// TYPES (inferred from schemas)
// ============================================

export type ZaloLoginRequest = z.infer<typeof ZaloLoginSchema>;
export type EmailLoginRequest = z.infer<typeof EmailLoginSchema>;
export type VerifyOTPRequest = z.infer<typeof VerifyOTPSchema>;
export type RefreshTokenRequest = z.infer<typeof RefreshTokenSchema>;
export type UpdateProfileRequest = z.infer<typeof UpdateProfileSchema>;
export type UpdateSettingsRequest = z.infer<typeof UpdateSettingsSchema>;

// ============================================
// RESPONSE TYPES
// ============================================

export interface WardInfo {
  id: string;
  name: string;
  code: string;
}

export interface User {
  id: string;
  name: string;
  email: string | null;
  zaloId: string | null;
  avatarUrl: string | null;
  phoneNumber: string | null;
  role: UserRoleType;
  wardId: string | null;
  ward?: WardInfo | null;
}

export type UserResponse = User;

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface OTPRequestResponse {
  message: string;
  email: string;
  expiresIn: number;
}

// ============================================
// SESSION TYPES
// ============================================

export interface Session {
  id: string;
  userId: string;
  deviceInfo: Record<string, unknown> | null;
  ipAddress: string | null;
  lastActiveAt: Date;
  expiresAt: Date;
  createdAt: Date;
}

export interface SessionListResponse {
  sessions: Session[];
}

export interface LogoutAllResponse {
  deletedCount: number;
}

// ============================================
// USER SETTINGS TYPES
// ============================================

export type ThemeType = 'light' | 'dark' | 'system';
export type LanguageType = 'vi' | 'en';

export interface UserSettings {
  id: string;
  userId: string;
  theme: ThemeType;
  language: LanguageType;
  notificationsEnabled: boolean;
  feedbackUpdates: boolean;
  newsAlerts: boolean;
  emergencyAlerts: boolean;
}

// ============================================
// JWT PAYLOAD TYPES
// ============================================

export interface JWTPayload {
  userId: string;
  email?: string;
  zaloId?: string;
  role: UserRoleType;
  wardId?: string;
  iat?: number;
  exp?: number;
}
