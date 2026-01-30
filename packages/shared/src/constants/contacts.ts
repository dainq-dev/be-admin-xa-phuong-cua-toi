/**
 * Contact Constants
 */

export const ContactDepartment = {
  CONG_AN: 'cong_an',
  Y_TE: 'y_te',
  VAN_PHONG: 'van_phong',
  KINH_TE: 'kinh_te',
  VAN_HOA: 'van_hoa',
  KHAC: 'khac',
} as const;

export type ContactDepartmentType = (typeof ContactDepartment)[keyof typeof ContactDepartment];

export const ContactDepartmentLabels: Record<ContactDepartmentType, string> = {
  [ContactDepartment.CONG_AN]: 'Công an',
  [ContactDepartment.Y_TE]: 'Y tế',
  [ContactDepartment.VAN_PHONG]: 'Văn phòng',
  [ContactDepartment.KINH_TE]: 'Kinh tế',
  [ContactDepartment.VAN_HOA]: 'Văn hóa',
  [ContactDepartment.KHAC]: 'Khác',
};
