export const PLATFORM_SUPER_ADMIN = 'platform_super_admin' as const;
export const SCHOOL_ADMIN = 'school_admin' as const;
export const USER_ROLES = [PLATFORM_SUPER_ADMIN, SCHOOL_ADMIN] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const ROLE_LABELS: Record<UserRole, string> = {
  platform_super_admin: 'Platform Super Admin',
  school_admin: 'School Admin',
};

export const SCHOOL_STATUSES = ['active', 'suspended'] as const;
export type SchoolStatus = (typeof SCHOOL_STATUSES)[number];

export const SESSION_COOKIE = 'edusphere_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
export const SCHOOL_PAGE_SIZE = 20;
