import { describe, test, expect } from 'vitest';
import { validateSlackWebhook } from '@/lib/azureaiweather/slackUrl';

const GOOD = 'https://hooks.slack.com/services/TFAKE00000000FAKE/BFAKE00000000FAKE/FAKEEXAMPLEFAKEEXAMPLE0123';

describe('validateSlackWebhook', () => {
  test('accepts canonical webhook', () => {
    expect(validateSlackWebhook(GOOD).ok).toBe(true);
  });
  test('rejects http', () => {
    expect(validateSlackWebhook(GOOD.replace('https', 'http')).ok).toBe(false);
  });
  test('rejects wrong host (SSRF)', () => {
    expect(validateSlackWebhook('https://attacker.com/services/TFAKE00000000FAKE/BFAKE00000000FAKE/FAKEEXAMPLEFAKEEXAMPLE0123').ok).toBe(false);
  });
  test('rejects userinfo (SSRF via @)', () => {
    expect(validateSlackWebhook('https://hooks.slack.com:user@attacker.com/services/TFAKE00000000FAKE/BFAKE00000000FAKE/FAKEEXAMPLEFAKEEXAMPLE0123').ok).toBe(false);
  });
  test('rejects path traversal', () => {
    expect(validateSlackWebhook('https://hooks.slack.com/services/T01234567/B01234567/../../etc/passwd').ok).toBe(false);
  });
  test('rejects malformed path', () => {
    expect(validateSlackWebhook('https://hooks.slack.com/foo').ok).toBe(false);
  });
  test('rejects query string', () => {
    expect(validateSlackWebhook(GOOD + '?cmd=ls').ok).toBe(false);
  });
  test('rejects fragment', () => {
    expect(validateSlackWebhook(GOOD + '#frag').ok).toBe(false);
  });
  test('rejects non-default port', () => {
    expect(validateSlackWebhook(GOOD.replace('hooks.slack.com', 'hooks.slack.com:8443')).ok).toBe(false);
  });
});
