import { getDatabaseUrl } from '@/lib/env';
import * as schema from '@/lib/db/schema';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

declare global {
  var __canonDb: ReturnType<typeof drizzle<typeof schema>> | undefined;
}

export function getDb() {
  const databaseUrl = getDatabaseUrl();

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not configured');
  }

  if (!global.__canonDb) {
    const sql = neon(databaseUrl);
    global.__canonDb = drizzle(sql, { schema });
  }

  return global.__canonDb;
}
