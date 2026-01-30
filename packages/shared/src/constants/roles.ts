export const UserRole = {
  ADMIN: 'admin',
  STAFF: 'staff',
  CITIZEN: 'citizen',
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

export const UserRoleLabels: Record<UserRoleType, string> = {
  [UserRole.ADMIN]: 'Quản trị viên',
  [UserRole.STAFF]: 'Nhân viên',
  [UserRole.CITIZEN]: 'Công dân',
};
