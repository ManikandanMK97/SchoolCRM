import { and, asc, count, desc, eq, ilike, or, type SQL } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { getDatabase } from '@/db';
import { schools, users } from '@/db/schema';
import { SCHOOL_PAGE_SIZE } from './constants';
import type { AuthenticatedUser } from './auth';
import type { CreateSchoolInput, SchoolListQuery } from './schemas';
import { AppError, uniqueConflict } from './errors';

const BCRYPT_ROUNDS = 12;

export type SchoolListItem = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'suspended';
  createdAt: Date;
  adminName: string | null;
  adminEmail: string | null;
};

export async function listSchools(query: SchoolListQuery) {
  const database = getDatabase();
  const conditions: SQL[] = [];
  if (query.status) conditions.push(eq(schools.status, query.status));
  if (query.q) {
    const escapedQuery = query.q.replace(/[\\%_]/g, '\\$&');
    const match = `%${escapedQuery}%`;
    const search = or(
      ilike(schools.name, match),
      ilike(schools.email, match),
      ilike(schools.phone, match),
      ilike(schools.address, match),
      ilike(users.name, match),
      ilike(users.email, match)
    );
    if (search) conditions.push(search);
  }
  const where = conditions.length ? and(...conditions) : undefined;
  const [totalResult] = await database
    .select({ total: count() })
    .from(schools)
    .leftJoin(users, and(eq(users.schoolId, schools.id), eq(users.role, 'school_admin')))
    .where(where);
  const total = Number(totalResult?.total ?? 0);
  const pages = Math.max(1, Math.ceil(total / SCHOOL_PAGE_SIZE));
  const page = Math.min(query.page, pages);
  const offset = (page - 1) * SCHOOL_PAGE_SIZE;

  const items = await database
    .select({
      id: schools.id,
      name: schools.name,
      email: schools.email,
      phone: schools.phone,
      address: schools.address,
      status: schools.status,
      createdAt: schools.createdAt,
      adminName: users.name,
      adminEmail: users.email,
    })
    .from(schools)
    .leftJoin(users, and(eq(users.schoolId, schools.id), eq(users.role, 'school_admin')))
    .where(where)
    .orderBy(query.sort === 'name' ? asc(schools.name) : desc(schools.createdAt), desc(schools.id))
    .limit(SCHOOL_PAGE_SIZE)
    .offset(offset);

  return { items, total, page, pages, pageSize: SCHOOL_PAGE_SIZE };
}

export async function createSchoolWithAdmin(input: CreateSchoolInput) {
  const temporaryPassword = randomBytes(24).toString('base64url');
  const passwordHash = await bcrypt.hash(temporaryPassword, BCRYPT_ROUNDS);
  const database = getDatabase();

  try {
    const result = await database.transaction(async (transaction) => {
      const [school] = await transaction
        .insert(schools)
        .values({
          name: input.name,
          email: input.email,
          phone: input.phone,
          address: input.address,
          status: input.status,
        })
        .returning();

      if (!school) throw new Error('School creation returned no record.');

      const [admin] = await transaction
        .insert(users)
        .values({
          schoolId: school.id,
          name: input.adminName,
          email: input.adminEmail,
          passwordHash,
          role: 'school_admin',
          mustChangePassword: true,
        })
        .returning({ id: users.id, name: users.name, email: users.email });

      if (!admin) throw new Error('School Admin creation returned no record.');
      return { school, admin };
    });

    return {
      school: result.school,
      admin: result.admin,
      temporaryPassword,
    };
  } catch (error) {
    if (uniqueConflict(error)) {
      throw new AppError('A school or user with that email already exists.', 409, 'conflict');
    }
    throw error;
  }
}

export async function getSchoolDashboard(user: AuthenticatedUser) {
  if (user.role !== 'school_admin' || !user.schoolId) {
    throw new AppError('School Admin access is required.', 403, 'forbidden');
  }

  const [school] = await getDatabase()
    .select({
      id: schools.id,
      name: schools.name,
      email: schools.email,
      phone: schools.phone,
      address: schools.address,
      status: schools.status,
      createdAt: schools.createdAt,
    })
    .from(schools)
    .where(eq(schools.id, user.schoolId))
    .limit(1);

  if (!school) {
    throw new AppError('Your school could not be found.', 404, 'not_found');
  }

  return school;
}
