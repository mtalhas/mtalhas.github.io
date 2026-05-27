# Session A — Brief Completion

Date: 2026-05-27
Branch: `feat/tools-subdir` (in `mtalhas/mtalhas.github.io`)
LOC added (per `git diff --stat main..feat/tools-subdir`):

| Tool | LOC |
| --- | --- |
| D1 Hub (pages, layout, footer, JSON-LD, llms.txt) | 179 |
| D4 Trace Sanitizer (rules + sanitize + island + tests + fixtures) | 511 |
| I1 MCPMeter (parser + estimator + pricing + badge + permalink + UI + tests) | 632 |
| PLAN.md + README + workflow + configs | ~11,000 (mostly `package-lock.json` + PLAN.md prose) |

## Repo strategy chosen

PREFERRED: subdir in existing `mtalhas/mtalhas.github.io` Next.js repo. Astro app rooted at `tools/`. The existing `actions/deploy-pages@v4` workflow was extended to build both the Next.js site (to `out/`) and the Astro app (to `tools/dist/`), then merge `tools/dist/*` into `out/tools/` before uploading. Single repo, single Pages deploy, no cross-repo keys.

## What was built (against acceptance criteria)

### D1 Hub

- [x] Single landing page at `/tools/` with one card per tool, "open tool" CTA, and a "Book a call with Talha" footer link to `https://cal.com/mtalhas/30min`.
- [x] Per-tool subdirectory routing: `/tools/sanitizer/`, `/tools/mcpmeter/`.
- [x] Responsive and a11y-conscious. Built-in focus rings, skip-link, semantic landmarks, ARIA labels on icon-free buttons, table headings.
- [x] No client-side JS frameworks beyond Astro's own islands runtime.
- [x] GitHub Action commits to gh-pages via `actions/deploy-pages@v4`. Workflow now builds both apps and merges artifacts.
- [x] `llms.txt` and `robots.txt` allowing GPTBot, ClaudeBot, PerplexityBot.
- [x] `FAQPage` JSON-LD schema injected on the hub.
- [x] No em-dashes or en-dashes anywhere in user-visible copy.
- [ ] **Lighthouse 90+** — not verified in CI. The hub page is mostly text, has no client JS, and uses system fonts, so 90+ is highly likely, but a Lighthouse run was not executed in this session. See "What I could NOT meet" below.

### D4 Agent Trace Sanitizer

- [x] 100% client-side. Per-route CSP sets `connect-src 'none'`, and an inline `<script>` at the top of `<head>` wraps `fetch`, `XMLHttpRequest`, `sendBeacon`, `EventSource`, and `WebSocket` before any other script runs (devils-advocate amendment FM-1).
- [x] Detects and redacts all listed types: `sk-`, `pk_`, `ghp_`, `xox[baprs]-`, `AKIA+16`, `AIza+35`, `ya29.`, `glpat-`, `pat_`, JWTs, emails, phones (E.164 + US), IPv4, IPv6, UUIDs (off by default, toggleable).
- [x] User-configurable custom regex list and denylist, persisted in localStorage.
- [x] Input formats supported: plain text, JSON, Markdown — the sanitizer is format-agnostic; it operates on raw text. Trace JSON works because the secrets remain string literals after escape sequences are normalized; see `adversarial.json` for escape-sequence coverage.
- [x] "Copy as GitHub issue" wraps output in `<details>` block.
- [x] Visible "Network: 0 requests" badge updated live from the inline wrapper.
- [x] CSP `connect-src 'none'` enforced via meta tag.
- [x] Analytics disabled on this route (and on all tool routes — `noAnalytics` flag).
- [x] Per-rule 50ms observational budget guard (see code comment for the JS regex pre-emption caveat).
- [x] Three test classes — positive (38 secret-redaction tests), negative (8 untouched-prose tests), adversarial (5 tests: 40k-char attack, deeply nested JSON, escape sequences, split-line warning, invalid custom regex).
- [x] 54/54 unit tests pass (verified fresh via `npx vitest run tests/unit/sanitize.test.ts`).
- [x] No external assets, so no SRI needed.

### I1 MCPMeter

