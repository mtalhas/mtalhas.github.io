export interface BadgeInput {
  totalTokens: number;
  modelLabel: string;
  usd: number;
  variant: 'numeric' | 'percentile' | 'compare';
  baselineMedian?: number;
}

function xmlEscape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

export function svgBadge(b: BadgeInput): string {
  const tokensK = (b.totalTokens / 1000).toFixed(1);
  let line2: string;
  if (b.variant === 'percentile' && b.baselineMedian) {
    const pct = Math.round((b.totalTokens / b.baselineMedian) * 100);
    line2 = `${pct}% of community median`;
  } else if (b.variant === 'compare' && b.baselineMedian) {
    const diff = b.baselineMedian - b.totalTokens;
    line2 = diff >= 0
      ? `${(diff / 1000).toFixed(1)}K cheaper than median`
      : `${(-diff / 1000).toFixed(1)}K above median`;
  } else {
    line2 = `${b.modelLabel} ~$${b.usd.toFixed(3)}/turn`;
  }
  const safeLine2 = xmlEscape(line2);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="80" role="img" aria-label="MCP setup ${tokensK}K tokens per turn">
  <rect width="420" height="80" rx="10" fill="#14161b"/>
  <text x="20" y="34" font-family="ui-sans-serif" font-size="18" fill="#5ee0a3" font-weight="700">My MCP setup: ${tokensK}K tokens/turn</text>
  <text x="20" y="62" font-family="ui-sans-serif" font-size="14" fill="#e6e7eb">${safeLine2}</text>
</svg>`;
}
