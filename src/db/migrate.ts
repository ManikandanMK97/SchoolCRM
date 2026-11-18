import 'dotenv/config';
import { getPool } from './index';
import { migrateDatabase } from './migrations';

async function main() {
  const pool = getPool();
  try {
    await migrateDatabase(pool);
    console.log('EduSphere database migrations are up to date.');
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error('Database migration failed.', error);
  process.exitCode = 1;
});
