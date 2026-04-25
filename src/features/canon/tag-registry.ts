import { CanonCategory } from '@/features/canon/domain';

export const TAG_REGISTRY: Record<CanonCategory, readonly string[]> = {
  person: ['Author', 'Artist', 'Musician', 'Chef', 'Athlete', 'Scientist', 'Director', 'Leader'],
  place: ['City', 'Country', 'Restaurant', 'Nature', 'Museum', 'Neighborhood', 'Building', 'Beach'],
  thing: ['Book', 'Film', 'Song', 'Album', 'Food', 'Game', 'Show', 'Tool'],
};

export function getTagsForCategory(category: CanonCategory): readonly string[] {
  return TAG_REGISTRY[category];
}

export function isValidTag(
  category: CanonCategory,
  tag: string,
  grandfatheredTags: string[] = [],
): boolean {
  return TAG_REGISTRY[category].includes(tag) || grandfatheredTags.includes(tag);
}

export const MAX_TAGS_PER_SLOT = 3;
