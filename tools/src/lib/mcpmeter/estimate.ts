import type { ParsedConfig, ParsedServer } from './parseConfig';
import knownServers from '../../data/known-servers.json';

const SYSTEM_OVERHEAD_PER_TOOL_CHARS = 180;
const FALLBACK_CHARS_PER_TOKEN = 4;

export type Confidence = 'high' | 'medium' | 'low';

export interface EstimateRow {
  server: string;
  toolCount: number;
  openaiTokens: number;
  anthropicTokens: number;
  confidence: Confidence;
  source: 'known-server' | 'tool-list' | 'rawSize-fallback';
}
export interface EstimateResult {
  perServer: EstimateRow[];
  totals: { openai: number; anthropic: number };
}
export interface EstimateOpts {
  tokenizers?: Array<'openai' | 'anthropic'>;
}

async function getOpenAiTokenizer(): Promise<(t: string) => number> {
  const mod: any = await import('gpt-tokenizer');
  return (text: string) => mod.encode(text).length;
}
async function getAnthropicTokenizer(): Promise<(t: string) => number> {
  const mod: any = await import('@anthropic-ai/tokenizer');
  const tok = mod.getTokenizer();
  return (text: string) => tok.encode(text, 'all').length;
}

function fallbackCount(text: string): number {
  return Math.max(1, Math.ceil(text.length / FALLBACK_CHARS_PER_TOKEN));
}

function rawTextFor(s: ParsedServer): string {
  if (s.tools && s.tools.length) {
    return s.tools.map(t => `${t.name}\n${t.description ?? ''}\n${t.schema ?? ''}`).join('\n');
  }
  return `${s.name}\n(no tool list available, raw config size ${s.rawSize} bytes)`;
}

export async function estimateTokens(cfg: ParsedConfig, opts: EstimateOpts = {}): Promise<EstimateResult> {
  const wants = opts.tokenizers ?? ['openai', 'anthropic'];
  let openai: ((t: string) => number) | null = null;
  let anthropic: ((t: string) => number) | null = null;
  try { if (wants.includes('openai')) openai = await getOpenAiTokenizer(); } catch { openai = null; }
  try { if (wants.includes('anthropic')) anthropic = await getAnthropicTokenizer(); } catch { anthropic = null; }
  const oa = (t: string) => openai ? openai(t) : fallbackCount(t);
  const an = (t: string) => anthropic ? anthropic(t) : fallbackCount(t);

  const known = (knownServers as any).servers as Record<string, { toolCount: number; approxTokens: number; confidence: Confidence }>;

  const perServer: EstimateRow[] = cfg.servers.map(s => {
    if (s.pkg && known[s.pkg]) {
      const k = known[s.pkg];
      return {
        server: s.name,
        toolCount: k.toolCount,
        openaiTokens: k.approxTokens,
        anthropicTokens: k.approxTokens,
        confidence: k.confidence,
        source: 'known-server' as const
      };
    }
    if (s.tools && s.tools.length) {
      const text = rawTextFor(s);
      const overhead = SYSTEM_OVERHEAD_PER_TOOL_CHARS * s.tools.length;
      const fullText = text + ' '.repeat(Math.min(overhead, 4000));
      return {
        server: s.name,
        toolCount: s.tools.length,
        openaiTokens: oa(fullText),
        anthropicTokens: an(fullText),
        confidence: 'medium',
        source: 'tool-list'
      };
    }
    // Fallback: we only know the spawn command. This is a known under-estimate.
    const text = rawTextFor(s);
    return {
      server: s.name,
      toolCount: 0,
      openaiTokens: oa(text),
      anthropicTokens: an(text),
      confidence: 'low',
      source: 'rawSize-fallback'
    };
  });

  const totals = perServer.reduce((acc, r) => ({
    openai: acc.openai + r.openaiTokens,
    anthropic: acc.anthropic + r.anthropicTokens
  }), { openai: 0, anthropic: 0 });

  return { perServer, totals };
}
