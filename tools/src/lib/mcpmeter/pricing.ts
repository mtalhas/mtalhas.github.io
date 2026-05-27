export interface ModelRate { inputPer1M: number; outputPer1M: number; tokenizer: 'openai' | 'anthropic'; }

export function costPerTurn(tokens: number, rate: ModelRate): number {
  return (tokens / 1_000_000) * rate.inputPer1M;
}

export function daysSince(isoDate: string, now: Date = new Date()): number {
  const t = Date.parse(isoDate);
  if (!Number.isFinite(t)) return Infinity;
  return Math.floor((now.getTime() - t) / 86_400_000);
}
