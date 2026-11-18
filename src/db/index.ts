import 'dotenv/config';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const globalForDatabase = globalThis as typeof globalThis & {
  __eduSpherePool?: Pool;
  __eduSphereDb?: NodePgDatabase<typeof schema>;
};

export function getPool(): Pool {
  if (globalForDatabase.__eduSpherePool) {
    return globalForDatabase.__eduSpherePool;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL must be set before accessing the database.');
  }

  const pool = new Pool({
    connectionString,
    ssl: false,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });

  if (process.env.NODE_ENV !== 'production') {
    globalForDatabase.__eduSpherePool = pool;
  }

  return pool;
}

export function getDatabase(): NodePgDatabase<typeof schema> {
  if (globalForDatabase.__eduSphereDb) {
    return globalForDatabase.__eduSphereDb;
  }

  const database = drizzle(getPool(), { schema });
  if (process.env.NODE_ENV !== 'production') {
    globalForDatabase.__eduSphereDb = database;
  }

  return database;
}

export { schema };
