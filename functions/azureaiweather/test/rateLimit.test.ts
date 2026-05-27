import { describe, test, expect } from 'vitest';
import { consume } from '../src/lib/rateLimit.js';

describe('rateLimit.consume', () => {
  test('allows up to capacity per ip', () => {
    const ip = `1.2.3.${Math.random()}`;
    for (let i = 0; i < 3; i++) expect(consume(ip, 3).ok).toBe(true);
    expect(consume(ip, 3).ok).toBe(false);
  });
  test('different IPs have independent buckets', () => {
    const a = `10.${Math.random()}`;
    const b = `11.${Math.random()}`;
    for (let i = 0; i < 2; i++) consume(a, 2);
    expect(consume(a, 2).ok).toBe(false);
    expect(consume(b, 2).ok).toBe(true);
  });
});