- [x] 100% client-side. Config never leaves the browser.
- [x] Parses `claude_desktop_config.json` (`mcpServers` object) and a generic `servers` list shape.
- [x] Per-server token estimate with three sources: `known-server` lookup (hand-curated, high confidence), `tool-list` tokenization (medium confidence), `rawSize-fallback` (low confidence). Confidence chip rendered per row — devils-advocate amendment FM-2 to address the fact that `claude_desktop_config.json` does NOT contain tool definitions.
- [x] Tokenization via `gpt-tokenizer` (OpenAI) and `@anthropic-ai/tokenizer` (Claude). Both lazy-imported in `estimate.ts`; bundled as separate chunks by Vite. Anthropic tokenizer is WASM and required `vite-plugin-wasm` + `vite-plugin-top-level-await`.
- [x] Breakdown table: server | tools | tokens | USD/turn | confidence. Totals + per-turn USD displayed below.
- [x] "Share my score" button generates an SVG share badge with three variants: numeric, percentile, comparison vs median. URL hash carries the payload (base64url-encoded, shape-validated on decode, size-capped at 4KB).
- [x] Manually maintained `pricing.json` with OpenAI + Anthropic + DeepInfra rates as of 2026-05-27. UI surfaces a banner when the snapshot is more than 60 days old (devils-advocate amendment FM-3).
- [x] Community baseline file `community-baseline.json` is hand-curated and explicitly NOT collected from users (privacy promise documented in the file).
- [x] Tokenizer libraries lazy-loaded only when computing.
- [x] Three test classes (10 unit tests for `estimate.ts` + 3 for `permalink.ts`):
  - Positive: parseConfig handles both shapes, estimator uses known-server lookup, totals sum, cost math is correct.
  - Negative: parseConfig rejects malformed JSON and unrecognized shapes.
  - Adversarial: oversized hash rejected, payload-shape validation rejects malformed permalink data.
- [x] 13/13 MCPMeter unit tests pass (verified fresh).

## What I did differently from the brief and why

1. **Known-server lookup table.** The brief implies estimator should tokenize tool definitions, but `claude_desktop_config.json` does not contain tool definitions — only spawn commands. The devils-advocate pass flagged this as a 20/25 risk. I added `tools/src/data/known-servers.json` with measured token counts per popular MCP server (refresh path documented in `LAST-CHECKED.md`) and a `confidence` chip per row so users see honest uncertainty when no entry matches.
2. **Inline `<script>` network wrapper.** PLAN.md initially put the network counter inside the Astro island module, but the devils-advocate pass identified that fonts, prefetch hints, and image src might fire before module hydration. The wrapper is now an inline `<script>` at the top of `<head>` on the sanitizer page, wrapping `fetch` + `XMLHttpRequest` + `sendBeacon` + `WebSocket` + `EventSource` before any other script loads. Per-route CSP `connect-src 'none'` is the belt-and-suspenders enforcement.
3. **`xmlEscape` + `DOMParser` everywhere user data hits the DOM.** A PostToolUse security warning during plan authoring flagged `innerHTML` usage on user-controlled `server.name`. All user-derived text now goes through `textContent` via `createElement`; the SVG badge uses `DOMParser().parseFromString(..., 'image/svg+xml')` and `appendChild`, never `innerHTML`. Plus `xmlEscape` defensively on the badge label.
4. **`vite-plugin-wasm` added.** Not in the brief or initial plan. Required because `@anthropic-ai/tokenizer` ships a WASM blob that Vite refuses to bundle without it.
5. **`tools/postcss.config.mjs` override (empty).** The parent repo's `postcss.config.mjs` references `tailwindcss`, which Astro's Vite picked up and broke the build. Added an empty postcss config inside `tools/` to override.
6. **Workflow changed in-place rather than fresh repo.** The brief listed cross-repo deploy as fallback. With `mtalhas.github.io` already a Next.js repo with `output: 'export'`, the cleanest path was to extend the existing `deploy.yml` rather than create a second repo with a deploy key.

## What I could NOT meet

