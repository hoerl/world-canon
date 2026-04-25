import {
  createEmptyCanonMap,
  normalizeCanonTitle,
  slugifyCrateUserName,
} from '@/features/canon/domain';
import { describe, expect, it } from 'vitest';

describe('canon domain helpers', () => {
  it('normalizes canon titles consistently', () => {
    expect(normalizeCanonTitle('  Agnes   Martin  ')).toBe('agnes martin');
  });

  it('creates safe slugs', () => {
    expect(slugifyCrateUserName(' Léa / Canon ')).toBe('l-a-canon');
  });

  it('falls back to "crate" for empty slugs', () => {
    expect(slugifyCrateUserName('   ')).toBe('crate');
  });

  it('creates an empty canon map', () => {
    expect(createEmptyCanonMap()).toEqual({
      person: null,
      place: null,
      thing: null,
    });
  });
});
