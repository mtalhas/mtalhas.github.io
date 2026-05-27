# Data freshness log

This file tracks when the manually maintained JSON datasets in this folder were last verified against primary sources.

| File | Last verified | Primary source(s) | Notes |
| --- | --- | --- | --- |
| `pricing.json` | 2026-05-27 | openai.com/api/pricing, anthropic.com/pricing | Refresh quarterly or when a provider posts a price change. |
| `community-baseline.json` | 2026-05-27 | hand-curated samples (no user data collected) | Refresh by manually constructing representative configs. |
| `known-servers.json` | 2026-05-27 | Running each MCP server locally and counting tokens in the `list_tools` response | Refresh when major MCP servers publish breaking changes. |

The UI surfaces a banner when `pricing.updated` is more than 60 days behind today.
