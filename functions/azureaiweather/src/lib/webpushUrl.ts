// Defense in depth against SSRF on the /subscribe webpush channel.
// Mirrors the discipline of slackUrl.ts: only known push services, no userinfo,
// no non-default port, no private/loopback hosts.

export interface WebPushUrlValidation { ok: boolean; reason?: string }

const ALLOWED_HOSTS_EXACT = new Set<string>([
  'fcm.googleapis.com',                   // Chrome, Edge (current)
  'updates.push.services.mozilla.com',    // Firefox
  'web.push.apple.com'                    // Safari
]);

// Edge legacy WNS uses wns2-<region>.notify.windows.com (region is alphanumeric).
const WNS_RE = /^wns2-[a-z0-9-]+\.notify\.windows\.com$/i;

// RFC1918 + loopback + link-local IPv4 patterns. We never want a Web Push
// payload to be POSTed to an internal address.
const PRIVATE_IPV4 = /^(10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/;

// IPv6 unique-local (fc00::/7) and link-local (fe80::/10) prefixes. Only apply
// to hosts that actually look like IPv6 addresses (contain a colon); otherwise
// 'fcm.googleapis.com' would be falsely flagged.
const PRIVATE_IPV6 = /^(::1|fc[0-9a-f]{0,2}:|fd[0-9a-f]{0,2}:|fe80:)/i;

function looksLikePrivateOrLoopback(host: string): boolean {
  if (host === 'localhost') return true;
  if (PRIVATE_IPV4.test(host)) return true;
  if (host.includes(':') && PRIVATE_IPV6.test(host)) return true;
  return false;
}

export function validateWebPushEndpoint(input: string): WebPushUrlValidation {
  let u: URL;
  try { u = new URL(input); } catch { return { ok: false, reason: 'not a URL' }; }
  if (u.protocol !== 'https:') return { ok: false, reason: 'must be https' };
  if (u.username || u.password) return { ok: false, reason: 'credentials forbidden' };
  if (u.port && u.port !== '443') return { ok: false, reason: 'non-default port forbidden' };
  const host = u.hostname.toLowerCase();
  if (looksLikePrivateOrLoopback(host)) return { ok: false, reason: 'private/loopback host forbidden' };
  if (!ALLOWED_HOSTS_EXACT.has(host) && !WNS_RE.test(host)) {
    return { ok: false, reason: `host not in push-service allowlist: ${host}` };
  }
  return { ok: true };
}
