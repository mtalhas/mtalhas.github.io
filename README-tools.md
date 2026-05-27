# mtalhas tools

Browser-only utilities hosted at `https://mtalhas.github.io/tools/`. The Astro 5 project lives under `tools/` inside the existing `mtalhas/mtalhas.github.io` Next.js repo. The Pages deploy builds both apps and merges the Astro output into `out/tools/` before publishing.

## Architectural rule

**AI is for BUILDING. AI is NOT in the runtime serving path.**

Every user-visible behavior in every tool is deterministic: regex packs, tokenizer libraries, lookup tables, hand-curated rules. There are no LLM API calls at runtime. This is the load-bearing brand promise of these tools.

## Tools shipped

- `/tools/` — D1 hub landing
- `/tools/sanitizer/` — D4 Agent Trace Sanitizer (paste an AI debug log, strip secrets, copy a clean issue body)
- `/tools/mcpmeter/` — I1 MCPMeter (paste your `claude_desktop_config.json`, see per-server token cost per turn)

## Local development

```bash
cd tools
npm install
npm run dev          # local dev server
npm run typecheck    # astro check
npm test             # vitest (unit)
npm run test:e2e     # playwright (requires `npx playwright install`)
npm run build        # static output to tools/dist/
```

## Deploy

`.github/workflows/deploy.yml` runs on every push to `main`:

1. Builds the Next.js portfolio to `out/`.
2. Runs `npm ci && npm run build` inside `tools/` to produce `tools/dist/`.
3. Copies `tools/dist/*` into `out/tools/`.
4. Uploads the merged artifact to GitHub Pages via `actions/deploy-pages@v4`.

No cross-repo deploy keys needed; one repo, one Pages site.

## Extending

- **Add a new tool**: create a new Astro page under `tools/src/pages/<slug>/index.astro`, add a `ToolCard` to the hub index, and add tests under `tools/tests/`.
- **Add a sanitizer rule**: append to `tools/src/lib/sanitizer/rules.ts` and add three+ canonical examples to `tools/tests/fixtures/sanitizer/positive.json`.
- **Refresh pricing or known servers**: edit the JSON files under `tools/src/data/` and update `tools/src/data/LAST-CHECKED.md`. The UI surfaces a banner when the pricing snapshot is more than 60 days old.

## Privacy guarantees

- D4 sanitizer: per-route `Content-Security-Policy` sets `connect-src 'none'`, plus an inline network-counter wrapper that intercepts `fetch`, `XMLHttpRequest`, `sendBeacon`, `EventSource`, and `WebSocket` before any other script loads. The badge displays "Network: 0 requests" and updates live.
- I1 MCPMeter: 100% client-side. Permalinks encode results into the URL hash (no server-side storage).
- Hub route serves a `FAQPage` JSON-LD schema for AI-assistant citation. `llms.txt` and `robots.txt` allow GPTBot, ClaudeBot, and PerplexityBot.
- No em-dashes or en-dashes anywhere in user-visible copy (style rule).
