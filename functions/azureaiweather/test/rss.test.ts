import { describe, test, expect } from 'vitest';
import { buildRss } from '../src/lib/rss.js';

describe('buildRss', () => {
  test('produces a valid-shaped RSS doc with escaped content', () => {
    const xml = buildRss(
      [{ id: '1', title: 'Hello & <world>', body: 'b & b' }],
      { title: 'T', link: 'https://example.test', description: 'D' }
    );
    expect(xml).toContain('<?xml version="1.0"');
    expect(xml).toContain('<rss version="2.0">');
    expect(xml).toContain('Hello &amp; &lt;world&gt;');
    expect(xml).toContain('b &amp; b');
  });
  test('handles empty list', () => {
    const xml = buildRss([], { title: 'T', link: 'https://x', description: 'D' });
    expect(xml).toContain('<channel>');
  });
});
