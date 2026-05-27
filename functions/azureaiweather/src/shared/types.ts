export type Channel = 'slack' | 'webpush' | 'rss';

export type SourceId =
  | 'azure-updates-rss'
  | 'azure-status-rss'
  | 'azure-openai-region-availability'
  | 'foundry-model-cards'
  | 'arm-model-capacities';

export interface Subscriber {
  partitionKey: Channel;
  rowKey: string;        // sha256 of endpoint
  endpoint: string;
  p256dh?: string;
  auth?: string;
  createdAt: string;
}

export interface ChangeItem {
  id: string;
  title: string;
  url?: string;
  publishedAt?: string;
  body: string;
}

export interface Snapshot {
  partitionKey: SourceId;
  rowKey: string;        // ISO 8601 timestamp
  sha256: string;
  body: string;          // serialized items JSON
  items: ChangeItem[];
  confidence: 'high' | 'medium' | 'low';
}

export interface DiffResult {
  added: ChangeItem[];
  removed: ChangeItem[];
}
