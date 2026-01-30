/**
 * Contact Types
 */

import { z } from 'zod';
import { ContactDepartment, type ContactDepartmentType } from '../constants/contacts';

// ============================================
// SCHEMAS
// ============================================

export const CreateContactSchema = z.object({
  name: z.string().min(1),
  position: z.string().optional(),
  department: z.nativeEnum(ContactDepartment),
  phoneNumber: z.string().min(1),
  alternatePhone: z.string().optional(),
  email: z.string().email().optional(),
  officeLocation: z.string().optional(),
  workingHours: z.string().optional(),
  isEmergency: z.boolean().default(false),
  avatarUrl: z.string().url().optional(),
  zaloId: z.string().optional(),
  displayOrder: z.number().default(0),
});

export const UpdateContactSchema = CreateContactSchema.partial();

export const CreateEmergencyContactSchema = z.object({
  title: z.string().min(1).max(100),
  phoneNumber: z.string().min(1),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  description: z.string().optional(),
  displayOrder: z.number().default(0),
});

// ============================================
// TYPES (inferred from schemas)
// ============================================

export type CreateContactRequest = z.infer<typeof CreateContactSchema>;
export type UpdateContactRequest = z.infer<typeof UpdateContactSchema>;
export type CreateEmergencyContactRequest = z.infer<typeof CreateEmergencyContactSchema>;

// ============================================
// RESPONSE TYPES
// ============================================

export interface Contact {
  id: string;
  wardId: string;
  name: string;
  position: string | null;
  department: ContactDepartmentType;
  phoneNumber: string;
  alternatePhone: string | null;
  email: string | null;
  officeLocation: string | null;
  workingHours: string | null;
  isEmergency: boolean;
  avatarUrl: string | null;
  zaloId: string | null;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmergencyContact {
  id: string;
  wardId: string;
  title: string;
  phoneNumber: string;
  icon: string | null;
  color: string | null;
  description: string | null;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactListResponse {
  items: Contact[];
  total: number;
}

export interface DepartmentListResponse {
  departments: ContactDepartmentType[];
}
