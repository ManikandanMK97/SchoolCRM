import { z } from 'zod';
import { SCHOOL_STATUSES } from './constants';

const emailSchema = z.string().trim().email('Enter a valid email address.').max(254).toLowerCase();

const fitsBcryptByteLimit = (value: string) => Buffer.byteLength(value, 'utf8') <= 72;

export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, 'Enter your password.')
    .max(72)
    .refine(fitsBcryptByteLimit, 'Password must use no more than 72 UTF-8 bytes.'),
});

export const changePasswordSchema = z.object({
  password: z
    .string()
    .min(12, 'Use at least 12 characters.')
    .max(72, 'Use no more than 72 characters.')
    .refine(fitsBcryptByteLimit, 'Password must use no more than 72 UTF-8 bytes.'),
});

export const createSchoolSchema = z.object({
  name: z.string().trim().min(2, 'Enter a school name.').max(120),
  email: emailSchema,
  phone: z.string().trim().min(6, 'Enter a valid phone number.').max(30),
  address: z.string().trim().min(4, 'Enter a school address.').max(240),
  status: z.enum(SCHOOL_STATUSES),
  adminName: z.string().trim().min(2, 'Enter the School Admin name.').max(120),
  adminEmail: emailSchema,
});

export const schoolListQuerySchema = z.object({
  q: z.string().trim().max(120).default(''),
  status: z.enum(SCHOOL_STATUSES).optional(),
  sort: z.enum(['created', 'name']).default('created'),
  page: z.coerce.number().int().min(1).max(100_000).default(1),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type CreateSchoolInput = z.infer<typeof createSchoolSchema>;
export type SchoolListQuery = z.infer<typeof schoolListQuerySchema>;
