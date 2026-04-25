import { isDemoSeedEnabled } from '@/lib/env';
import { canonItems } from '@/lib/db/schema';
import { getDb } from '@/lib/db/client';
import { CanonCategory, canonCategories } from '@/features/canon/domain';
import { demoEarthSeed } from '@/features/earth/seed';

export type EarthEntry = {
  title: string;
  category: CanonCategory;
  votes: number;
  updatedAt: string;
};

export type EarthCanon = EarthEntry[];

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

    const entries: EarthEntry[] = [];

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

      for (const entry of grouped.values()) {
        entries.push({
          title: entry.title,
          category,
          votes: entry.votes,
          updatedAt: entry.updatedAt.toISOString(),
        });
      }
    }

    entries.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return entries;
  }

  private getFallbackEarthCanon(): EarthCanon {
    if (!isDemoSeedEnabled()) {
      return [];
    }

    return demoEarthSeed;
  }
}
