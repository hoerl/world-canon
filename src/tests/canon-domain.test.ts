import {
  createEmptyCanonMap,
  normalizeCanonTitle,
  slugifyCanonUserName,
} from '@/features/canon/domain';
import { describe, expect, it } from 'vitest';

describe('canon domain helpers', () => {
  it('normalizes canon titles consistently', () => {
    expect(normalizeCanonTitle('  Agnes   Martin  ')).toBe('agnes martin');
  });

  it('creates safe slugs', () => {
    expect(slugifyCanonUserName(' Léa / Canon ')).toBe('l-a-canon');
  });

  it('creates an empty canon map', () => {
    expect(createEmptyCanonMap()).toEqual({
      person: null,
      place: null,
      thing: null,
    });
  });
});
