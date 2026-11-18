import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { Pool } from 'pg';
import { eq } from 'drizzle-orm';
import { getDatabase, getPool } from '@/db';
import { migrateDatabase } from '@/db/migrations';
import { users } from '@/db/schema';
import { createInitialPlatformAdmin } from '@/lib/auth';
import { POST as login } from '@/app/api/auth/login/route';
import { POST as logout } from '@/app/api/auth/logout/route';
import { POST as changePassword } from '@/app/api/auth/change-password/route';
import { GET as listSchools, POST as createSchool } from '@/app/api/platform/schools/route';
import { GET as schoolDashboard } from '@/app/api/school/dashboard/route';

const cookieState = vi.hoisted(() => ({
  value: undefined as string | undefined,
  options: undefined as Record<string, unknown> | undefined,
}));

vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) =>
      name === 'edusphere_session' && cookieState.value
        ? { name, value: cookieState.value }
        : undefined,
    set: (_name: string, value: string, options: Record<string, unknown>) => {
      cookieState.value = value;
      cookieState.options = options;
    },
    delete: () => {
      cookieState.value = undefined;
    },
  }),
}));

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
if (!testDatabaseUrl) {
  throw new Error('Set TEST_DATABASE_URL to a dedicated PostgreSQL test database.');
}

const testSchema = `test_${randomUUID().replaceAll('-', '')}`;
let adminPool: Pool;
let testPool: Pool;

