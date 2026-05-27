#!/usr/bin/env node
// MCP Health daily ingest.
// Reads Smithery.ai server list (with fallback to scripts/mcp-health/known-repos.json),
// fetches GitHub signals per repo, computes deterministic health score,
// writes tools/src/data/mcp-health.json IF the rows changed.
//
// Run locally:  node scripts/mcp-health/ingest.mjs
// In CI:        .github/workflows/mcp-health-ingest.yml

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..');
const OUT_PATH = resolve(REPO_ROOT, 'tools/src/data/mcp-health.json');
const KNOWN_REPOS = resolve(__dirname, 'known-repos.json');

const SMITHERY = 'https://smithery.ai/api/servers';
const GITHUB_API = 'https://api.github.com';
const UA = 'mtalhas-mcp-health-ingest/0.1 (+https://mtalhas.github.io)';

function authHeaders(extra = {}) {
  return {
    'user-agent': UA,
    accept: 'application/vnd.github+json',
    ...(process.env.GITHUB_TOKEN ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
    ...extra
  };
}

async function getJson(url) {
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status} on ${url}`);
  return res.json();
}

function daysSince(iso) {
  if (!iso) return 9999;
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return 9999;
  return Math.floor((Date.now() - t) / 86_400_000);
}

function clamp01(x) { return Math.max(0, Math.min(1, x)); }
function commitRecency(d) { return clamp01(Math.exp(-d / 90)); }
function issueRatio(o, c) { return o + c === 0 ? 0.5 : clamp01(c / (o + c)); }
function starsGrowth(delta, total) { if (total <= 0) return 0; return clamp01((delta / Math.max(total, 1)) * 12); }
function releaseRecency(d) { return d === null ? 0.3 : clamp01(Math.exp(-d / 180)); }
function compose(s) {
  return 0.4 * commitRecency(s.daysSinceLastCommit)
       + 0.3 * issueRatio(s.openIssues, s.closedIssues)
       + 0.2 * starsGrowth(s.starsDelta30d, s.stars)
       + 0.1 * releaseRecency(s.daysSinceLastRelease);
}

async function fetchServers() {
  try {
    const data = await getJson(SMITHERY);
    const list = Array.isArray(data?.servers) ? data.servers : Array.isArray(data) ? data : [];
    if (list.length > 0) return { source: 'smithery', list };
    throw new Error('empty smithery response');
  } catch (e) {
    console.warn(`smithery unavailable: ${e.message}. falling back to known-repos.json`);
    const fallback = JSON.parse(readFileSync(KNOWN_REPOS, 'utf-8'));
    return { source: 'fallback', list: fallback.repos };
  }
}

async function fetchRepoSignals(slug) {
  const [repo, issues, releases] = await Promise.all([
    getJson(`${GITHUB_API}/repos/${slug}`),
    getJson(`${GITHUB_API}/search/issues?q=${encodeURIComponent(`repo:${slug} state:closed is:issue`)}`),
    getJson(`${GITHUB_API}/repos/${slug}/releases?per_page=1`)
  ]);
  const closed = issues?.total_count ?? 0;
  const lastRelease = releases?.[0]?.published_at ?? null;
  return {
    daysSinceLastCommit: daysSince(repo?.pushed_at),
    openIssues: repo?.open_issues_count ?? 0,
    closedIssues: closed,
    stars: repo?.stargazers_count ?? 0,
    starsDelta30d: 0,
    daysSinceLastRelease: lastRelease ? daysSince(lastRelease) : null,
    lastCommitDate: repo?.pushed_at ?? null,
    lastReleaseDate: lastRelease
  };
}

function rowsEqual(prev, next) {
  // Compare on the meaningful fields only (ignore updatedAt).
  if (!Array.isArray(prev) || !Array.isArray(next)) return false;
  if (prev.length !== next.length) return false;
  const norm = (r) => ({ name: r.name, repo: r.repo, lastCommit: r.lastCommit, openIssues: r.openIssues, closedIssues: r.closedIssues, stars: r.stars, lastRelease: r.lastRelease, composite: r.composite, confidence: r.confidence });
  const sortKey = (r) => `${r.name}|${r.repo}`;
  const a = [...prev].sort((x, y) => sortKey(x).localeCompare(sortKey(y))).map(norm);
  const b = [...next].sort((x, y) => sortKey(x).localeCompare(sortKey(y))).map(norm);
  return JSON.stringify(a) === JSON.stringify(b);
}

async function main() {
  const { source: registrySource, list } = await fetchServers();
  const rows = [];
  for (const s of list.slice(0, 100)) {
    const slug = (s.repo ?? s.githubUrl ?? '').replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '');
    if (!slug || !slug.includes('/')) {
      rows.push({ name: s.name ?? 'unknown', repo: '', composite: 0, confidence: 'low', _why: 'no github slug' });
      continue;
    }
    try {
      const sig = await fetchRepoSignals(slug);
      const composite = Number(compose(sig).toFixed(3));
      rows.push({
        name: s.name ?? slug,
        repo: slug,
        lastCommit: sig.lastCommitDate ? sig.lastCommitDate.slice(0, 10) : null,
        openIssues: sig.openIssues,
        closedIssues: sig.closedIssues,
        stars: sig.stars,
        starsDelta30d: 0,
        lastRelease: sig.lastReleaseDate ? sig.lastReleaseDate.slice(0, 10) : null,
        composite,
        confidence: registrySource === 'smithery' ? 'medium' : 'high'
      });
    } catch (e) {
      rows.push({ name: s.name ?? slug, repo: slug, composite: 0, confidence: 'low', _why: String(e?.message ?? e) });
    }
  }

  const next = {
    updatedAt: new Date().toISOString(),
    registrySource,
    note: `Generated by .github/workflows/mcp-health-ingest.yml. Registry source: ${registrySource}.`,
    rows
  };

  // Skip write if rows are semantically unchanged from on-disk.
  if (existsSync(OUT_PATH)) {
    try {
      const prev = JSON.parse(readFileSync(OUT_PATH, 'utf-8'));
      if (rowsEqual(prev.rows, rows)) {
        console.log(`no row changes; skipping write to ${OUT_PATH}`);
        return;
      }
    } catch { /* fall through and write */ }
  }

  writeFileSync(OUT_PATH, JSON.stringify(next, null, 2));
  console.log(`wrote ${rows.length} rows to ${OUT_PATH} (registrySource=${registrySource})`);
}

main().catch(e => { console.error(e); process.exit(1); });
