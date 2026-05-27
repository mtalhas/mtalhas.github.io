import { describe, test, expect } from 'vitest';
import { sha256, normalize, diffItems } from '../src/lib/diff.js';
import type { ChangeItem } from '../src/shared/types.js';

const a: ChangeItem = { id: 'a', title: 'A', body: 'one' };
const b: ChangeItem = { id: 'b', title: 'B', body: 'two' };
const c: ChangeItem = { id: 'c', title: 'C', body: 'three' };

describe('diff', () => {
  test('sha256 stable + 64 hex chars', () => {
    expect(sha256('hello')).toBe(sha256('hello'));
    expect(sha256('hello')).not.toBe(sha256('world'));
    expect(sha256('').length).toBe(64);
  });
  test('normalize collapses whitespace', () => {
    expect(normalize(' a  \t\nb ')).toBe('a b');
  });
  test('diffItems detects adds + removes', () => {
    const d = diffItems([a, b], [b, c]);
    expect(d.added.map(i => i.id)).toEqual(['c']);
    expect(d.removed.map(i => i.id)).toEqual(['a']);
  });
  test('diffItems empty when equal', () => {
    expect(diffItems([a, b], [a, b])).toEqual({ added: [], removed: [] });
  });
});
