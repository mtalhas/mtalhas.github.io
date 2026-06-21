import { parseConfig } from '../lib/mcpmeter/parseConfig';
import { estimateTokens, type Confidence } from '../lib/mcpmeter/estimate';
import { costPerTurn, daysSince } from '../lib/mcpmeter/pricing';
import { svgBadge } from '../lib/mcpmeter/badge';
import { encodePermalink, decodePermalink } from '../lib/mcpmeter/permalink';
import pricing from '../data/pricing.json';
import baseline from '../data/community-baseline.json';

const DEFAULT_MODEL = 'anthropic:claude-sonnet-4-6';
const STALE_DAYS = 60;

function renderSvg(host: HTMLElement, svg: string) {
  host.replaceChildren();
  const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
  const el = doc.documentElement;
  if (el && el.nodeName.toLowerCase() === 'svg') host.appendChild(el);
}

function confidenceChip(c: Confidence): HTMLSpanElement {
  const span = document.createElement('span');
  span.textContent = c;
  span.title = c === 'high' ? 'Measured from a real server.' : c === 'medium' ? 'Tokenized from declared tool list.' : 'Spawn command only. Likely under-estimate.';
  span.style.cssText = 'padding:0.1rem 0.4rem;border-radius:6px;font-size:0.75rem;background:' + (c === 'high' ? '#173a26' : c === 'medium' ? '#3a2f17' : '#3a1717') + ';color:#e6e7eb;';
  return span;
}

export function mount(root: HTMLElement) {
  const $ = <T extends Element>(sel: string) => root.querySelector(sel) as T;
  const input = $<HTMLTextAreaElement>('textarea[data-test=config]');
  const runBtn = $<HTMLButtonElement>('button[data-test=run]');
  const tableBody = $<HTMLTableSectionElement>('tbody[data-test=tbody]');
  const totalCell = $<HTMLElement>('[data-test=total-tokens]');
  const totalUsdCell = $<HTMLElement>('[data-test=total-usd]');
  const permaInput = $<HTMLInputElement>('input[data-test=permalink]');
  const badgeBox = $<HTMLElement>('[data-test=badge]');
  const variantSel = $<HTMLSelectElement>('select[data-test=variant]');
  const stalenessBanner = $<HTMLElement>('[data-test=stale-banner]');

  if (!input || !runBtn || !tableBody) return;

  // Staleness banner
  const days = daysSince((pricing as any).updated);
  if (Number.isFinite(days) && days > STALE_DAYS && stalenessBanner) {
    stalenessBanner.textContent = `Pricing snapshot is ${days} days old. Treat costs as approximate.`;
    stalenessBanner.style.display = 'block';
  }

  // Permalink rehydration
  if (location.hash.length > 1) {
    try {
      const data = decodePermalink(location.hash.slice(1));
      totalCell.textContent = String(data.totalTokens);
      totalUsdCell.textContent = `$${data.usd.toFixed(4)}`;
      const svg = svgBadge({ totalTokens: data.totalTokens, modelLabel: data.model, usd: data.usd, variant: 'numeric' });
      renderSvg(badgeBox, svg);
    } catch { /* ignore malformed hash */ }
  }

  function renderRows(rows: Array<{ server: string; toolCount: number; tokens: number; usd: number; confidence: Confidence }>) {
    tableBody.replaceChildren();
    for (const r of rows) {
      const tr = document.createElement('tr');
      tr.setAttribute('data-test', 'row');
      const cells = [r.server, String(r.toolCount), String(r.tokens), `$${r.usd.toFixed(4)}`];
      for (const cellText of cells) {
        const td = document.createElement('td');
        td.textContent = cellText;
        tr.appendChild(td);
      }
      const confTd = document.createElement('td');
      confTd.appendChild(confidenceChip(r.confidence));
      tr.appendChild(confTd);
      tableBody.appendChild(tr);
    }
  }

  function renderErrorRow(message: string) {
    tableBody.replaceChildren();
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 5;
    td.setAttribute('role', 'alert');
    td.textContent = message;
    tr.appendChild(td);
    tableBody.appendChild(tr);
  }

  runBtn.addEventListener('click', async () => {
    runBtn.disabled = true;
    const originalLabel = runBtn.textContent ?? 'Estimate';
    runBtn.textContent = 'Computing...';
    try {
      const parsed = parseConfig(input.value);
      const est = await estimateTokens(parsed);
      const rate = (pricing as any).models[DEFAULT_MODEL];

      renderRows(est.perServer.map(r => ({
        server: r.server,
        toolCount: r.toolCount,
        tokens: r.anthropicTokens,
        usd: costPerTurn(r.anthropicTokens, rate),
        confidence: r.confidence
      })));

      const total = est.totals.anthropic;
      totalCell.textContent = String(total);
      const totalUsd = costPerTurn(total, rate);
      totalUsdCell.textContent = `$${totalUsd.toFixed(4)}`;

      const variant = (variantSel.value as 'numeric' | 'percentile' | 'compare') || 'numeric';
      const svg = svgBadge({
        totalTokens: total,
        modelLabel: 'Claude Sonnet',
        usd: totalUsd,
        variant,
        baselineMedian: (baseline as any).median
      });
      renderSvg(badgeBox, svg);

      const hash = encodePermalink({ totalTokens: total, model: DEFAULT_MODEL, usd: totalUsd });
      permaInput.value = `${location.origin}${location.pathname}#${hash}`;
    } catch (e) {
      renderErrorRow((e as Error).message);
    } finally {
      runBtn.disabled = false;
      runBtn.textContent = originalLabel;
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[data-island=mcpmeter]') as HTMLElement | null;
  if (root) mount(root);
});
