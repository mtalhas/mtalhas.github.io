import { app, HttpResponseInit } from '@azure/functions';
import { ensureTables, listAllLatestSnapshots } from '../lib/storage.js';
import { buildRss } from '../lib/rss.js';
import type { SourceId, ChangeItem } from '../shared/types.js';

const SOURCES: SourceId[] = [
  'azure-updates-rss',
  'azure-status-rss',
  'azure-openai-region-availability',
  'foundry-model-cards',
  'arm-model-capacities'
];

export async function feedRss(): Promise<HttpResponseInit> {
  await ensureTables();
  const snapshots = await listAllLatestSnapshots(SOURCES);
  const items: ChangeItem[] = [];
  for (const snap of snapshots) {
    const snapItems = typeof snap.items === 'string'
      ? (JSON.parse(snap.items as unknown as string) as ChangeItem[])
      : snap.items;
    items.push(...snapItems.slice(0, 20));
  }
  const xml = buildRss(items, {
    title: 'Azure AI Weather',
    link: 'https://mtalhas.github.io/tools/azureaiweather/',
    description: 'Verbatim changes to Azure AI services. Updated every six hours.'
  });
  return {
    status: 200,
    headers: { 'content-type': 'application/rss+xml; charset=utf-8' },
    body: xml
  };
}

app.http('feedRss', {
  route: 'feed.rss',
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: feedRss
});
