# Insurance prerequisite for MCP Server Health Tracker (B4)

This file documents the gate between the technical implementation of `/tools/mcp-health/` and its public visibility on the hub tool grid.

## Why this matters

The B4 MCP Server Health Tracker publishes facts about third-party software: composite health scores, commit recency, issue ratios, star counts. Even with a deterministic, transparent formula and a right-to-respond UX, a vendor could in principle argue that an unfavorable score caused them financial harm and pursue an Errors & Omissions claim.

**The technical mitigations (right-to-respond per row, methodology page, sourcing notes, confidence chips) are necessary but not sufficient. An E&O policy is the legal mitigation.**

## Gate

The B4 frontend page is committed and renders, but it is hidden from the hub grid via a feature flag:

```json
// tools/src/data/feature-flags.json
{
  "b4McpHealthVisible": false
}
```

Flip `b4McpHealthVisible` to `true` ONLY AFTER:

1. An E&O insurance policy is in force, written to cover content publishing and online defamation, with a coverage minimum that matches your risk tolerance. Recommended floor: USD 1M aggregate.
2. The methodology page at `/tools/mcp-health/methodology/` has been reviewed by counsel for clarity around the "no warranty, sources are public APIs, vendors may submit corrections" framing.
3. A documented intake process exists for correction requests (the per-row "file correction" link points to a GitHub issue template).

## Reversibility

If insurance lapses or counsel raises concerns, flip the flag back to `false`. The data continues to be ingested daily (the cron is independent of the visibility flag), so re-enabling later is a one-line change.

## What is NOT gated

- The ingestion workflow `.github/workflows/mcp-health-ingest.yml` runs daily regardless. It builds the dataset against public APIs only.
- The methodology page `/tools/mcp-health/methodology/` is reachable via direct URL even when the hub card is hidden. The hub grid omission only removes the card, not the route. If you need the route hidden entirely, add a guard in the page frontmatter that returns a 404 when the flag is off.

## Status

As of 2026-05-27: `b4McpHealthVisible: false`. Flag has never been flipped to true.
