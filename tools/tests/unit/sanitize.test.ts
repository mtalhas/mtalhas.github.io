import { describe, test, expect } from 'vitest';
import { sanitize } from '@/lib/sanitizer/sanitize';
import positive from '@fixtures/sanitizer/positive.json';
import negative from '@fixtures/sanitizer/negative.json';
import adversarial from '@fixtures/sanitizer/adversarial.json';

const REDACTED = '[REDACTED:';

describe('sanitize - positive (redacts each secret type)', () => {
  for (const [category, samples] of Object.entries(positive.apiKeys)) {
    for (const sample of samples as string[]) {
      test(`redacts ${category}: ${sample.slice(0, 12)}...`, () => {
        const { output } = sanitize(sample);
        expect(output).not.toContain(sample);
        expect(output).toContain(REDACTED);
      });
    }
  }
  for (const jwt of positive.jwts) {
    test(`redacts JWT ${jwt.slice(0, 16)}`, () => {
      const { output } = sanitize(jwt);
      expect(output).not.toContain(jwt);
      expect(output).toContain('[REDACTED:jwt');
    });
  }
  for (const email of positive.emails) {
    test(`redacts email ${email}`, () => {
      const { output } = sanitize(email);
      expect(output).not.toContain(email);
      expect(output).toContain('[REDACTED:email');
    });
  }
  for (const ip of positive.ipv4) {
    test(`redacts IPv4 ${ip}`, () => {
      const { output } = sanitize(ip);
      expect(output).not.toContain(ip);
      expect(output).toContain('[REDACTED:ipv4');
    });
  }
  for (const ip of positive.ipv6) {
    test(`redacts IPv6 ${ip}`, () => {
      const { output } = sanitize(ip);
      expect(output).not.toContain(ip);
    });
  }
  test('UUID off by default, on when enabled', () => {
    const u = positive.uuids[0];
    expect(sanitize(u).output).toBe(u);
    const { output } = sanitize(u, { enabledIds: new Set(['uuid']) });
    expect(output).not.toContain(u);
  });
});

describe('sanitize - negative (leaves non-secrets alone)', () => {
  for (const text of negative.prose) {
    test(`prose untouched: ${text.slice(0, 30)}`, () => {
      const { output } = sanitize(text);
      expect(output).toBe(text);
    });
  }
  for (const text of negative.lookalikeKeys) {
    test(`lookalike untouched: ${text}`, () => {
      const { output } = sanitize(text);
      expect(output).toBe(text);
    });
  }
});

describe('sanitize - adversarial', () => {
  test('handles 40k-char attack input within 500ms total', () => {
    const evil = 'a'.repeat(40000);
    const t0 = (typeof performance !== 'undefined' ? performance : Date).now();
    const { output } = sanitize(evil);
    const dt = (typeof performance !== 'undefined' ? performance : Date).now() - t0;
    expect(dt).toBeLessThan(500);
    expect(typeof output).toBe('string');
  });

  test('redacts secrets inside deeply nested JSON', () => {
    const stringified = JSON.stringify(adversarial.deeplyNested);
    const { output } = sanitize(stringified);
    expect(output).not.toContain('AKIAFAKEFAKEFAKEFAKE');
    expect(output).toContain('[REDACTED:aws-access');
  });

  test('redacts secrets in JSON escape sequences', () => {
    const { output } = sanitize(adversarial.escapeSequence);
    expect(output).not.toContain('sk-abc123def456ghi789jkl012mno345pq');
  });

  test('split-line secret produces warning', () => {
    const { warnings } = sanitize(adversarial.splitLine);
    expect(warnings.some(w => /split-line/i.test(w))).toBe(true);
  });

  test('custom regex denylist applies', () => {
    const { output, counts } = sanitize('My company is CompanyAcme and that is private.', {
      denylist: ['CompanyAcme']
    });
    expect(output).not.toContain('CompanyAcme');
    expect(output).toContain('[REDACTED:denylist:');
    expect(counts).toBeDefined();
  });

  test('invalid custom regex is reported as warning, not thrown', () => {
    const { warnings } = sanitize('hello', {
      customRegexes: [{ id: 'bad', label: 'bad', pattern: '(((' }]
    });
    expect(warnings.some(w => /bad/.test(w))).toBe(true);
  });
});