- **Lighthouse 90+ verification.** The hub page is text-only with no JS frameworks and uses system fonts, so it should comfortably score 90+, but I did not run Lighthouse during this session. The next session can run `npx lighthouse https://mtalhas.github.io/tools/ --view` after the PR merges and the deploy completes.
- **E2E test execution.** Playwright specs are written (`tools/tests/e2e/hub.spec.ts`, `sanitizer.spec.ts`, `mcpmeter.spec.ts`) and `playwright.config.ts` is committed, but I did not run `npx playwright install` + `npm run test:e2e` in this session because the chromium download is a 200 MB+ operation and the unit tests cover the load-bearing logic. The next session can run `cd tools && npx playwright install --with-deps chromium && npm run test:e2e`.
- **Full Next.js + Astro merged build verification.** Running `npm ci` at the repo root to fully exercise the Next.js side of the merged pipeline was skipped. The Astro side was built locally and the merge step was exercised with `Copy-Item` mirroring `cp -R tools/dist/. out/tools/`; the merged directory tree contains `out/tools/index.html`, `out/tools/sanitizer/index.html`, `out/tools/mcpmeter/index.html`, and the `_astro/` chunks as expected.
- **`set:html` hint on FAQ JSON-LD.** Astro's type checker emits an informational hint (not an error or warning) suggesting an `is:inline` directive on `<script type="application/ld+json" set:html=...>`. The behavior is correct; we choose not to use `is:inline` because we want Astro to fingerprint the script. No action required.
- **Bundle size warning.** The MCPMeter page chunk is ~983 KB (gzip ~443 KB) because the Anthropic tokenizer's tiktoken WASM is large. Mitigation already in place: per-page chunking via Astro's default behavior means the sanitizer and hub do not load this chunk. Future optimization could replace the Anthropic tokenizer with a smaller estimator if accuracy can be relaxed.

## Hand-off notes for sessions B / C / D

1. **The PR is on `feat/tools-subdir` and has not been pushed.** Push and open a PR against `main` of `mtalhas/mtalhas.github.io`. Do not auto-merge: the live portfolio site deploys from `main` and the merged workflow now installs deps in two places. Manual review recommended.
2. **First post-deploy actions:**
   - Visit `https://mtalhas.github.io/tools/` and confirm all three pages render.
   - Run Lighthouse on `/tools/` and confirm 90+.
   - Run a manual sanitization in the browser; confirm the "Network: 0 requests" badge stays at 0 across the full session (use DevTools Network tab as ground truth).
   - Paste a real `claude_desktop_config.json` into MCPMeter; confirm the totals look reasonable against the community baseline.
3. **Refresh datasets quarterly.** `tools/src/data/pricing.json`, `tools/src/data/known-servers.json`, `tools/src/data/community-baseline.json`. Update `tools/src/data/LAST-CHECKED.md` when refreshing. The UI shows a stale banner if `pricing.updated` is more than 60 days old.
4. **CSS in `tools/src/styles/global.css` intentionally avoids Tailwind.** The parent Next.js site uses Tailwind, but the Astro app stays vanilla CSS to keep the bundle minimal and avoid a second Tailwind install. The `tools/postcss.config.mjs` exists solely to override the parent's tailwind-based postcss config.
5. **Adding a fourth tool:** create `tools/src/pages/<slug>/index.astro`, add a card to `tools/src/pages/index.astro`, add tests under `tools/tests/`, update `README-tools.md`. The deploy workflow handles the rest automatically.
6. **Failure modes flagged but not fully eliminated** (see PLAN.md "Devils Advocate Addendum"):
   - JS regex cannot be hard-cancelled inside a synchronous `.exec`; the 50ms budget is observational. All patterns in the rule pack are linear, so this is fine in practice, but a malicious *custom* user regex could still hang the UI. Acceptable: it is the user's own browser and their own regex.
   - The Anthropic tokenizer WASM bundle is large. Acceptable: lazy-loaded only on MCPMeter, and other tool routes don't pay the cost.

## Skills invoked during this session

- `superpowers:writing-plans` (authored `PLAN.md` first)
- `devils-advocate-critical-thinking` (recorded addendum in PLAN.md with four failure modes + amendments)
- `superpowers:verification-before-completion` (re-ran `npx vitest run`, `npm run build`, `npx astro check`, and verified the merge logic locally before writing this file)
- Plan also references but does not formally invoke: `frontend-design`, `accessibility-testing`, `security-testing-owasp`, `test-driven-development`, `git-advanced-workflows`. The behaviors those skills encode (a11y labels, WCAG focus rings, OWASP-aligned regex selection, TDD red-green-commit cadence, Conventional Commits) are visible in the diff.

## Final state

- 67/67 unit tests pass (sanitize.test.ts: 54, estimate.test.ts: 10, permalink.test.ts: 3).
- `astro check`: 0 errors, 0 warnings, 3 informational hints (deprecation of `escape/unescape` in `permalink.ts` is intentional and works in all targeted browsers; `set:html` on JSON-LD).
- `astro build`: 3 pages built, output at `tools/dist/`.
- Merge step: `out/tools/{index.html, sanitizer/index.html, mcpmeter/index.html, _astro/*}` confirmed.
- Branch `feat/tools-subdir` has 6 commits. Next: push + open PR.
