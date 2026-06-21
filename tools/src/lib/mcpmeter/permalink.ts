const MAX_HASH_BYTES = 4096;

function toBase64Url(s: string): string {
  return btoa(unescape(encodeURIComponent(s))).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}
function fromBase64Url(s: string): string {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  return decodeURIComponent(escape(atob(s.replaceAll('-', '+').replaceAll('_', '/') + pad)));
}

export interface BadgePayload {
  totalTokens: number;
  model: string;
  usd: number;
}

function isBadgePayload(x: unknown): x is BadgePayload {
  return !!x && typeof x === 'object'
    && typeof (x as any).totalTokens === 'number' && Number.isFinite((x as any).totalTokens)
    && typeof (x as any).model === 'string' && (x as any).model.length < 128
    && typeof (x as any).usd === 'number' && Number.isFinite((x as any).usd);
}

export function encodePermalink(data: BadgePayload): string {
  const s = JSON.stringify(data);
  if (s.length > MAX_HASH_BYTES) throw new Error('payload too large');
  return toBase64Url(s);
}

export function decodePermalink(hash: string): BadgePayload {
  if (hash.length > MAX_HASH_BYTES * 2) throw new Error('hash too large');
  const json = fromBase64Url(hash);
  const parsed = JSON.parse(json) as unknown;
  if (!isBadgePayload(parsed)) throw new Error('invalid payload shape');
  return parsed;
}
