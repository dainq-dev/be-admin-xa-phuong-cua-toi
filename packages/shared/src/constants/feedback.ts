/**
 * Feedback Constants
 */

export const FeedbackCategory = {
  HA_TANG: 'ha_tang',
  Y_TE: 'y_te',
  AN_NINH: 'an_ninh',
  MOI_TRUONG: 'moi_truong',
  GIAO_THONG: 'giao_thong',
  DICH_VU_CONG: 'dich_vu_cong',
  KHAC: 'khac',
} as const;

export type FeedbackCategoryType = (typeof FeedbackCategory)[keyof typeof FeedbackCategory];

export const FeedbackCategoryLabels: Record<FeedbackCategoryType, string> = {
  [FeedbackCategory.HA_TANG]: 'Hạ tầng',
  [FeedbackCategory.Y_TE]: 'Y tế',
  [FeedbackCategory.AN_NINH]: 'An ninh',
  [FeedbackCategory.MOI_TRUONG]: 'Môi trường',
  [FeedbackCategory.GIAO_THONG]: 'Giao thông',
  [FeedbackCategory.DICH_VU_CONG]: 'Dịch vụ công',
  [FeedbackCategory.KHAC]: 'Khác',
};

export const FeedbackStatus = {
  PENDING: 'pending',
  REVIEWING: 'reviewing',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
} as const;

export type FeedbackStatusType = (typeof FeedbackStatus)[keyof typeof FeedbackStatus];

export const FeedbackStatusLabels: Record<FeedbackStatusType, string> = {
  [FeedbackStatus.PENDING]: 'Chờ xử lý',
  [FeedbackStatus.REVIEWING]: 'Đang xem xét',
  [FeedbackStatus.IN_PROGRESS]: 'Đang xử lý',
  [FeedbackStatus.RESOLVED]: 'Đã giải quyết',
  [FeedbackStatus.REJECTED]: 'Từ chối',
};

export const ContactPreference = {
  PHONE: 'phone',
  ZALO: 'zalo',
  NONE: 'none',
} as const;

export type ContactPreferenceType = (typeof ContactPreference)[keyof typeof ContactPreference];

export const FeedbackPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export type FeedbackPriorityType = (typeof FeedbackPriority)[keyof typeof FeedbackPriority];
