import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

export const schoolStatusEnum = pgEnum('school_status', ['active', 'suspended']);

export const userRoleEnum = pgEnum('user_role', ['platform_super_admin', 'school_admin']);

export const schools = pgTable(
  'schools',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    phone: text('phone').notNull(),
    address: text('address').notNull(),
    status: schoolStatusEnum('status').notNull().default('active'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('schools_email_lower_unique').on(sql`lower(${table.email})`),
    index('schools_status_created_idx').on(table.status, table.createdAt),
  ]
);

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    schoolId: uuid('school_id').references(() => schools.id, {
      onDelete: 'cascade',
    }),
    name: text('name').notNull(),
    email: text('email').notNull(),
    passwordHash: text('password_hash').notNull(),
    role: userRoleEnum('role').notNull(),
    mustChangePassword: boolean('must_change_password').notNull().default(false),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('users_email_lower_unique').on(sql`lower(${table.email})`),
    uniqueIndex('users_school_admin_unique')
      .on(table.schoolId)
      .where(sql`${table.role} = 'school_admin'`),
    index('users_school_id_idx').on(table.schoolId),
    check(
      'users_role_school_consistency',
      sql`(${table.role} = 'platform_super_admin' AND ${table.schoolId} IS NULL) OR (${table.role} = 'school_admin' AND ${table.schoolId} IS NOT NULL)`
    ),
  ]
);

export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('sessions_token_hash_unique').on(table.tokenHash),
    index('sessions_user_id_idx').on(table.userId),
    index('sessions_expiry_idx').on(table.expiresAt),
  ]
);
