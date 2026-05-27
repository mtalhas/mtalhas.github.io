import { TableClient } from '@azure/data-tables';
import type { Subscriber, Snapshot, SourceId, Channel } from '../shared/types.js';

const conn = () => process.env.TABLES_CONNECTION ?? 'UseDevelopmentStorage=true';

function clientFor(table: 'subscribers' | 'snapshots'): TableClient {
  return TableClient.fromConnectionString(conn(), table, { allowInsecureConnection: true });
}

export async function ensureTables(): Promise<void> {
  for (const t of ['subscribers', 'snapshots'] as const) {
    const c = clientFor(t);
    try { await c.createTable(); } catch (e: any) { if (e?.statusCode !== 409) throw e; }
  }
}

export async function upsertSubscriber(s: Subscriber): Promise<void> {
  await clientFor('subscribers').upsertEntity({
    partitionKey: s.partitionKey,
    rowKey: s.rowKey,
    endpoint: s.endpoint,
    p256dh: s.p256dh,
    auth: s.auth,
    createdAt: s.createdAt
  });
}

export async function deleteSubscriber(pk: Channel, rk: string): Promise<void> {
  try { await clientFor('subscribers').deleteEntity(pk, rk); }
  catch (e: any) { if (e?.statusCode !== 404) throw e; }
}

export async function listSubscribers(channel: Channel): Promise<Subscriber[]> {
  const out: Subscriber[] = [];
  const iter = clientFor('subscribers').listEntities<Subscriber>({
    queryOptions: { filter: `PartitionKey eq '${channel}'` }
  });
  for await (const e of iter) out.push(e);
  return out;
}

export async function getLatestSnapshot(src: SourceId): Promise<Snapshot | null> {
  const c = clientFor('snapshots');
  // RowKey is ISO timestamp; storage orders by RowKey ascending; we want descending.
  // We list and keep the lexicographically max RowKey (which is the latest ISO timestamp).
  let latest: Snapshot | null = null;
  for await (const e of c.listEntities<Snapshot>({ queryOptions: { filter: `PartitionKey eq '${src}'` } })) {
    if (!latest || e.rowKey > latest.rowKey) latest = e;
  }
  return latest;
}

export async function saveSnapshot(s: Snapshot): Promise<void> {
  await clientFor('snapshots').upsertEntity({
    partitionKey: s.partitionKey,
    rowKey: s.rowKey,
    sha256: s.sha256,
    body: s.body,
    items: JSON.stringify(s.items),
    confidence: s.confidence
  });
}

export async function listAllLatestSnapshots(sources: SourceId[]): Promise<Snapshot[]> {
  const out: Snapshot[] = [];
  for (const src of sources) {
    const s = await getLatestSnapshot(src);
    if (s) out.push(s);
  }
  return out;
}