function jsonRequest(path: string, method: string, body?: unknown): Request {
  return new Request(`http://localhost${path}`, {
    method,
    headers: {
      host: 'localhost',
      origin: 'http://localhost',
      ...(body === undefined ? {} : { 'content-type': 'application/json' }),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

async function responseJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

async function signIn(email: string, password: string): Promise<Response> {
  return login(jsonRequest('/api/auth/login', 'POST', { email, password }));
}

describe('EduSphere authentication and tenant API', () => {
  beforeAll(async () => {
    adminPool = new Pool({ connectionString: testDatabaseUrl, ssl: false });
    await adminPool.query(`CREATE SCHEMA "${testSchema}"`);

    const scopedUrl = new URL(testDatabaseUrl);
    scopedUrl.searchParams.set('options', `-c search_path=${testSchema}`);
    process.env.DATABASE_URL = scopedUrl.toString();

    testPool = getPool();
    await migrateDatabase(testPool);
  });

  beforeEach(async () => {
    cookieState.value = undefined;
    cookieState.options = undefined;
    await testPool.query('TRUNCATE sessions, users, schools CASCADE');
  });

  afterAll(async () => {
    await getPool().end();
    await adminPool.query(`DROP SCHEMA "${testSchema}" CASCADE`);
    await adminPool.end();
  });

  it('rejects invalid credentials with a generic response', async () => {
    const response = await signIn('missing@school.example', 'not-a-password');
    const payload = await responseJson<{ error: { message: string } }>(response);

    expect(response.status).toBe(401);
    expect(payload.error.message).toBe('Invalid email or password.');
    expect(cookieState.value).toBeUndefined();
  });

  it('creates a school and admin atomically, authenticates, changes the temporary password, and scopes the dashboard', async () => {
    await createInitialPlatformAdmin({
      name: 'Platform Owner',
      email: 'owner@edusphere.test',
      password: 'PlatformPassword123!',
    });

    const platformLogin = await signIn('owner@edusphere.test', 'PlatformPassword123!');
    expect(platformLogin.status).toBe(200);
    expect(cookieState.options).toMatchObject({
      httpOnly: true,
      sameSite: 'strict',
      path: '/',
    });

    const schoolInput = {
      name: 'Northview Academy',
      email: 'office@northview.test',
      phone: '+1 202 555 0148',
      address: '15 Cedar Avenue, Northview',
      status: 'active',
      adminName: 'Avery Martin',
      adminEmail: 'avery@northview.test',
    };
    const created = await createSchool(jsonRequest('/api/platform/schools', 'POST', schoolInput));
    const createdPayload = await responseJson<{
      school: { id: string; name: string };
      admin: { email: string };
      temporaryPassword: string;
    }>(created);

    expect(created.status).toBe(201);
    expect(createdPayload.school.name).toBe(schoolInput.name);
    expect(createdPayload.admin.email).toBe(schoolInput.adminEmail);
    expect(createdPayload.temporaryPassword).toHaveLength(32);

    const storedAdmin = await getDatabase()
      .select({
        passwordHash: users.passwordHash,
        mustChangePassword: users.mustChangePassword,
      })
      .from(users)
      .where(eq(users.email, schoolInput.adminEmail))
      .limit(1);
    expect(storedAdmin[0]?.passwordHash).not.toBe(createdPayload.temporaryPassword);
    expect(storedAdmin[0]?.mustChangePassword).toBe(true);

    const duplicate = await createSchool(
      jsonRequest('/api/platform/schools', 'POST', {
        ...schoolInput,
        adminEmail: 'different@northview.test',
      })
    );
    expect(duplicate.status).toBe(409);

    const invalid = await createSchool(
      jsonRequest('/api/platform/schools', 'POST', {
        ...schoolInput,
        email: 'not-an-email',
      })
    );
    expect(invalid.status).toBe(400);
    expect((await responseJson<{ error: { fieldErrors: object } }>(invalid)).error).toHaveProperty(
      'fieldErrors'
    );

    const listing = await listSchools(
      jsonRequest('/api/platform/schools?q=Northview&status=active', 'GET')
    );
    const listingPayload = await responseJson<{
      total: number;
      items: Array<{ id: string; adminEmail: string | null }>;
    }>(listing);
    expect(listing.status).toBe(200);
    expect(listingPayload.total).toBe(1);
    expect(listingPayload.items[0]?.adminEmail).toBe(schoolInput.adminEmail);

    const otherSchool = await createSchool(
      jsonRequest('/api/platform/schools', 'POST', {
        name: 'Lakeside School',
        email: 'office@lakeside.test',
        phone: '+1 202 555 0188',
        address: '22 Lake Road, Lakeside',
        status: 'active',
        adminName: 'Taylor Reed',
        adminEmail: 'taylor@lakeside.test',
      })
    );
    const otherSchoolPayload = await responseJson<{
      school: { id: string };
    }>(otherSchool);
    expect(otherSchool.status).toBe(201);

    const schoolLogin = await signIn(schoolInput.adminEmail, createdPayload.temporaryPassword);
    expect(schoolLogin.status).toBe(200);
    expect(
      (await responseJson<{ user: { mustChangePassword: boolean } }>(schoolLogin)).user
        .mustChangePassword
    ).toBe(true);

    const blockedCreate = await createSchool(
      jsonRequest('/api/platform/schools', 'POST', schoolInput)
    );
    expect(blockedCreate.status).toBe(428);

    const blockedDashboard = await schoolDashboard(jsonRequest('/api/school/dashboard', 'GET'));
    expect(blockedDashboard.status).toBe(428);

    const passwordUpdate = await changePassword(
      jsonRequest('/api/auth/change-password', 'POST', {
        password: 'NewSchoolPassword123!',
      })
    );
    expect(passwordUpdate.status).toBe(200);

    const dashboard = await schoolDashboard(
      jsonRequest('/api/school/dashboard?schoolId=not-authoritative', 'GET')
    );
    const dashboardPayload = await responseJson<{
      school: { id: string; name: string };
    }>(dashboard);
    expect(dashboard.status).toBe(200);
    expect(dashboardPayload.school.id).toBe(createdPayload.school.id);
    expect(dashboardPayload.school.id).not.toBe(otherSchoolPayload.school.id);

    const updatedAdmin = await getDatabase()
      .select({ mustChangePassword: users.mustChangePassword })
      .from(users)
      .where(eq(users.email, schoolInput.adminEmail))
      .limit(1);
    expect(updatedAdmin[0]?.mustChangePassword).toBe(false);

    const signedOut = await logout(jsonRequest('/api/auth/logout', 'POST'));
    expect(signedOut.status).toBe(200);
    expect(cookieState.value).toBeUndefined();

    const protectedAfterLogout = await listSchools(jsonRequest('/api/platform/schools', 'GET'));
    expect(protectedAfterLogout.status).toBe(401);
  });

  it('blocks login for a school whose status is suspended', async () => {
    await createInitialPlatformAdmin({
      name: 'Platform Owner',
      email: 'owner@edusphere.test',
      password: 'PlatformPassword123!',
    });
    await signIn('owner@edusphere.test', 'PlatformPassword123!');
    const created = await createSchool(
      jsonRequest('/api/platform/schools', 'POST', {
        name: 'Suspended School',
        email: 'office@suspended.test',
        phone: '+1 202 555 0199',
        address: '9 Closed Lane, Easton',
        status: 'suspended',
        adminName: 'Jordan Lee',
        adminEmail: 'jordan@suspended.test',
      })
    );
    const payload = await responseJson<{ temporaryPassword: string }>(created);

    await logout(jsonRequest('/api/auth/logout', 'POST'));
    const response = await signIn('jordan@suspended.test', payload.temporaryPassword);
    expect(response.status).toBe(401);
  });

  it('rejects unauthenticated and cross-role access', async () => {
    const unauthenticatedList = await listSchools(jsonRequest('/api/platform/schools', 'GET'));
    expect(unauthenticatedList.status).toBe(401);

    await createInitialPlatformAdmin({
      name: 'Platform Owner',
      email: 'owner@edusphere.test',
      password: 'PlatformPassword123!',
    });
    await signIn('owner@edusphere.test', 'PlatformPassword123!');
    const wrongDashboard = await schoolDashboard(jsonRequest('/api/school/dashboard', 'GET'));
    expect(wrongDashboard.status).toBe(403);
  });
});
