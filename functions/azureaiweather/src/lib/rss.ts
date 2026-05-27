import type { ChangeItem } from '../shared/types.js';

function xmlEscape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

export interface RssOpts { title: string; link: string; description: string; }

export function buildRss(items: ChangeItem[], opts: RssOpts): string {
  const now = new Date().toUTCString();
  const entries = items.slice(0, 100).map(i => `
    <item>
      <title>${xmlEscape(i.title)}</title>
      ${i.url ? `<link>${xmlEscape(i.url)}</link>` : ''}
      <guid isPermaLink="false">${xmlEscape(i.id)}</guid>
      ${i.publishedAt ? `<pubDate>${xmlEscape(i.publishedAt)}</pubDate>` : ''}
      <description>${xmlEscape(i.body.slice(0, 4000))}</description>
    </item>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <title>${xmlEscape(opts.title)}</title>
  <link>${xmlEscape(opts.link)}</link>
  <description>${xmlEscape(opts.description)}</description>
  <lastBuildDate>${now}</lastBuildDate>${entries}
</channel></rss>`;
}
