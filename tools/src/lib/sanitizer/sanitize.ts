import { RULES, type Rule } from './rules';
import { runWithBudget } from './timeout';

export interface CustomRule { id: string; label: string; pattern: string; flags?: string; }
export interface SanitizeOptions {
  enabledIds?: Set<string>;
  customRegexes?: CustomRule[];
  denylist?: string[];
}
export interface SanitizeResult {
  output: string;
  counts: Record<string, number>;
  warnings: string[];
}

const PER_RULE_BUDGET_MS = 50;
const MAX_INPUT_BYTES = 5_000_000;

function escapeForRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function sanitize(input: string, opts: SanitizeOptions = {}): SanitizeResult {
  const warnings: string[] = [];
  if (input.length > MAX_INPUT_BYTES) {
    warnings.push(`input truncated to ${MAX_INPUT_BYTES} chars`);
    input = input.slice(0, MAX_INPUT_BYTES);
  }
  const counts: Record<string, number> = {};
  let out = input;

  const enabled = opts.enabledIds ?? new Set(RULES.filter(r => r.enabledByDefault).map(r => r.id));
  const activeRules: Rule[] = RULES.filter(r => enabled.has(r.id));

  for (const rule of activeRules) {
    // Reset lastIndex; defensive (g-flag regex objects carry state).
    rule.pattern.lastIndex = 0;
    out = runWithBudget(() => {
      let n = 0;
      const replaced = out.replace(rule.pattern, (m) => { n++; return rule.redact(m); });
      counts[rule.id] = (counts[rule.id] ?? 0) + n;
      return replaced;
    }, PER_RULE_BUDGET_MS, out);
  }

  for (const cr of opts.customRegexes ?? []) {
    try {
      const re = new RegExp(cr.pattern, cr.flags ?? 'g');
      out = runWithBudget(() => {
        let n = 0;
        const r = out.replace(re, (m) => { n++; return `[REDACTED:${cr.id}:${m.length}]`; });
        counts[`custom:${cr.id}`] = (counts[`custom:${cr.id}`] ?? 0) + n;
        return r;
      }, PER_RULE_BUDGET_MS, out);
    } catch (e) {
      warnings.push(`custom rule ${cr.id} invalid: ${(e as Error).message}`);
    }
  }

  for (const term of opts.denylist ?? []) {
    if (!term) continue;
    const re = new RegExp(`\\b${escapeForRegex(term)}\\b`, 'gi');
    out = out.replace(re, (m) => `[REDACTED:denylist:${m.length}]`);
  }

  // Adversarial: secrets split across newlines/whitespace are surfaced as a warning,
  // not auto-redacted, because aggressive whitespace stripping risks destroying legitimate content.
  const collapsed = input.replace(/\s+/g, '');
  for (const rule of activeRules) {
    rule.pattern.lastIndex = 0;
    const collapsedHit = rule.pattern.test(collapsed);
    rule.pattern.lastIndex = 0;
    const originalHit = rule.pattern.test(input);
    if (collapsedHit && !originalHit) {
      warnings.push(`possible split-line ${rule.id} secret detected`);
    }
  }

  return { output: out, counts, warnings };
}
