import type { Pool, PoolClient } from 'pg';

const INITIAL_SCHEMA_SQL = `
  CREATE TYPE school_status AS ENUM ('active', 'suspended');
  CREATE TYPE user_role AS ENUM ('platform_super_admin', 'school_admin');

  CREATE TABLE schools (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    address text NOT NULL,
    status school_status NOT NULL DEFAULT 'active',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  );
  CREATE UNIQUE INDEX schools_email_lower_unique ON schools (lower(email));
  CREATE INDEX schools_status_created_idx ON schools (status, created_at DESC);

  CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
    name text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    role user_role NOT NULL,
    must_change_password boolean NOT NULL DEFAULT false,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT users_role_school_consistency CHECK (
      (role = 'platform_super_admin' AND school_id IS NULL) OR
      (role = 'school_admin' AND school_id IS NOT NULL)
    )
  );
  CREATE UNIQUE INDEX users_email_lower_unique ON users (lower(email));
  CREATE UNIQUE INDEX users_school_admin_unique ON users (school_id)
    WHERE role = 'school_admin';
  CREATE INDEX users_school_id_idx ON users (school_id);

  CREATE TABLE sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash text NOT NULL UNIQUE,
    expires_at timestamptz NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
  );
  CREATE INDEX sessions_user_id_idx ON sessions (user_id);
  CREATE INDEX sessions_expiry_idx ON sessions (expires_at);
`;

const migrations = [
  {
    id: '001_initial_tenant_schema',
    async up(client: PoolClient) {
      await client.query(INITIAL_SCHEMA_SQL);
    },
  },
] as const;

export async function migrateDatabase(pool: Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  const client = await pool.connect();
  try {
    await client.query("SELECT pg_advisory_lock(hashtext('edusphere:migrations'))");
    for (const migration of migrations) {
      const existing = await client.query<{ id: string }>(
        'SELECT id FROM schema_migrations WHERE id = $1 LIMIT 1',
        [migration.id]
      );
      if (existing.rowCount) continue;

      await client.query('BEGIN');
      try {
        await migration.up(client);
        await client.query('INSERT INTO schema_migrations (id) VALUES ($1)', [migration.id]);
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }
  } finally {
    await client.query("SELECT pg_advisory_unlock(hashtext('edusphere:migrations'))");
    client.release();
  }
}
