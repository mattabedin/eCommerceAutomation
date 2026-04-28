import { neon } from '@neondatabase/serverless';
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema';

type DB = NeonHttpDatabase<typeof schema>;

// During Vercel/local builds, we need a concrete db instance to pass to the
// Auth.js Drizzle adapter at module load. If DATABASE_URL is missing we
// initialise against a placeholder URL — the build succeeds, and the first
// real query throws a clear error.
const url =
  process.env.DATABASE_URL ||
  'postgres://placeholder:placeholder@placeholder.neon.tech/placeholder?sslmode=require';

if (!process.env.DATABASE_URL) {
  // Loud during dev/test; harmless during a static-only build that never queries.
  console.warn(
    '[@forge/db] DATABASE_URL is not set — using a placeholder. Queries will fail at runtime.',
  );
}

const sql = neon(url);

export const db: DB = drizzle(sql, { schema });

export * from './schema';
export type Database = DB;
