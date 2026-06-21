// Observational budget guard for regex passes.
// JavaScript regex cannot be hard-cancelled inside a sync .exec/.replace call,
// so this only logs over-budget rules and returns a safe fallback on throw.
// Mitigation in practice: every rule pattern in rules.ts is linear in input length.
export function runWithBudget<T>(fn: () => T, budgetMs: number, fallback: T): T {
  const start = (typeof performance !== 'undefined' ? performance : Date).now();
  try {
    const result = fn();
    const dt = (typeof performance !== 'undefined' ? performance : Date).now() - start;
    if (dt > budgetMs) {
      // eslint-disable-next-line no-console
      console.warn(`sanitizer rule exceeded ${budgetMs}ms budget: ${dt.toFixed(1)}ms`);
    }
    return result;
  } catch {
    return fallback;
  }
}
