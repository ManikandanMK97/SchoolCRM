import 'dotenv/config';
import { z } from 'zod';
import { getPool } from './index';
import { migrateDatabase } from './migrations';
import { createInitialPlatformAdmin } from '@/lib/auth';

const seedEnvironmentSchema = z.object({
  INITIAL_ADMIN_EMAIL: z.string().trim().email().max(254).toLowerCase(),
  INITIAL_ADMIN_PASSWORD: z
    .string()
    .min(12)
    .max(72)
    .refine((password) => Buffer.byteLength(password, 'utf8') <= 72),
  INITIAL_ADMIN_NAME: z.string().trim().min(2).max(120).default('Platform Admin'),
});

async function main() {
  const environment = seedEnvironmentSchema.parse(process.env);
  const pool = getPool();
  try {
    await migrateDatabase(pool);
    await createInitialPlatformAdmin({
      name: environment.INITIAL_ADMIN_NAME,
      email: environment.INITIAL_ADMIN_EMAIL,
      password: environment.INITIAL_ADMIN_PASSWORD,
    });
    console.log(`Created Platform Super Admin ${environment.INITIAL_ADMIN_EMAIL}.`);
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(
    'Platform Super Admin setup failed.',
    error instanceof Error ? error.message : 'Unknown error.'
  );
  process.exitCode = 1;
});
