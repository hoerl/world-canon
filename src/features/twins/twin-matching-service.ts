import { hasDatabase } from '@/lib/env';
import { getDb } from '@/lib/db/client';
import { canonItems, users } from '@/lib/db/schema';
import { eq, ne, and, sql } from 'drizzle-orm';
import { TwinMatch, TwinOverlap } from '@/features/twins/domain';
import { CanonCategory } from '@/features/canon/domain';

const TITLE_MATCH_POINTS = 5;
const TAG_MATCH_POINTS = 1;
const MIN_SCORE = TITLE_MATCH_POINTS;

export class TwinMatchingService {
  async findTwins(userId: string): Promise<TwinMatch[]> {
    if (!hasDatabase()) {
      return [];
    }

    const db = getDb();

    const myItems = await db
      .select({
        category: canonItems.category,
        titleNormalized: canonItems.titleNormalized,
        title: canonItems.title,
        tags: canonItems.tags,
      })
      .from(canonItems)
      .where(eq(canonItems.userId, userId));

    if (myItems.length === 0) {
      return [];
    }

    const titleMatches = await db
      .select({
        userId: canonItems.userId,
        category: canonItems.category,
        title: canonItems.title,
        titleNormalized: canonItems.titleNormalized,
        tags: canonItems.tags,
      })
      .from(canonItems)
      .where(
        and(
          ne(canonItems.userId, userId),
          sql`(${canonItems.category}, ${canonItems.titleNormalized}) IN (${sql.join(
            myItems.map(
              (item) => sql`(${item.category}::canon_category, ${item.titleNormalized})`,
            ),
            sql`, `,
          )})`,
        ),
      );

    const myTags = new Set(myItems.flatMap((item) => item.tags));

    const scoreMap = new Map<
      string,
      { score: number; overlaps: TwinOverlap[]; sharedTags: Set<string> }
    >();

    for (const match of titleMatches) {
      const entry = scoreMap.get(match.userId) ?? {
        score: 0,
        overlaps: [],
        sharedTags: new Set<string>(),
      };

      entry.score += TITLE_MATCH_POINTS;
      entry.overlaps.push({
        category: match.category as CanonCategory,
        title: match.title,
      });

      for (const tag of match.tags) {
        if (myTags.has(tag)) {
          entry.sharedTags.add(tag);
        }
      }

      scoreMap.set(match.userId, entry);
    }

    for (const [uid, entry] of scoreMap) {
      entry.score += entry.sharedTags.size * TAG_MATCH_POINTS;
      if (entry.score < MIN_SCORE) {
        scoreMap.delete(uid);
      }
    }

    if (scoreMap.size === 0) {
      return [];
    }

    const matchedUserIds = [...scoreMap.keys()];
    const matchedUsers = await db
      .select({
        id: users.id,
        publicSlug: users.publicSlug,
        worldUsername: users.worldUsername,
      })
      .from(users)
      .where(sql`${users.id} IN (${sql.join(matchedUserIds.map((id) => sql`${id}`), sql`, `)})`);

    const userLookup = new Map(matchedUsers.map((u) => [u.id, u]));

    const twins: TwinMatch[] = [];
    for (const [uid, entry] of scoreMap) {
      const user = userLookup.get(uid);
      if (!user) continue;

      twins.push({
        slug: user.publicSlug,
        username: user.worldUsername,
        score: entry.score,
        overlaps: entry.overlaps,
        sharedTags: [...entry.sharedTags],
      });
    }

    twins.sort((a, b) => b.score - a.score);
    return twins.slice(0, 10);
  }
}
