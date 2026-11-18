import { createHash, randomBytes } from 'node:crypto';
import { cache } from 'react';
import bcrypt from 'bcryptjs';
import { and, eq, gt, lt, ne } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { getDatabase } from '@/db';
import { sessions, schools, users } from '@/db/schema';
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from './constants';
import type { UserRole } from './constants';
import { AppError, uniqueConflict } from './errors';
import type { LoginInput } from './schemas';

const BCRYPT_ROUNDS = 12;
const DUMMY_PASSWORD_HASH = bcrypt.hashSync('eduSphere-no-account-password', BCRYPT_ROUNDS);

export type AuthenticatedUser = {
  id: string;
  schoolId: string | null;
  name: string;
  email: string;
  role: UserRole;
  mustChangePassword: boolean;
};

export type LoginResult = {
  user: AuthenticatedUser;
  sessionToken: string;
};

export function hashSessionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function authenticateUser(input: LoginInput): Promise<LoginResult> {
  const database = getDatabase();
  const [account] = await database
    .select({
      id: users.id,
      schoolId: users.schoolId,
      name: users.name,
      email: users.email,
      passwordHash: users.passwordHash,
      role: users.role,
      mustChangePassword: users.mustChangePassword,
      isActive: users.isActive,
      schoolStatus: schools.status,
    })
    .from(users)
    .leftJoin(schools, eq(users.schoolId, schools.id))
    .where(eq(users.email, input.email))
    .limit(1);

  const passwordMatches = await bcrypt.compare(
    input.password,
    account?.passwordHash ?? DUMMY_PASSWORD_HASH
  );
  const accountActive =
    account?.isActive &&
    (account.role === 'platform_super_admin' || account.schoolStatus === 'active');

  if (!account || !passwordMatches || !accountActive) {
    throw new AppError('Invalid email or password.', 401, 'unauthorized');
  }

  const sessionToken = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
  await database.delete(sessions).where(lt(sessions.expiresAt, new Date()));
  await database.insert(sessions).values({
    userId: account.id,
    tokenHash: hashSessionToken(sessionToken),
    expiresAt,
  });

  return {
    user: {
      id: account.id,
      schoolId: account.schoolId,
      name: account.name,
      email: account.email,
      role: account.role,
      mustChangePassword: account.mustChangePassword,
    },
    sessionToken,
  };
}

export async function createInitialPlatformAdmin(input: {
  name: string;
  email: string;
  password: string;
}): Promise<void> {
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  try {
    await getDatabase().insert(users).values({
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash,
      role: 'platform_super_admin',
      schoolId: null,
      mustChangePassword: false,
    });
  } catch (error) {
    if (uniqueConflict(error)) {
      throw new Error('An account with that email already exists.');
    }
    throw error;
  }
}

export async function revokeSession(token: string | undefined): Promise<void> {
  if (!token) return;
  await getDatabase()
    .delete(sessions)
    .where(eq(sessions.tokenHash, hashSessionToken(token)));
}

export const getCurrentUser = cache(
  async function getCurrentUser(): Promise<AuthenticatedUser | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;

    const [session] = await getDatabase()
      .select({
        id: users.id,
        schoolId: users.schoolId,
        name: users.name,
        email: users.email,
        role: users.role,
        mustChangePassword: users.mustChangePassword,
        isActive: users.isActive,
        schoolStatus: schools.status,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .leftJoin(schools, eq(users.schoolId, schools.id))
      .where(
        and(eq(sessions.tokenHash, hashSessionToken(token)), gt(sessions.expiresAt, new Date()))
      )
      .limit(1);

    if (
      !session ||
      !session.isActive ||
      (session.role === 'school_admin' && session.schoolStatus !== 'active')
    ) {
      return null;
    }

    return {
      id: session.id,
      schoolId: session.schoolId,
      name: session.name,
      email: session.email,
      role: session.role,
      mustChangePassword: session.mustChangePassword,
    };
  }
);

export async function updateInitialPassword(
  user: AuthenticatedUser,
  password: string,
  currentToken: string
): Promise<void> {
  if (!user.mustChangePassword) {
    throw new AppError('A first-login password change is not required.', 409, 'conflict');
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const currentTokenHash = hashSessionToken(currentToken);
  await getDatabase().transaction(async (transaction) => {
    const updated = await transaction
      .update(users)
      .set({
        passwordHash,
        mustChangePassword: false,
        updatedAt: new Date(),
      })
      .where(and(eq(users.id, user.id), eq(users.mustChangePassword, true)))
      .returning({ id: users.id });

    if (!updated.length) {
      throw new AppError('The password has already been changed.', 409, 'conflict');
    }

    await transaction.delete(sessions).where(
      and(
        eq(sessions.userId, user.id),
        // Keep the current login and revoke any additional sessions.
        ne(sessions.tokenHash, currentTokenHash)
      )
    );
  });
}

export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value;
}
