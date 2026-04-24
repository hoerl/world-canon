import { isDemoSeedEnabled } from '@/lib/env';
import { canonItems } from '@/lib/db/schema';
import { getDb } from '@/lib/db/client';
import { CanonCategory, canonCategories } from '@/features/canon/domain';
import { demoEarthSeed } from '@/features/earth/seed';

export type EarthEntry = {
  title: string;
  votes: number;
};

export type EarthCanon = Record<CanonCategory, EarthEntry[]>;

export class EarthService {
  async listEarthCanon(): Promise<EarthCanon> {
    if (!process.env.DATABASE_URL) {
      return this.getFallbackEarthCanon();
    }

    const rows = await getDb()
      .select({
        category: canonItems.category,
        title: canonItems.title,
        titleNormalized: canonItems.titleNormalized,
        updatedAt: canonItems.updatedAt,
      })
      .from(canonItems);

    if (rows.length === 0) {
      return this.getFallbackEarthCanon();
    }

    const result: EarthCanon = {
      person: [],
      place: [],
      thing: [],
    };

    for (const category of canonCategories) {
      const grouped = new Map<
        string,
        { title: string; votes: number; updatedAt: Date }
      >();

      for (const row of rows.filter((candidate) => candidate.category === category)) {
        const existing = grouped.get(row.titleNormalized);
        if (!existing) {
          grouped.set(row.titleNormalized, {
            title: row.title,
            votes: 1,
            updatedAt: row.updatedAt,
          });
          continue;
        }

        existing.votes += 1;
        if (row.updatedAt > existing.updatedAt) {
          existing.updatedAt = row.updatedAt;
          existing.title = row.title;
        }
      }

      result[category] = Array.from(grouped.values())
        .sort((left, right) => {
          if (right.votes !== left.votes) {
            return right.votes - left.votes;
          }
          return right.updatedAt.getTime() - left.updatedAt.getTime();
        })
        .slice(0, 10)
        .map(({ title, votes }) => ({ title, votes }));
    }

    return result;
  }

  private getFallbackEarthCanon(): EarthCanon {
    if (!isDemoSeedEnabled()) {
      return {
        person: [],
        place: [],
        thing: [],
      };
    }

    return demoEarthSeed;
  }
}
