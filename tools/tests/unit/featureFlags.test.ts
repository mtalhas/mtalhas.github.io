import { describe, test, expect } from 'vitest';
import { isEnabled } from '@/lib/shared/featureFlags';

describe('featureFlags', () => {
  test('b4 hidden by default (E&O insurance gate)', () => {
    expect(isEnabled('b4McpHealthVisible')).toBe(false);
  });
  test('d3 visible by default', () => {
    expect(isEnabled('d3AzureAiWeatherVisible')).toBe(true);
  });
  test('i3 visible by default', () => {
    expect(isEnabled('i3PolyjbVisible')).toBe(true);
  });
});
