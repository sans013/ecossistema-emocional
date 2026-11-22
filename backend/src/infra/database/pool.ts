import { Pool } from 'pg';
import { getEnv } from '../config/env';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const { DATABASE_URL } = getEnv();
    pool = new Pool({
      connectionString: DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });
  }
  return pool;
}

export async function checkDatabaseConnection(): Promise<boolean> {
  const client = await getPool().connect();
  try {
    await client.query('SELECT 1');
    return true;
  } finally {
    client.release();
  }
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}