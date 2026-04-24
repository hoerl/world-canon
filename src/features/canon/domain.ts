import { z } from 'zod';

export const canonCategories = ['person', 'place', 'thing'] as const;
export type CanonCategory = (typeof canonCategories)[number];

export type CanonSelection = {
  title: string;
  rationale: string;
};

export type CanonMap = Record<CanonCategory, CanonSelection | null>;

export type CanonRecord = {
  slug: string;
  username: string | null;
  updated_at: string;
  canon: CanonMap;
  evolutions_count: number;
};

export type CanonEvolutionRecord = {
  category: CanonCategory;
  old_title: string | null;
  old_rationale: string | null;
  new_title: string;
  new_rationale: string;
  change_kind: 'create' | 'evolve';
  evolved_at: string;
};

export const canonSlotInputSchema = z.object({
  title: z.string().trim().min(1).max(120),
  rationale: z.string().trim().min(1).max(180),
});

export type CanonSlotInput = z.infer<typeof canonSlotInputSchema>;

export function createEmptyCanonMap(): CanonMap {
  return {
    person: null,
    place: null,
    thing: null,
  };
}

export function normalizeCanonTitle(title: string) {
  return title.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function slugifyCanonUserName(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);

  return slug.length > 0 ? slug : 'canon';
}

export function isCanonCategory(value: string): value is CanonCategory {
  return canonCategories.includes(value as CanonCategory);
}
