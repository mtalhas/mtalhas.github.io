import { describe, test, expect } from 'vitest';
import { validateWebPushEndpoint } from '../src/lib/webpushUrl.js';

describe('validateWebPushEndpoint', () => {
  test('accepts FCM (Chrome/Edge)', () => {
    expect(validateWebPushEndpoint('https://fcm.googleapis.com/fcm/send/AAAA').ok).toBe(true);
  });
  test('accepts Mozilla autopush', () => {
    expect(validateWebPushEndpoint('https://updates.push.services.mozilla.com/wpush/v2/xyz').ok).toBe(true);
  });
  test('accepts Apple Web Push', () => {
    expect(validateWebPushEndpoint('https://web.push.apple.com/QABCDEF').ok).toBe(true);
  });
  test('accepts WNS regional host', () => {
    expect(validateWebPushEndpoint('https://wns2-eus1.notify.windows.com/w/?token=xyz').ok).toBe(true);
  });
  test('rejects http', () => {
    expect(validateWebPushEndpoint('http://fcm.googleapis.com/fcm/send/AAAA').ok).toBe(false);
  });
  test('rejects unknown host', () => {
    const r = validateWebPushEndpoint('https://attacker.example/api/push');
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/allowlist/);
  });
  test('rejects loopback', () => {
    expect(validateWebPushEndpoint('https://127.0.0.1/fcm/send/AAAA').ok).toBe(false);
    expect(validateWebPushEndpoint('https://localhost/fcm/send/AAAA').ok).toBe(false);
  });
  test('rejects RFC1918', () => {
    expect(validateWebPushEndpoint('https://10.0.0.5/fcm/send/AAAA').ok).toBe(false);
    expect(validateWebPushEndpoint('https://192.168.1.1/fcm/send/AAAA').ok).toBe(false);
    expect(validateWebPushEndpoint('https://172.20.0.5/fcm/send/AAAA').ok).toBe(false);
  });
  test('rejects link-local', () => {
    expect(validateWebPushEndpoint('https://169.254.169.254/latest/meta-data/').ok).toBe(false);
  });
  test('rejects userinfo SSRF', () => {
    expect(validateWebPushEndpoint('https://fcm.googleapis.com:pwd@attacker.example/x').ok).toBe(false);
  });
  test('rejects non-default port', () => {
    expect(validateWebPushEndpoint('https://fcm.googleapis.com:8443/fcm/send/AAAA').ok).toBe(false);
  });
  test('rejects malformed URL', () => {
    expect(validateWebPushEndpoint('not a url').ok).toBe(false);
  });
});
