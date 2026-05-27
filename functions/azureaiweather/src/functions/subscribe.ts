import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { validateSlackWebhook } from '../lib/slackUrl.js';
import { validateWebPushEndpoint } from '../lib/webpushUrl.js';
import { upsertSubscriber } from '../lib/storage.js';
import { sha256 } from '../lib/diff.js';
import { clientIp, consume } from '../lib/rateLimit.js';
import type { Channel } from '../shared/types.js';

interface SubscribeBody {
  channel: Channel;
  endpoint: string;
  p256dh?: string;
  auth?: string;
}

const DEFAULT_RATE_PER_HOUR = 5;

export async function subscribe(req: HttpRequest, _ctx: InvocationContext): Promise<HttpResponseInit> {
  const cap = Number(process.env.SUBSCRIBE_RATE_LIMIT_PER_IP_PER_HOUR ?? DEFAULT_RATE_PER_HOUR);
  const rl = consume(clientIp(req as any), cap);
  if (!rl.ok) {
    return { status: 429, headers: { 'retry-after': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) }, jsonBody: { error: 'rate limit exceeded' } };
  }

  let body: SubscribeBody;
  try { body = await req.json() as SubscribeBody; }
  catch { return { status: 400, jsonBody: { error: 'invalid JSON' } }; }

  if (!body?.channel || !body?.endpoint) {
    return { status: 400, jsonBody: { error: 'channel and endpoint required' } };
  }

  if (body.channel === 'slack') {
    const v = validateSlackWebhook(body.endpoint);
    if (!v.ok) return { status: 400, jsonBody: { error: `slack URL invalid: ${v.reason}` } };
  } else if (body.channel === 'webpush') {
    const v = validateWebPushEndpoint(body.endpoint);
    if (!v.ok) return { status: 400, jsonBody: { error: `webpush endpoint invalid: ${v.reason}` } };
    if (!body.p256dh || !body.auth) {
      return { status: 400, jsonBody: { error: 'p256dh and auth required for webpush' } };
    }
  } else if (body.channel === 'rss') {
    // RSS subscribers do not need persistence; the feed is public.
    return { status: 200, jsonBody: { ok: true, note: 'RSS feed is public; no subscription record needed' } };
  } else {
    return { status: 400, jsonBody: { error: 'unsupported channel' } };
  }

  await upsertSubscriber({
    partitionKey: body.channel,
    rowKey: sha256(body.endpoint),
    endpoint: body.endpoint,
    p256dh: body.p256dh,
    auth: body.auth,
    createdAt: new Date().toISOString()
  });

  return { status: 200, jsonBody: { ok: true } };
}

app.http('subscribe', { methods: ['POST'], authLevel: 'anonymous', handler: subscribe });
