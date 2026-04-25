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

export function slugifyCrateUserName(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);

  return slug.length > 0 ? slug : 'crate';
}

export function isCanonCategory(value: string): value is CanonCategory {
  return canonCategories.includes(value as CanonCategory);
}

// ── v2 types (enriched with evolution history + prompt template) ──

export type CanonSlotEvolution = {
  from: CanonSelection | null;
  to: CanonSelection;
  evolved_at: string;
};

export type CanonSlotV2 = {
  current: CanonSelection;
  evolutions: CanonSlotEvolution[];
};

export type CanonMapV2 = Record<CanonCategory, CanonSlotV2 | null>;

export type CanonRecordV2 = {
  schema: 'crate-agent-v2';
  slug: string;
  username: string | null;
  updated_at: string;
  canon: CanonMapV2;
  evolutions_count: number;
  prompt_template: string;
};

export function buildCanonMapV2(
  canonMap: CanonMap,
  evolutions: CanonEvolutionRecord[],
): CanonMapV2 {
  const result: CanonMapV2 = { person: null, place: null, thing: null };

  for (const category of canonCategories) {
    const current = canonMap[category];
    if (!current) continue;

    const slotEvolutions = evolutions
      .filter((e) => e.category === category)
      .map((e): CanonSlotEvolution => ({
        from:
          e.old_title !== null && e.old_rationale !== null
            ? { title: e.old_title, rationale: e.old_rationale }
            : null,
        to: { title: e.new_title, rationale: e.new_rationale },
        evolved_at: e.evolved_at,
      }));

    result[category] = { current, evolutions: slotEvolutions };
  }

  return result;
}

const PROMPT_TEMPLATE =
  "This is a verified human's Crate — a taste profile with three slots " +
  '(person, place, thing). Each slot has a current pick with rationale and ' +
  'an evolution history showing past picks with timestamps. The arc of ' +
  'changes reveals taste trajectory: what they moved away from, what they ' +
  'moved toward, and how quickly. Use the rationale fields to understand ' +
  'WHY, not just WHAT. Do not invent preferences beyond what the data ' +
  'shows. Do not adopt a persona — present taste insights in whatever ' +
  'voice suits your application.';

export function buildPromptTemplate(): string {
  return PROMPT_TEMPLATE;
}
