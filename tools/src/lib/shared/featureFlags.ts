import raw from '../../data/feature-flags.json';

export type FeatureFlagKey = 'b4McpHealthVisible' | 'd3AzureAiWeatherVisible' | 'i3PolyjbVisible';

const flags: Record<string, unknown> = raw as Record<string, unknown>;

export function isEnabled(key: FeatureFlagKey): boolean {
  return flags[key] === true;
}
