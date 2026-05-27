export interface Rule {
  id: string;
  label: string;
  pattern: RegExp;
  redact: (match: string) => string;
  enabledByDefault: boolean;
}

const tag = (id: string) => (m: string) => `[REDACTED:${id}:${m.length}]`;

// Patterns curated from public sources (OWASP cheat sheet, gitleaks rules, provider docs).
// Every pattern is linear in input length: no nested quantifiers on the same char class.
export const RULES: Rule[] = [
  { id: 'openai-sk',    label: 'OpenAI sk-',     pattern: /\bsk-[A-Za-z0-9_-]{20,}\b/g,                       redact: tag('openai-sk'),    enabledByDefault: true },
  { id: 'stripe-pk',    label: 'Stripe pk_',     pattern: /\bpk_(?:test_|live_)?[A-Za-z0-9]{16,}\b/g,         redact: tag('stripe-pk'),    enabledByDefault: true },
  { id: 'github-pat',   label: 'GitHub PAT',     pattern: /\bghp_[A-Za-z0-9]{30,}\b/g,                        redact: tag('github-pat'),   enabledByDefault: true },
  { id: 'slack-bot',    label: 'Slack token',    pattern: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g,                redact: tag('slack'),        enabledByDefault: true },
  { id: 'aws-access',   label: 'AWS access key', pattern: /\bAKIA[0-9A-Z]{16}\b/g,                            redact: tag('aws-access'),   enabledByDefault: true },
  { id: 'google-api',   label: 'Google API key', pattern: /\bAIza[0-9A-Za-z_-]{35}\b/g,                       redact: tag('google-api'),   enabledByDefault: true },
  { id: 'google-oauth', label: 'Google OAuth',   pattern: /\bya29\.[0-9A-Za-z_-]+/g,                          redact: tag('google-oauth'), enabledByDefault: true },
  { id: 'gitlab-pat',   label: 'GitLab PAT',     pattern: /\bglpat-[0-9A-Za-z_-]{20,}\b/g,                    redact: tag('gitlab-pat'),   enabledByDefault: true },
  { id: 'anthropic-pat',label: 'Anthropic PAT',  pattern: /\bpat_[A-Za-z0-9]{20,}\b/g,                        redact: tag('anthropic-pat'),enabledByDefault: true },
  { id: 'jwt',          label: 'JWT',            pattern: /\beyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, redact: tag('jwt'), enabledByDefault: true },
  { id: 'email',        label: 'Email',          pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, redact: tag('email'),     enabledByDefault: true },
  { id: 'phone-e164',   label: 'Phone (E.164)',  pattern: /(?<![\d.])\+\d{1,3}[\s.-]?\(?\d{1,4}\)?[\s.-]?\d{1,4}[\s.-]?\d{2,9}(?!\d)/g, redact: tag('phone'), enabledByDefault: true },
  { id: 'phone-us',     label: 'Phone (US)',     pattern: /(?<!\d)\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}(?!\d)/g,  redact: tag('phone'),        enabledByDefault: true },
  { id: 'ipv4',         label: 'IPv4',           pattern: /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g, redact: tag('ipv4'), enabledByDefault: true },
  { id: 'ipv6',         label: 'IPv6',           pattern: /\b(?:[0-9A-Fa-f]{1,4}:){2,7}[0-9A-Fa-f]{1,4}\b|::1\b|\bfe80::[0-9A-Fa-f:]+/g, redact: tag('ipv6'), enabledByDefault: true },
  { id: 'uuid',         label: 'UUID',           pattern: /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi, redact: tag('uuid'), enabledByDefault: false }
];
