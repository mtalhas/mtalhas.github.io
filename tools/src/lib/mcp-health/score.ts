export interface ServerSignals {
  daysSinceLastCommit: number;
  openIssues: number;
  closedIssues: number;
  stars: number;
  starsDelta30d: number;
  daysSinceLastRelease: number | null;
}

export interface ScoreBreakdown {
  composite: number;
  commitRecency: number;
  issueRatio: number;
  starsGrowth: number;
  releaseRecency: number;
}

function clamp01(x: number): number { return Math.max(0, Math.min(1, x)); }

function commitRecencyScore(days: number): number {
  return clamp01(Math.exp(-days / 90));            // half-life ~62 days
}

function issueRatioScore(open: number, closed: number): number {
  if (open + closed === 0) return 0.5;
  return clamp01(closed / (open + closed));
}

function starsGrowthScore(delta30d: number, total: number): number {
  if (total <= 0) return 0;
  const growth = delta30d / Math.max(total, 1);
  return clamp01(growth * 12);                     // 8.3% per month -> 1.0
}

function releaseRecencyScore(days: number | null): number {
  if (days === null) return 0.3;
  return clamp01(Math.exp(-days / 180));
}

export function computeHealth(s: ServerSignals): ScoreBreakdown {
  const cr = commitRecencyScore(s.daysSinceLastCommit);
  const ir = issueRatioScore(s.openIssues, s.closedIssues);
  const sg = starsGrowthScore(s.starsDelta30d, s.stars);
  const rr = releaseRecencyScore(s.daysSinceLastRelease);
  return {
    composite: 0.4 * cr + 0.3 * ir + 0.2 * sg + 0.1 * rr,
    commitRecency: cr,
    issueRatio: ir,
    starsGrowth: sg,
    releaseRecency: rr
  };
}
