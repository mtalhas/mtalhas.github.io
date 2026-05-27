import { describe, test, expect } from 'vitest';
import { parseConfig } from '@/lib/mcpmeter/parseConfig';
import { estimateTokens } from '@/lib/mcpmeter/estimate';
import { costPerTurn, daysSince } from '@/lib/mcpmeter/pricing';
import fx from '@fixtures/mcpmeter/sample-configs.json';
import pricing from '@/data/pricing.json';

describe('parseConfig', () => {
  test('parses claude_desktop_config.json shape and infers pkg', () => {
    const r = parseConfig(JSON.stringify(fx.claudeDesktopShape));
    expect(r.servers.map(s => s.name).sort()).toEqual(['filesystem', 'github']);
    const fs = r.servers.find(s => s.name === 'filesystem')!;
    expect(fs.pkg).toContain('@modelcontextprotocol/server-filesystem');
  });

  test('parses generic list shape', () => {
    const r = parseConfig(JSON.stringify(fx.genericListShape));
    expect(r.servers.length).toBe(2);
    expect(r.servers[0].tools![0].name).toBe('web_search');
  });

  test('rejects malformed JSON with a helpful error', () => {
    expect(() => parseConfig(fx.malformed)).toThrow(/JSON/i);
  });

  test('rejects unrecognized shape', () => {
    expect(() => parseConfig('{"unrelated":true}')).toThrow(/Unrecognized/i);
  });
});

describe('estimateTokens', () => {
  test('uses known-server lookup when package matches', async () => {
    const parsed = parseConfig(JSON.stringify(fx.claudeDesktopShape));
    const r = await estimateTokens(parsed);
    const fs = r.perServer.find(row => row.server === 'filesystem')!;
    expect(fs.source).toBe('known-server');
    expect(fs.confidence).toBe('high');
    expect(fs.openaiTokens).toBeGreaterThan(0);
  });

  test('falls back to tool-list tokenization', async () => {
    const parsed = parseConfig(JSON.stringify(fx.genericListShape));
    const r = await estimateTokens(parsed);
    for (const row of r.perServer) {
      expect(row.source).toBe('tool-list');
      expect(row.openaiTokens).toBeGreaterThan(0);
      expect(row.anthropicTokens).toBeGreaterThan(0);
    }
  });

  test('totals sum across servers', async () => {
    const parsed = parseConfig(JSON.stringify(fx.claudeDesktopShape));
    const r = await estimateTokens(parsed);
    const sum = r.perServer.reduce((a, b) => a + b.anthropicTokens, 0);
    expect(r.totals.anthropic).toBe(sum);
  });
});

describe('costPerTurn', () => {
  test('USD = (tokens / 1M) * inputPer1M', () => {
    const rate = (pricing as any).models['anthropic:claude-sonnet-4-6'];
    expect(costPerTurn(1_000_000, rate)).toBeCloseTo(3.00, 4);
    expect(costPerTurn(12_300, rate)).toBeCloseTo(0.0369, 4);
  });
});

describe('daysSince', () => {
  test('returns nonnegative days for past date', () => {
    expect(daysSince('2026-05-20', new Date('2026-05-27'))).toBe(7);
  });
  test('returns Infinity for invalid date', () => {
    expect(daysSince('not-a-date')).toBe(Infinity);
  });
});
