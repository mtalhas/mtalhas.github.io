import { createHash } from 'node:crypto';
import type { ChangeItem, DiffResult } from '../shared/types.js';

export function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

export function normalize(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

export function diffItems(prev: ChangeItem[], next: ChangeItem[]): DiffResult {
  const prevIds = new Set(prev.map(p => p.id));
  const nextIds = new Set(next.map(n => n.id));
  return {
    added: next.filter(n => !prevIds.has(n.id)),
    removed: prev.filter(p => !nextIds.has(p.id))
  };
}
