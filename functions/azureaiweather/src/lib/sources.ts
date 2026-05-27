import { XMLParser } from 'fast-xml-parser';
import * as cheerio from 'cheerio';
import type { ChangeItem, SourceId } from '../shared/types.js';

const UA = 'mtalhas-azureaiweather/0.1 (+https://mtalhas.github.io/tools/azureaiweather/)';
const TIMEOUT_MS = 15_000;

async function fetchText(url: string, accept: string): Promise<string> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { headers: { 'user-agent': UA, accept }, signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
    return await res.text();
  } finally { clearTimeout(t); }
}

function rssToItems(xml: string, sourceId: SourceId): ChangeItem[] {
  const p = new XMLParser({ ignoreAttributes: false });
  const doc = p.parse(xml);
  const items = doc?.rss?.channel?.item ?? doc?.feed?.entry ?? [];
  const arr = Array.isArray(items) ? items : [items];
  return arr.filter(Boolean).map((it: any) => {
    const linkVal = typeof it.link === 'string' ? it.link : (it.link?.['@_href'] ?? it.link?.href ?? undefined);
    const titleVal = typeof it.title === 'string' ? it.title : (it.title?.['#text'] ?? String(it.title ?? ''));
    const guidVal = typeof it.guid === 'string' ? it.guid : (it.guid?.['#text'] ?? it.id ?? linkVal ?? titleVal);
    const bodyVal = typeof it.description === 'string'
      ? it.description
      : (typeof it.summary === 'string' ? it.summary : (it['content:encoded'] ?? it.content ?? ''));
    return {
      id: `${sourceId}:${String(guidVal)}`,
      title: titleVal,
      url: typeof linkVal === 'string' ? linkVal : undefined,
      publishedAt: it.pubDate ?? it.updated ?? undefined,
      body: typeof bodyVal === 'string' ? bodyVal : JSON.stringify(bodyVal)
    };
  });
}

export async function fetchAzureUpdatesRss(): Promise<ChangeItem[]> {
  const xml = await fetchText('https://www.microsoft.com/releasecommunications/api/v2/azure/rss', 'application/rss+xml');
  return rssToItems(xml, 'azure-updates-rss');
}

export async function fetchAzureStatusRss(): Promise<ChangeItem[]> {
  const xml = await fetchText('https://azurestatuscdn.azureedge.net/en-us/status/feed/', 'application/rss+xml');
  return rssToItems(xml, 'azure-status-rss');
}

export async function fetchAzureOpenAiRegionPage(): Promise<ChangeItem[]> {
  const html = await fetchText('https://learn.microsoft.com/azure/ai-services/openai/concepts/models', 'text/html');
  const $ = cheerio.load(html);
  return $('table tr').toArray().slice(0, 200).map((tr, i) => ({
    id: `azure-openai-region-availability:row-${i}`,
    title: $(tr).find('td').first().text().trim() || `row ${i}`,
    body: $(tr).text().trim()
  })).filter(item => item.body.length > 0);
}

export async function fetchFoundryModelCards(): Promise<ChangeItem[]> {
  // NOTE: ai.azure.com is a client-rendered SPA. cheerio sees the shell only.
  // This source returns 'low' confidence until the operator swaps to the documented
  // REST /models endpoint with a managed identity bearer token (see DEPLOY.md).
  try {
    const html = await fetchText('https://ai.azure.com/explore/models', 'text/html');
    const $ = cheerio.load(html);
    return $('[data-model-card], article, .model-card').toArray().slice(0, 200).map((el, i) => ({
      id: `foundry-model-cards:${i}`,
      title: $(el).find('h1, h2, h3, [data-name]').first().text().trim() || `model ${i}`,
      body: $(el).text().trim().slice(0, 2000)
    })).filter(item => item.body.length > 50);
  } catch { return []; }
}

export async function fetchArmModelCapacities(): Promise<ChangeItem[]> {
  // ARM modelCapacities requires AAD bearer (managed identity in production).
  // For local dev the call will 401 and we return []. The Bicep template gives
  // the Function App a system-assigned identity; the operator must add the
  // 'Cognitive Services Usages Reader' RBAC role on the subscription.
  try {
    const res = await fetch(
      'https://management.azure.com/providers/Microsoft.CognitiveServices/modelCapacities?api-version=2024-04-01-preview',
      { headers: { 'user-agent': UA, accept: 'application/json' } }
    );
    if (!res.ok) return [];
    const data = await res.json() as any;
    const items = Array.isArray(data?.value) ? data.value : [];
    return items.slice(0, 500).map((m: any, i: number) => ({
      id: `arm-model-capacities:${m?.id ?? i}`,
      title: m?.name ?? `capacity ${i}`,
      body: JSON.stringify(m).slice(0, 2000)
    }));
  } catch { return []; }
}

export const FETCHERS: Record<SourceId, () => Promise<ChangeItem[]>> = {
  'azure-updates-rss': fetchAzureUpdatesRss,
  'azure-status-rss': fetchAzureStatusRss,
  'azure-openai-region-availability': fetchAzureOpenAiRegionPage,
  'foundry-model-cards': fetchFoundryModelCards,
  'arm-model-capacities': fetchArmModelCapacities
};

export const CONFIDENCE: Record<SourceId, 'high' | 'medium' | 'low'> = {
  'azure-updates-rss': 'high',
  'azure-status-rss': 'high',
  'azure-openai-region-availability': 'medium',
  'foundry-model-cards': 'low',
  'arm-model-capacities': 'medium'
};
