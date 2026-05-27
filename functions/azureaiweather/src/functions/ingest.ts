import { app, InvocationContext, Timer } from '@azure/functions';
import { FETCHERS, CONFIDENCE } from '../lib/sources.js';
import { diffItems, sha256 } from '../lib/diff.js';
import { ensureTables, getLatestSnapshot, saveSnapshot, listSubscribers } from '../lib/storage.js';
import { configure as configureWebPush, sendPush } from '../lib/webpush.js';
import type { SourceId } from '../shared/types.js';

async function postToSlack(url: string, text: string): Promise<void> {
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text })
    });
  } catch { /* swallow; Slack outages should not crash the ingest */ }
}

export async function ingest(_t: Timer, ctx: InvocationContext): Promise<void> {
  await ensureTables();
  configureWebPush();
  const sources = Object.keys(FETCHERS) as SourceId[];
  const slackSubs = await listSubscribers('slack');
  const pushSubs = await listSubscribers('webpush');

  for (const src of sources) {
    try {
      const items = await FETCHERS[src]();
      const body = JSON.stringify(items);
      const hash = sha256(body);
      const prev = await getLatestSnapshot(src);
      if (prev?.sha256 === hash) {
        ctx.log(`no change for ${src}`);
        continue;
      }
      const prevItems = prev?.items ?? [];
      const prevItemsParsed = typeof prevItems === 'string' ? JSON.parse(prevItems as unknown as string) : prevItems;
      const diff = diffItems(prevItemsParsed, items);

      await saveSnapshot({
        partitionKey: src,
        rowKey: new Date().toISOString(),
        sha256: hash,
        body,
        items,
        confidence: CONFIDENCE[src]
      });

      for (const item of diff.added.slice(0, 25)) {
        const text = `*${src}*: ${item.title}${item.url ? `\n${item.url}` : ''}`;
        for (const sub of slackSubs) await postToSlack(sub.endpoint, text);
        for (const sub of pushSubs) {
          try {
            await sendPush(sub.endpoint, sub.p256dh, sub.auth, {
              title: src,
              body: item.title,
              url: item.url
            });
          } catch (e) { ctx.warn(`webpush failed for ${sub.endpoint}`, e); }
        }
      }
    } catch (e) {
      ctx.error(`ingest ${src} failed`, e);
    }
  }
}

app.timer('azureaiweather-ingest', {
  schedule: '0 0 */6 * * *',
  handler: ingest
});
