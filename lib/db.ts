import { Pool } from "pg";

const globalForDb = globalThis as unknown as { pearlbodyPool?: Pool };

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS signups (
    id BIGSERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    source TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`;

export function getPool(): Pool | null {
  const connectionString = process.env.POSTGRES_URL;
  if (!connectionString) return null;

  if (!globalForDb.pearlbodyPool) {
    globalForDb.pearlbodyPool = new Pool({
      connectionString,
      max: 1,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
    });
  }
  return globalForDb.pearlbodyPool;
}

let ready: Promise<void> | null = null;

export function ensureSchema(pool: Pool): Promise<void> {
  if (ready) return ready;
  const p: Promise<void> = pool
    .query(SCHEMA)
    .then(() => undefined)
    .catch((err: unknown) => {
      if (ready === p) ready = null;
      throw err;
    });
  ready = p;
  return p;
}

export async function recordSignup(
  pool: Pool,
  email: string,
  name: string,
  source: string,
): Promise<void> {
  await ensureSchema(pool);
  await pool.query(
    `INSERT INTO signups (email, name, source)
     VALUES ($1, NULLIF($2, ''), $3)
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, source = EXCLUDED.source`,
    [email, name, source],
  );
}
