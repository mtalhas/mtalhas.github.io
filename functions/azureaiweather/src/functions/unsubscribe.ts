import { app, HttpRequest, HttpResponseInit } from '@azure/functions';
import { deleteSubscriber } from '../lib/storage.js';
import { sha256 } from '../lib/diff.js';
import type { Channel } from '../shared/types.js';

export async function unsubscribe(req: HttpRequest): Promise<HttpResponseInit> {
  let body: { channel: Channel; endpoint: string };
  try { body = await req.json() as any; }
  catch { return { status: 400, jsonBody: { error: 'invalid JSON' } }; }
  if (!body?.channel || !body?.endpoint) {
    return { status: 400, jsonBody: { error: 'channel and endpoint required' } };
  }
  await deleteSubscriber(body.channel, sha256(body.endpoint));
  return { status: 200, jsonBody: { ok: true } };
}

app.http('unsubscribe', { methods: ['POST'], authLevel: 'anonymous', handler: unsubscribe });
