// Simple in-memory token bucket per IP. Lives for the lifetime of the Function instance.
// Acceptable for Consumption plan: cold-start resets the bucket, which is conservative.
// For stronger guarantees, switch to a Storage Table or Redis backed limiter.

const buckets = new Map<string, { remaining: number; resetAt: number }>();

const HOUR_MS = 60 * 60 * 1000;

export function consume(ip: string, capacityPerHour: number): { ok: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  let b = buckets.get(ip);
  if (!b || b.resetAt < now) {
    b = { remaining: capacityPerHour, resetAt: now + HOUR_MS };
    buckets.set(ip, b);
  }
  if (b.remaining <= 0) return { ok: false, remaining: 0, resetAt: b.resetAt };
  b.remaining -= 1;
  return { ok: true, remaining: b.remaining, resetAt: b.resetAt };
}

export function clientIp(req: { headers: Record<string, string> | { get(name: string): string | null } }): string {
  const h = req.headers as any;
  const get = (k: string) => typeof h.get === 'function' ? h.get(k) : h[k.toLowerCase()];
  const xff = get('x-forwarded-for');
  if (xff && typeof xff === 'string') return xff.split(',')[0].trim();
  return get('x-client-ip') || 'unknown';
}
