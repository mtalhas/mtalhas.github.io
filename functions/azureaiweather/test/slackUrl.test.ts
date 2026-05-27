import { describe, test, expect } from 'vitest';
import { validateSlackWebhook } from '../src/lib/slackUrl.js';

const GOOD = 'https://hooks.slack.com/services/TFAKE00000000FAKE/BFAKE00000000FAKE/FAKEEXAMPLEFAKEEXAMPLE0123';

describe('functions: validateSlackWebhook', () => {
  test('accepts canonical webhook', () => { expect(validateSlackWebhook(GOOD).ok).toBe(true); });
  test('rejects http', () => { expect(validateSlackWebhook(GOOD.replace('https', 'http')).ok).toBe(false); });
  test('rejects wrong host (SSRF)', () => {
    expect(validateSlackWebhook('https://attacker.com/services/TFAKE00000000FAKE/BFAKE00000000FAKE/FAKEEXAMPLEFAKEEXAMPLE0123').ok).toBe(false);
  });
  test('rejects userinfo (SSRF via @)', () => {
    expect(validateSlackWebhook('https://hooks.slack.com:pwd@attacker.com/services/TFAKE00000000FAKE/BFAKE00000000FAKE/FAKEEXAMPLEFAKEEXAMPLE0123').ok).toBe(false);
  });
});
