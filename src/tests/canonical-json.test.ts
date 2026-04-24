import { canonicalJsonStringify } from '@/lib/crypto';
import { describe, expect, it } from 'vitest';

describe('canonicalJsonStringify', () => {
  it('sorts object keys deterministically', () => {
    expect(canonicalJsonStringify({ b: 1, a: 2 })).toBe('{"a":2,"b":1}');
  });

  it('preserves nested ordering recursively', () => {
    expect(canonicalJsonStringify({ z: { b: 1, a: 2 } })).toBe('{"z":{"a":2,"b":1}}');
  });
});
