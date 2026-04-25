import { hasDatabase } from '@/lib/env';
import { HttpError } from '@/lib/http';
import { getDb } from '@/lib/db/client';
import { canonEvolutions, canonItems, users } from '@/lib/db/schema';
import {
  CanonCategory,
  CanonEvolutionRecord,
  CanonMap,
  CanonRecord,
  CanonSlotInput,
  createEmptyCanonMap,
  normalizeCanonTitle,
} from '@/features/canon/domain';
import { and, desc, eq, sql } from 'drizzle-orm';

type BoundUserIdentity = {
  walletAddress: string;
  username: string | null;
  verificationLevel: string;
};

export class CanonService {
  private ensureDatabase() {
    if (!hasDatabase()) {
      throw new HttpError(503, 'DATABASE_URL is not configured');
    }
  }

  async getUserByWalletAddress(walletAddress: string) {
    if (!hasDatabase()) {
      return null;
    }

    const db = getDb();
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.walletAddress, walletAddress))
      .orderBy(desc(users.updatedAt))
      .limit(1);

    return user ?? null;
  }

  async getUserByWorldSessionId(worldSessionId: string) {
    this.ensureDatabase();
    const db = getDb();
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.worldSessionId, worldSessionId))
      .limit(1);

    return user ?? null;
  }

  async getUserBySlug(slug: string) {
    this.ensureDatabase();
    const db = getDb();
    const [user] = await db.select().from(users).where(eq(users.publicSlug, slug)).limit(1);
    return user ?? null;
  }

  async createBoundUser(params: {
    worldSessionId: `session_${string}`;
    publicSlug: string;
    walletAddress: string;
    username: string | null;
    verificationLevel: string;
  }) {
    this.ensureDatabase();
    const db = getDb();
    const [user] = await db
      .insert(users)
      .values({
        worldSessionId: params.worldSessionId,
        publicSlug: params.publicSlug,
        walletAddress: params.walletAddress,
        worldUsername: params.username,
        verificationLevel: params.verificationLevel,
      })
      .returning();

    return user;
  }

  async updateBoundUser(
    userId: string,
    params: Partial<BoundUserIdentity> & {
      worldSessionId?: `session_${string}`;
      publicSlug?: string;
    },
  ) {
    this.ensureDatabase();
    const db = getDb();
    const [user] = await db
      .update(users)
      .set({
        worldSessionId: params.worldSessionId,
        publicSlug: params.publicSlug,
        walletAddress: params.walletAddress,
        worldUsername: params.username,
        verificationLevel: params.verificationLevel,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    return user;
  }

  async isSlugTaken(slug: string) {
    if (!hasDatabase()) {
      return false;
    }

    const db = getDb();
    const [row] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.publicSlug, slug))
      .limit(1);

    return Boolean(row);
  }

  async getCanonByWorldSessionId(worldSessionId: string) {
    const user = await this.getUserByWorldSessionId(worldSessionId);
    if (!user) {
      return null;
    }
    return this.getCanonByUserId(user.id);
  }

  async getCanonBySlug(slug: string) {
    const user = await this.getUserBySlug(slug);
    if (!user) {
      return null;
    }
    return this.getCanonByUserId(user.id);
  }

  async getCanonByUserId(userId: string): Promise<CanonRecord | null> {
    this.ensureDatabase();
    const db = getDb();

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) {
      return null;
    }

    const items = await db
      .select()
      .from(canonItems)
      .where(eq(canonItems.userId, userId))
      .orderBy(desc(canonItems.updatedAt));

    const [evolutionCountRow] = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(canonEvolutions)
      .where(eq(canonEvolutions.userId, userId));

    const canon: CanonMap = createEmptyCanonMap();
    for (const item of items) {
      canon[item.category] = {
        title: item.title,
        rationale: item.rationale,
        tags: item.tags ?? [],
      };
    }

    const updatedAt =
      items.map((item) => item.updatedAt).sort((left, right) => right.getTime() - left.getTime())[0] ??
      user.updatedAt;

    return {
      slug: user.publicSlug,
      username: user.worldUsername,
      updated_at: updatedAt.toISOString(),
      canon,
      evolutions_count: evolutionCountRow?.count ?? 0,
    };
  }

  async listEvolutionsByUserId(userId: string): Promise<CanonEvolutionRecord[]> {
    this.ensureDatabase();
    const db = getDb();
    const rows = await db
      .select()
      .from(canonEvolutions)
      .where(eq(canonEvolutions.userId, userId))
      .orderBy(desc(canonEvolutions.evolvedAt));

    return rows.map((row) => ({
      category: row.category,
      old_title: row.oldTitle,
      old_rationale: row.oldRationale,
      new_title: row.newTitle,
      new_rationale: row.newRationale,
      change_kind: row.changeKind,
      evolved_at: row.evolvedAt.toISOString(),
    }));
  }

  async listEvolutionsBySlug(slug: string): Promise<CanonEvolutionRecord[]> {
    const user = await this.getUserBySlug(slug);
    if (!user) {
      throw new HttpError(404, 'Crate not found');
    }
    return this.listEvolutionsByUserId(user.id);
  }

  async upsertCanonSlot(
    worldSessionId: string,
    category: CanonCategory,
    input: CanonSlotInput,
  ): Promise<CanonRecord> {
    const user = await this.getUserByWorldSessionId(worldSessionId);
    if (!user) {
      throw new HttpError(403, 'World ID binding required before editing your canon');
    }

    const db = getDb();
    const [existing] = await db
      .select()
      .from(canonItems)
      .where(and(eq(canonItems.userId, user.id), eq(canonItems.category, category)))
      .limit(1);

    const now = new Date();
    if (existing) {
      await db
        .update(canonItems)
        .set({
          title: input.title,
          titleNormalized: normalizeCanonTitle(input.title),
          rationale: input.rationale,
          tags: input.tags,
          updatedAt: now,
        })
        .where(eq(canonItems.id, existing.id));
    } else {
      await db.insert(canonItems).values({
        userId: user.id,
        category,
        title: input.title,
        titleNormalized: normalizeCanonTitle(input.title),
        rationale: input.rationale,
        tags: input.tags,
        updatedAt: now,
      });
    }

    await db.insert(canonEvolutions).values({
      userId: user.id,
      category,
      oldTitle: existing?.title ?? null,
      oldRationale: existing?.rationale ?? null,
      newTitle: input.title,
      newRationale: input.rationale,
      changeKind: existing ? 'evolve' : 'create',
      evolvedAt: now,
    });

    await db
      .update(users)
      .set({
        updatedAt: now,
      })
      .where(eq(users.id, user.id));

    const canon = await this.getCanonByUserId(user.id);
    if (!canon) {
      throw new HttpError(500, 'Failed to load updated canon');
    }

    return canon;
  }

  async requireCompleteCanonForWorldSessionId(worldSessionId: string) {
    const canon = await this.getCanonByWorldSessionId(worldSessionId);
    if (!canon) {
      throw new HttpError(404, 'Crate not found');
    }

    const missingCategory = Object.entries(canon.canon).find(([, value]) => value === null)?.[0];
    if (missingCategory) {
      throw new HttpError(409, 'Complete your Person, Place, and Thing before enabling a Crate-Agent');
    }

    return canon;
  }
}
