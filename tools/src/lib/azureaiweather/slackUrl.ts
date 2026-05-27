export interface SlackUrlValidation { ok: boolean; reason?: string; }

const ALLOWED_HOST = 'hooks.slack.com';
const PATH_RE = /^\/services\/T[A-Z0-9]{2,}\/B[A-Z0-9]{2,}\/[A-Za-z0-9]{16,}$/;

export function validateSlackWebhook(input: string): SlackUrlValidation {
  let u: URL;
  try { u = new URL(input); } catch { return { ok: false, reason: 'not a URL' }; }
  if (u.protocol !== 'https:') return { ok: false, reason: 'must be https' };
  if (u.hostname !== ALLOWED_HOST) return { ok: false, reason: `host must be ${ALLOWED_HOST}` };
  if (u.username || u.password) return { ok: false, reason: 'credentials forbidden' };
  if (u.port && u.port !== '443') return { ok: false, reason: 'non-default port forbidden' };
  if (!PATH_RE.test(u.pathname)) return { ok: false, reason: 'webhook path malformed' };
  if (u.search || u.hash) return { ok: false, reason: 'query or fragment forbidden' };
  return { ok: true };
}
