import { describe, test, expect } from 'vitest';
import { encodePermalink, decodePermalink } from '@/lib/mcpmeter/permalink';

describe('permalink', () => {
  test('roundtrips a result', () => {
    const original = { totalTokens: 12345, model: 'anthropic:claude-sonnet-4-6', usd: 0.037 };
    const hash = encodePermalink(original);
    expect(hash).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(decodePermalink(hash)).toEqual(original);
  });

  test('rejects payload with wrong shape', () => {
    const badHash = encodePermalink({ totalTokens: 1, model: 'x', usd: 1 });
    // Manually craft a hash with bad shape
    const evilJson = JSON.stringify({ totalTokens: 'not-a-number', model: 'x', usd: 0 });
    const evilHash = btoa(evilJson).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
    expect(() => decodePermalink(evilHash)).toThrow(/invalid payload/i);
    // sanity
    expect(decodePermalink(badHash).totalTokens).toBe(1);
  });

  test('rejects oversized hash', () => {
    const huge = 'a'.repeat(20000);
    expect(() => decodePermalink(huge)).toThrow(/too large/i);
  });
});
