import { buildSeedRows } from '@/features/twins/seed';
import { isDemoSeedEnabled } from '@/lib/env';
import { getDb } from '@/lib/db/client';
import { canonItems, users } from '@/lib/db/schema';
import { HttpError, jsonOk, handleRouteError } from '@/lib/http';
import { eq } from 'drizzle-orm';

export async function POST() {
  try {
    if (!isDemoSeedEnabled()) {
      throw new HttpError(404, 'Not found');
    }

    const db = getDb();
    const seedRows = buildSeedRows();
    let created = 0;

    for (const row of seedRows) {
      const [existing] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.publicSlug, row.user.publicSlug))
        .limit(1);

      if (existing) continue;

      const [user] = await db.insert(users).values(row.user).returning({ id: users.id });

      for (const item of row.items) {
        await db.insert(canonItems).values({
          userId: user.id,
          ...item,
        });
      }

      created += 1;
    }

    return jsonOk({ seeded: created, total: seedRows.length });
  } catch (error) {
    return handleRouteError(error);
  }
}
