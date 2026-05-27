import { describe, test, expect } from 'vitest';
import { computeHealth } from '@/lib/mcp-health/score';

describe('computeHealth', () => {
  test('result is in [0,1]', () => {
    const r = computeHealth({ daysSinceLastCommit: 0, openIssues: 0, closedIssues: 0, stars: 0, starsDelta30d: 0, daysSinceLastRelease: null });
    expect(r.composite).toBeGreaterThanOrEqual(0);
    expect(r.composite).toBeLessThanOrEqual(1);
  });

  test('recent active repo scores high', () => {
    const r = computeHealth({ daysSinceLastCommit: 3, openIssues: 5, closedIssues: 95, stars: 500, starsDelta30d: 100, daysSinceLastRelease: 14 });
    expect(r.composite).toBeGreaterThan(0.75);
  });

  test('stale unmaintained repo scores low', () => {
    const r = computeHealth({ daysSinceLastCommit: 500, openIssues: 200, closedIssues: 10, stars: 1000, starsDelta30d: 0, daysSinceLastRelease: 800 });
    expect(r.composite).toBeLessThan(0.25);
  });

  test('formula weights match documented values (smoke)', () => {
    const r = computeHealth({ daysSinceLastCommit: 0, openIssues: 0, closedIssues: 1, stars: 1, starsDelta30d: 0, daysSinceLastRelease: 0 });
    // commitRecency=1, issueRatio=1, starsGrowth=0, releaseRecency=1 -> 0.4+0.3+0+0.1 = 0.8
    expect(r.composite).toBeCloseTo(0.8, 5);
  });

  test('no issues yields baseline 0.5 issueRatio (avoids divide-by-zero punishment)', () => {
    const r = computeHealth({ daysSinceLastCommit: 0, openIssues: 0, closedIssues: 0, stars: 0, starsDelta30d: 0, daysSinceLastRelease: 0 });
    expect(r.issueRatio).toBe(0.5);
  });

  test('no release marker yields baseline 0.3 release score', () => {
    const r = computeHealth({ daysSinceLastCommit: 0, openIssues: 0, closedIssues: 0, stars: 0, starsDelta30d: 0, daysSinceLastRelease: null });
    expect(r.releaseRecency).toBe(0.3);
  });
});
