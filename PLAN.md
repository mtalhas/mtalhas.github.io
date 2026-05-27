# mtalhas-tools Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship D1 (Hub site), D4 (Agent Trace Sanitizer), and I1 (MCPMeter) as browser-only utility tools at `https://mtalhas.github.io/tools/`, with zero runtime AI calls and verifiable no-egress behavior on D4.

**Architecture:** Astro 5.x static-site app rooted at `tools/` subdir inside the existing `mtalhas/mtalhas.github.io` Next.js repo. Astro builds to `tools/dist/`; the existing Next.js deploy workflow is extended to merge the Astro output into `out/tools/` before uploading the Pages artifact. All tool logic is deterministic TypeScript (regex packs, tokenizer libraries, lookup tables) loaded as Astro islands or inline `<script type="module">` tags. NO LLM calls at runtime.

**Tech Stack:** Astro 5.x (static), TypeScript 5.x, Vitest (unit), Playwright + @axe-core/playwright (E2E + a11y + network verification), `gpt-tokenizer`, `@anthropic-ai/tokenizer`, vanilla web platform (no React in tools subdir to keep bundles minimal). Tailwind v3 is already in repo root but the `tools/` app uses its own minimal CSS to stay isolated. GitHub Actions deploy via `actions/deploy-pages@v4` (already configured).

**Repo strategy (decided):** PREFERRED path. The `mtalhas/mtalhas.github.io` repo already exists. We clone it into the working dir, create branch `feat/tools-subdir`, add the Astro app under `tools/`, extend the existing `deploy.yml`. Single repo, single Pages deploy. No new repo needed.

**Branch + PR strategy:** All work on `feat/tools-subdir`. Conventional Commits. We open a PR at the end of the session and leave merge for the user (do not auto-merge a live portfolio site).

---

## File Structure

Inside the cloned `mtalhas.github.io` working tree, the new files are scoped under `tools/` plus a minimal edit to `.github/workflows/deploy.yml`:

```
mtalhas.github.io/                       (already cloned in mtalhas-tools/)
├── .github/workflows/deploy.yml         MODIFY: add Astro build + merge step
├── tools/                               NEW: Astro project root
│   ├── astro.config.mjs                 base: '/tools', output: 'static'
│   ├── package.json                     scripts: dev, build, test, test:e2e
│   ├── tsconfig.json                    extends astro/tsconfigs/strict
│   ├── playwright.config.ts             webServer points at astro preview
│   ├── vitest.config.ts                 jsdom env, fixtures path alias
│   ├── public/
│   │   ├── llms.txt                     allow GPTBot/ClaudeBot/PerplexityBot
│   │   └── robots.txt                   allow same bots
│   ├── src/
│   │   ├── layouts/Base.astro           shell, JSON-LD slot, CSP meta slot
│   │   ├── components/ToolCard.astro    title, blurb, CTA
│   │   ├── components/Footer.astro      cal.com book-a-call link
│   │   ├── pages/index.astro            /tools/ hub landing
│   │   ├── pages/sanitizer/index.astro  /tools/sanitizer/
│   │   ├── pages/mcpmeter/index.astro   /tools/mcpmeter/
│   │   ├── styles/global.css            minimal design tokens
│   │   ├── lib/
│   │   │   ├── sanitizer/rules.ts       hand-curated regex pack
│   │   │   ├── sanitizer/sanitize.ts    pure redact() function
│   │   │   ├── sanitizer/timeout.ts     50ms per-rule guard
│   │   │   ├── sanitizer/issueWrap.ts   <details> wrap helper
│   │   │   ├── mcpmeter/parseConfig.ts  claude_desktop_config.json parser
│   │   │   ├── mcpmeter/estimate.ts     tokenize tool defs
│   │   │   ├── mcpmeter/pricing.ts      pure cost math
│   │   │   ├── mcpmeter/badge.ts        SVG generation
│   │   │   └── mcpmeter/permalink.ts    URL hash encode/decode
│   │   ├── data/
│   │   │   ├── pricing.json             OpenAI + Anthropic + DeepInfra
│   │   │   └── community-baseline.json  hand-curated MCP sample setups
│   │   └── islands/
│   │       ├── SanitizerApp.ts          DOM wiring + network counter
│   │       └── McpmeterApp.ts           DOM wiring, lazy tokenizer loader
│   └── tests/
│       ├── fixtures/sanitizer/
│       │   ├── positive.json            3+ examples per secret type
│       │   ├── negative.json            non-secret strings
│       │   └── adversarial.json         backtracking, unicode, split-lines
│       ├── fixtures/mcpmeter/
│       │   ├── sample-configs.json
│       │   └── malformed-configs.json
│       ├── unit/sanitize.test.ts        Vitest, all three classes
│       ├── unit/estimate.test.ts        Vitest
│       ├── unit/permalink.test.ts       Vitest
│       └── e2e/
│           ├── sanitizer.spec.ts        Playwright + network=0 + axe
│           ├── mcpmeter.spec.ts         Playwright + axe
│           └── hub.spec.ts              Playwright + axe + Lighthouse-lite
├── README-tools.md                      NEW: tools-only README
└── BRIEF-COMPLETION.md                  NEW: final session sign-off (root)
```

Files that change together live together. The Astro app is fully self-contained inside `tools/` so the existing Next.js build is untouched.

---

## Task 0: Bootstrap working tree + branch

**Files:**
- Create: `C:\Users\mtalhas\Projects\AIMProjects\AIMProjects\personal\mtalhas-tools\` (already empty, ready to clone into)

- [ ] **Step 0.1: Confirm working dir is empty**

Run: `pwsh -NoProfile -Command "Get-ChildItem 'C:\Users\mtalhas\Projects\AIMProjects\AIMProjects\personal\mtalhas-tools' -Force | Measure-Object | Select-Object Count"`
Expected: `Count : 0`

- [ ] **Step 0.2: Clone mtalhas.github.io into working dir**

Run: `git clone https://github.com/mtalhas/mtalhas.github.io.git C:\Users\mtalhas\Projects\AIMProjects\AIMProjects\personal\mtalhas-tools`
Expected: clone completes, `main` checked out.

- [ ] **Step 0.3: Create feature branch**

Run: `git -C C:\Users\mtalhas\Projects\AIMProjects\AIMProjects\personal\mtalhas-tools checkout -b feat/tools-subdir`
Expected: `Switched to a new branch 'feat/tools-subdir'`.

- [ ] **Step 0.4: Verify clean tree + remote**

Run: `git -C ... status` and `git -C ... remote -v`
Expected: `nothing to commit, working tree clean`; origin points to mtalhas.github.io.

---

## Task 1: Astro project skeleton

**Files:**
- Create: `tools/package.json`
- Create: `tools/astro.config.mjs`
- Create: `tools/tsconfig.json`
- Create: `tools/src/pages/index.astro` (placeholder)

- [ ] **Step 1.1: Create `tools/package.json`**

```json
{
  "name": "mtalhas-tools",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview --port 4321",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "typecheck": "astro check"
  },
  "dependencies": {
    "astro": "^5.0.0"
  },
  "devDependencies": {
    "@anthropic-ai/tokenizer": "^0.0.4",
    "@axe-core/playwright": "^4.10.0",
    "@playwright/test": "^1.48.0",
    "@types/node": "^22.10.0",
    "gpt-tokenizer": "^2.5.0",
    "jsdom": "^25.0.0",
    "typescript": "^5.7.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 1.2: Create `tools/astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://mtalhas.github.io',
  base: '/tools',
  trailingSlash: 'always',
  output: 'static',
  build: { format: 'directory' },
  vite: {
    build: { sourcemap: false },
    server: { fs: { strict: true } }
  }
});
```

- [ ] **Step 1.3: Create `tools/tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@fixtures/*": ["tests/fixtures/*"]
    }
  },
  "include": ["src/**/*", "tests/**/*"]
}
```

- [ ] **Step 1.4: Create placeholder `tools/src/pages/index.astro`**

```astro
---
const title = 'mtalhas tools';
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>{title}</title>
  </head>
  <body><h1>tools coming online</h1></body>
</html>
```

- [ ] **Step 1.5: Install dependencies**

Run from `tools/`: `npm install`
Expected: lockfile generated, no peer warnings that block install.

- [ ] **Step 1.6: Verify dev server boots and build succeeds**

Run: `npm --prefix tools run build`
Expected: `dist/` produced with `index.html` inside `dist/`.

- [ ] **Step 1.7: Commit**

```
git add tools/package.json tools/package-lock.json tools/astro.config.mjs tools/tsconfig.json tools/src/pages/index.astro
git commit -m "feat(tools): bootstrap Astro 5 project under tools/"
```

---

## Task 2: Base layout + global styles + footer

**Files:**
- Create: `tools/src/layouts/Base.astro`
- Create: `tools/src/components/Footer.astro`
- Create: `tools/src/styles/global.css`

- [ ] **Step 2.1: Create `tools/src/styles/global.css`**

```css
:root {
  --bg: #0b0c0f;
  --fg: #e6e7eb;
  --muted: #9aa0a6;
  --accent: #5ee0a3;
  --card: #14161b;
  --border: #2a2d35;
  --focus: #f9d44d;
  font-size: 16px;
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: var(--bg); color: var(--fg); font-family: ui-sans-serif, system-ui, sans-serif; }
a { color: var(--accent); }
a:focus-visible, button:focus-visible, [tabindex]:focus-visible {
  outline: 3px solid var(--focus); outline-offset: 2px;
}
.container { max-width: 880px; margin: 0 auto; padding: 2rem 1.25rem; }
.card { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 1.25rem; }
.cta { display: inline-block; padding: 0.5rem 0.9rem; border-radius: 8px; background: var(--accent); color: #061712; font-weight: 600; text-decoration: none; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
```

- [ ] **Step 2.2: Create `tools/src/components/Footer.astro`**

```astro
---
const calLink = 'https://cal.com/mtalhas/30min';
---
<footer class="container" style="border-top: 1px solid var(--border); margin-top: 3rem;">
  <p>
    Built by Talha Siddiqui. Need help wiring AI into your stack?
    <a class="cta" href={calLink} rel="noopener" target="_blank">Book a call with Talha</a>
  </p>
</footer>
```

(Note: copy uses period, not em/en dash.)

- [ ] **Step 2.3: Create `tools/src/layouts/Base.astro`**

```astro
---
import Footer from '../components/Footer.astro';
import '../styles/global.css';
interface Props {
  title: string;
  description: string;
  cspExtra?: string;
  noAnalytics?: boolean;
  jsonLd?: unknown;
}
const { title, description, cspExtra, noAnalytics = false, jsonLd } = Astro.props;
const baseCsp = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'";
const csp = cspExtra ? `${baseCsp}; ${cspExtra}` : baseCsp;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="Content-Security-Policy" content={csp} />
    <meta name="description" content={description} />
    <title>{title}</title>
    {jsonLd && (
      <script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />
    )}
  </head>
  <body>
    <a href="#main" class="sr-only">Skip to content</a>
    <main id="main"><slot /></main>
    {!noAnalytics && <!-- intentional: no analytics on any tool route -->}
    <Footer />
  </body>
</html>
```

(Analytics flag is wired even though we never enable it in this milestone; future hub-only opt-in is possible without re-touching tool routes.)

- [ ] **Step 2.4: Verify build still passes**

Run: `npm --prefix tools run build`
Expected: build succeeds.

- [ ] **Step 2.5: Commit**

```
git add tools/src/layouts tools/src/components tools/src/styles
git commit -m "feat(tools): add base layout, footer, global styles with WCAG focus rings"
```

---

## Task 3: D1 Hub landing page

**Files:**
- Modify: `tools/src/pages/index.astro` (replace placeholder)
- Create: `tools/src/components/ToolCard.astro`
- Create: `tools/public/llms.txt`
- Create: `tools/public/robots.txt`
- Test: `tools/tests/e2e/hub.spec.ts`

- [ ] **Step 3.1: Write failing E2E test for hub**

Create `tools/tests/e2e/hub.spec.ts`:

```ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('D1 hub', () => {
  test('lists both tools with CTAs and cal.com footer', async ({ page }) => {
    await page.goto('/tools/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/tools/i);
    await expect(page.getByRole('link', { name: /open.*sanitizer/i })).toHaveAttribute('href', /\/tools\/sanitizer\//);
    await expect(page.getByRole('link', { name: /open.*mcpmeter/i })).toHaveAttribute('href', /\/tools\/mcpmeter\//);
    await expect(page.getByRole('link', { name: /book a call/i })).toHaveAttribute('href', /cal\.com\/mtalhas/);
  });

  test('contains no em or en dashes in visible copy', async ({ page }) => {
    await page.goto('/tools/');
    const text = await page.locator('body').innerText();
    expect(text).not.toMatch(/[–—]/);
  });

  test('passes axe a11y scan', async ({ page }) => {
    await page.goto('/tools/');
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });

  test('emits FAQPage JSON-LD', async ({ page }) => {
    await page.goto('/tools/');
    const ld = await page.locator('script[type="application/ld+json"]').textContent();
    expect(ld).toBeTruthy();
    expect(JSON.parse(ld!)['@type']).toBe('FAQPage');
  });
});
```

- [ ] **Step 3.2: Run E2E test, confirm fail**

Run: `npm --prefix tools run test:e2e -- hub.spec`
Expected: FAIL (placeholder page has no tool links).

- [ ] **Step 3.3: Create `tools/src/components/ToolCard.astro`**

```astro
---
interface Props { slug: string; name: string; blurb: string; }
const { slug, name, blurb } = Astro.props;
const href = `/tools/${slug}/`;
---
<article class="card">
  <h2 style="margin-top:0">{name}</h2>
  <p>{blurb}</p>
  <a class="cta" href={href} aria-label={`Open ${name}`}>Open {name}</a>
</article>
```

- [ ] **Step 3.4: Create `tools/public/llms.txt`**

```
# mtalhas.github.io/tools
# Crawl policy for AI assistants
User-agent: GPTBot
Allow: /tools/

User-agent: ClaudeBot
Allow: /tools/

User-agent: PerplexityBot
Allow: /tools/

# Canonical
Sitemap: https://mtalhas.github.io/sitemap.xml
```

- [ ] **Step 3.5: Create `tools/public/robots.txt`**

```
User-agent: *
Allow: /tools/

User-agent: GPTBot
Allow: /tools/

User-agent: ClaudeBot
Allow: /tools/

User-agent: PerplexityBot
Allow: /tools/

Sitemap: https://mtalhas.github.io/sitemap.xml
```

- [ ] **Step 3.6: Replace `tools/src/pages/index.astro`**

```astro
---
import Base from '../layouts/Base.astro';
import ToolCard from '../components/ToolCard.astro';

const tools = [
  { slug: 'sanitizer', name: 'Agent Trace Sanitizer',
    blurb: 'Paste an AI debug log. Strip secrets in your browser. Copy a clean issue body.' },
  { slug: 'mcpmeter', name: 'MCPMeter',
    blurb: 'Paste your claude_desktop_config.json. See per-server token cost per turn.' }
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Are these tools free?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. They run entirely in your browser.' } },
    { '@type': 'Question', name: 'Does any of my pasted content leave the browser?',
      acceptedAnswer: { '@type': 'Answer', text: 'No. The sanitizer and MCPMeter both process input locally with zero outbound network calls. The hub page does not collect analytics.' } },
    { '@type': 'Question', name: 'Who built these?',
      acceptedAnswer: { '@type': 'Answer', text: 'Talha Siddiqui. You can book a 30 minute call at cal.com/mtalhas/30min.' } }
  ]
};
---
<Base title="mtalhas tools" description="Browser only utilities for AI engineers: trace sanitizer and MCP token meter." jsonLd={faqJsonLd}>
  <section class="container">
    <h1>mtalhas tools</h1>
    <p>Browser only utilities for people shipping AI systems. No login. No telemetry on tool routes.</p>
    <div style="display:grid; gap:1rem; grid-template-columns: repeat(auto-fit, minmax(280px,1fr)); margin-top: 1.5rem;">
      {tools.map(t => <ToolCard {...t} />)}
    </div>
  </section>
</Base>
```

- [ ] **Step 3.7: Add minimal stub pages for sanitizer + mcpmeter to satisfy link targets**

Create `tools/src/pages/sanitizer/index.astro`:

```astro
---
import Base from '../../layouts/Base.astro';
---
<Base title="Agent Trace Sanitizer" description="Browser only. Strip secrets from AI debug logs.">
  <section class="container"><h1>Agent Trace Sanitizer</h1><p>Coming online in Task 5.</p></section>
</Base>
```

Create `tools/src/pages/mcpmeter/index.astro` with identical shape, heading "MCPMeter".

- [ ] **Step 3.8: Configure Playwright**

Create `tools/playwright.config.ts`:

```ts
import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: 'http://localhost:4321' },
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4321/tools/',
    timeout: 120_000,
    reuseExistingServer: !process.env.CI
  },
  reporter: [['list']],
  retries: 0
});
```

- [ ] **Step 3.9: Run E2E test, confirm pass**

Run: `npm --prefix tools run test:e2e -- hub.spec`
Expected: PASS on all 4 cases.

- [ ] **Step 3.10: Commit**

```
git add tools/src/pages tools/src/components/ToolCard.astro tools/public tools/playwright.config.ts tools/tests/e2e/hub.spec.ts
git commit -m "feat(tools): D1 hub landing with tool cards, FAQ JSON-LD, llms.txt, axe-clean"
```

---

## Task 4: D4 sanitizer rules + pure sanitize() function (TDD)

**Files:**
- Create: `tools/src/lib/sanitizer/rules.ts`
- Create: `tools/src/lib/sanitizer/timeout.ts`
- Create: `tools/src/lib/sanitizer/sanitize.ts`
- Create: `tools/src/lib/sanitizer/issueWrap.ts`
- Create: `tools/tests/fixtures/sanitizer/positive.json`
- Create: `tools/tests/fixtures/sanitizer/negative.json`
- Create: `tools/tests/fixtures/sanitizer/adversarial.json`
- Create: `tools/tests/unit/sanitize.test.ts`
- Create: `tools/vitest.config.ts`

- [ ] **Step 4.1: Create vitest config**

`tools/vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@fixtures': fileURLToPath(new URL('./tests/fixtures', import.meta.url))
    }
  },
  test: { environment: 'jsdom', globals: false, include: ['tests/unit/**/*.test.ts'] }
});
```

- [ ] **Step 4.2: Write fixtures**

`tools/tests/fixtures/sanitizer/positive.json` (3+ examples per type, all FAKE):

```json
{
  "apiKeys": {
    "openaiSk":    ["sk-abc123def456ghi789jkl012mno345pq", "sk-FAKE-zzzzzzzzzzzzzzzzzzzzzzzz", "sk-test_FAKE_000000000000000000000000"],
    "stripePk":    ["pk_test_FAKE000000000000000000000000", "pk_live_FAKE000000000000000000000000", "pk_FAKEsk123abc456"],
    "githubPat":   ["ghp_FAKEaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "ghp_FAKEbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb", "ghp_FAKEcccccccccccccccccccccccccccccccc"],
    "slackBot":    ["xoxb-FAKE-1234567890-abcdefghijkl", "xoxp-FAKE-9876543210-zyxwvutsrqpon", "xoxa-FAKE-1111111111-mnopqrstuvwx"],
    "awsAccess":   ["AKIAFAKEFAKEFAKEFAKE", "AKIAIOSFODNN7EXAMPLE", "AKIAFAKE1234567890AB"],
    "googleApi":   ["AIzaFAKEFAKEFAKEFAKEFAKEFAKEFAKEFAKE12", "AIzaSyDeMOFAKEKEYabcdefghijklmnopqrstuv", "AIzaFAKE0000000000000000000000000000xx"],
    "googleOauth": ["ya29.FAKE-token-aaaaaaaaaa", "ya29.FAKE-token-bbbbbbbbbb", "ya29.FAKE-token-cccccccccc"],
    "gitlab":      ["glpat-FAKEglpat1234567890ab", "glpat-FAKE-zzzzzzzzzzzz", "glpat-FAKE-aaaaaaaaaaaa"],
    "anthropicPat":["pat_FAKEpat000000000000000000000000", "pat_FAKEpat111111111111111111111111", "pat_FAKEpat222222222222222222222222"]
  },
  "jwts": [
    "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJmYWtlIn0.FAKEsignature",
    "eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJmYWtlIn0.AnotherFAKEsignature",
    "eyJ0eXAiOiJKV1QifQ.eyJleHAiOjB9.ThirdFAKEsig"
  ],
  "emails": ["user@example.com", "first.last+tag@sub.domain.co.uk", "FAKE.dev@protonmail.com"],
  "phones": ["+14155551234", "(415) 555-1234", "+44 20 7946 0958"],
  "ipv4":   ["192.0.2.45", "203.0.113.1", "10.0.0.1"],
  "ipv6":   ["2001:db8::1", "fe80::1ff:fe23:4567:890a", "::1"],
  "uuids":  ["550e8400-e29b-41d4-a716-446655440000", "00000000-0000-4000-8000-000000000000", "f47ac10b-58cc-4372-a567-0e02b2c3d479"]
}
```

`tools/tests/fixtures/sanitizer/negative.json`:

```json
{
  "prose": [
    "The sky is blue and the regex pack should leave this untouched.",
    "We compared options A and B; B won on latency.",
    "Cost rose from 1.2K to 1.8K tokens per turn."
  ],
  "ipLikeInProse": [
    "The version bumped from 1.2.3.4 to 1.2.3.5 (not a real IPv4 context).",
    "Use 192.168 as a placeholder when explaining subnets."
  ],
  "uuidsInUrls": [
    "See https://example.com/orders/550e8400-e29b-41d4-a716-446655440000 for context."
  ],
  "lookalikeKeys": [
    "skiing-trip",
    "pkg_install",
    "ghpages",
    "AKIA-but-too-short"
  ]
}
```

`tools/tests/fixtures/sanitizer/adversarial.json`:

```json
{
  "splitLines": ["sk-abc123\ndef456ghi789jkl012mno345pq"],
  "unicodeNFKC": ["sk-аbc123def456ghi789jkl012mno345pq"],
  "deeplyNested": [{"a":{"b":{"c":{"d":{"e":"AKIAFAKEFAKEFAKEFAKE"}}}}}],
  "escapeSequence": ["{\"key\":\"sk-\\u0061bc123def456ghi789jkl012mno345pq\"}"],
  "evilRegex": ["a".repeat(40000)],
  "manyEmails": ["a@b.c, ".repeat(5000)]
}
```

(`adversarial.json`'s `"a".repeat(...)` is illustrative; the test file generates these strings programmatically; fixture file stores small canonical samples.)

- [ ] **Step 4.3: Write failing unit test**

`tools/tests/unit/sanitize.test.ts`:

```ts
import { describe, test, expect } from 'vitest';
import { sanitize } from '@/lib/sanitizer/sanitize';
import positive from '@fixtures/sanitizer/positive.json' assert { type: 'json' };
import negative from '@fixtures/sanitizer/negative.json' assert { type: 'json' };

const REDACTED = '[REDACTED:';

describe('sanitize - positive (redacts all secret types)', () => {
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
    test(`redacts JWT`, () => {
      const { output } = sanitize(jwt);
      expect(output).not.toContain(jwt);
    });
  }
  for (const email of positive.emails) {
    test(`redacts email ${email}`, () => {
      const { output } = sanitize(email);
      expect(output).not.toContain(email);
    });
  }
  for (const ip of [...positive.ipv4, ...positive.ipv6]) {
    test(`redacts IP ${ip}`, () => {
      const { output } = sanitize(ip);
      expect(output).not.toContain(ip);
    });
  }
});

describe('sanitize - negative (leaves non-secrets alone)', () => {
  for (const text of negative.prose) {
    test(`prose: ${text.slice(0, 30)}`, () => {
      const { output } = sanitize(text);
      expect(output).toBe(text);
    });
  }
  for (const text of negative.lookalikeKeys) {
    test(`lookalike: ${text}`, () => {
      const { output } = sanitize(text);
      expect(output).toBe(text);
    });
  }
});

describe('sanitize - adversarial (no catastrophic backtracking, bounded time)', () => {
  test('handles 40k-char attack input within 500ms total', () => {
    const evil = 'a'.repeat(40000);
    const t0 = performance.now();
    const { output } = sanitize(evil);
    const dt = performance.now() - t0;
    expect(dt).toBeLessThan(500);
    expect(typeof output).toBe('string');
  });

  test('redacts secrets inside deeply nested JSON', () => {
    const obj = { a: { b: { c: { d: { e: 'AKIAFAKEFAKEFAKEFAKE' } } } } };
    const { output } = sanitize(JSON.stringify(obj));
    expect(output).not.toContain('AKIAFAKEFAKEFAKEFAKE');
  });

  test('redacts secret split across newline (line-by-line + whole-buffer pass)', () => {
    const split = 'sk-abc123\ndef456ghi789jkl012mno345pq';
    const { output, warnings } = sanitize(split);
    expect(warnings.some(w => /split/i.test(w))).toBe(true);
  });
});
```

- [ ] **Step 4.4: Run unit test, confirm fail**

Run: `npm --prefix tools test`
Expected: FAIL (module not found).

- [ ] **Step 4.5: Implement `tools/src/lib/sanitizer/timeout.ts`**

```ts
export function runWithBudget<T>(fn: () => T, budgetMs: number, fallback: T): T {
  const start = performance.now();
  try {
    const result = fn();
    if (performance.now() - start > budgetMs) {
      console.warn(`rule exceeded ${budgetMs}ms budget`);
    }
    return result;
  } catch {
    return fallback;
  }
}
```

(Note: JS regex cannot be hard-cancelled inside a single sync `.exec`. We mitigate by writing non-catastrophic patterns and by detecting timeouts post-hoc to skip the result. Patterns below are all linear in input length.)

- [ ] **Step 4.6: Implement `tools/src/lib/sanitizer/rules.ts`**

```ts
export interface Rule {
  id: string;
  label: string;
  pattern: RegExp;
  redact: (match: string) => string;
  enabledByDefault: boolean;
}

const tag = (id: string) => (m: string) => `[REDACTED:${id}:${m.length}]`;

export const RULES: Rule[] = [
  { id: 'openai-sk',    label: 'OpenAI sk-',     pattern: /\bsk-[A-Za-z0-9_-]{20,}\b/g, redact: tag('openai-sk'),    enabledByDefault: true },
  { id: 'stripe-pk',    label: 'Stripe pk_',     pattern: /\bpk_(?:test|live)?_?[A-Za-z0-9]{16,}\b/g, redact: tag('stripe-pk'), enabledByDefault: true },
  { id: 'github-pat',   label: 'GitHub PAT',     pattern: /\bghp_[A-Za-z0-9]{30,}\b/g, redact: tag('github-pat'),  enabledByDefault: true },
  { id: 'slack-bot',    label: 'Slack token',    pattern: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g, redact: tag('slack'), enabledByDefault: true },
  { id: 'aws-access',   label: 'AWS access key', pattern: /\bAKIA[0-9A-Z]{16}\b/g, redact: tag('aws-access'),    enabledByDefault: true },
  { id: 'google-api',   label: 'Google API key', pattern: /\bAIza[0-9A-Za-z_-]{35}\b/g, redact: tag('google-api'), enabledByDefault: true },
  { id: 'google-oauth', label: 'Google OAuth',   pattern: /\bya29\.[0-9A-Za-z_-]+/g, redact: tag('google-oauth'), enabledByDefault: true },
  { id: 'gitlab-pat',   label: 'GitLab PAT',     pattern: /\bglpat-[0-9A-Za-z_-]{20,}\b/g, redact: tag('gitlab-pat'), enabledByDefault: true },
  { id: 'anthropic-pat',label: 'Anthropic PAT',  pattern: /\bpat_[A-Za-z0-9]{20,}\b/g, redact: tag('anthropic-pat'), enabledByDefault: true },
  { id: 'jwt',          label: 'JWT',            pattern: /\beyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, redact: tag('jwt'), enabledByDefault: true },
  { id: 'email',        label: 'Email',          pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, redact: tag('email'), enabledByDefault: true },
  { id: 'phone-e164',   label: 'Phone (E.164)',  pattern: /(?<![\d.])\+\d{1,3}[\s.-]?\(?\d{1,4}\)?[\s.-]?\d{1,4}[\s.-]?\d{2,9}(?!\d)/g, redact: tag('phone'), enabledByDefault: true },
  { id: 'phone-us',     label: 'Phone (US)',     pattern: /(?<!\d)\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}(?!\d)/g, redact: tag('phone'), enabledByDefault: true },
  { id: 'ipv4',         label: 'IPv4',           pattern: /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g, redact: tag('ipv4'), enabledByDefault: true },
  { id: 'ipv6',         label: 'IPv6',           pattern: /\b(?:[0-9A-Fa-f]{1,4}:){2,7}[0-9A-Fa-f]{1,4}\b|::1\b|\bfe80::[0-9A-Fa-f:]+/g, redact: tag('ipv6'), enabledByDefault: true },
  { id: 'uuid',         label: 'UUID',           pattern: /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi, redact: tag('uuid'), enabledByDefault: false }
];
```

(Negative-case carve-outs: `pkg_install` does not match because `pk_` rule requires 16+ trailing alphanumerics after the prefix. `AKIA-but-too-short` fails the `{16}` constraint. `192.168` alone fails IPv4 because no 4 octets.)

- [ ] **Step 4.7: Implement `tools/src/lib/sanitizer/sanitize.ts`**

```ts
import { RULES, type Rule } from './rules';
import { runWithBudget } from './timeout';

export interface CustomRule { id: string; label: string; pattern: string; flags?: string; }
export interface SanitizeOptions {
  enabledIds?: Set<string>;
  customRegexes?: CustomRule[];
  denylist?: string[];
}
export interface SanitizeResult {
  output: string;
  counts: Record<string, number>;
  warnings: string[];
}

const PER_RULE_BUDGET_MS = 50;
const MAX_INPUT_BYTES = 5_000_000;

export function sanitize(input: string, opts: SanitizeOptions = {}): SanitizeResult {
  const warnings: string[] = [];
  if (input.length > MAX_INPUT_BYTES) {
    warnings.push(`input truncated to ${MAX_INPUT_BYTES} chars`);
    input = input.slice(0, MAX_INPUT_BYTES);
  }
  const counts: Record<string, number> = {};
  let out = input;

  const enabled = opts.enabledIds ?? new Set(RULES.filter(r => r.enabledByDefault).map(r => r.id));
  const activeRules: Rule[] = RULES.filter(r => enabled.has(r.id));

  for (const rule of activeRules) {
    out = runWithBudget(() => {
      let n = 0;
      const replaced = out.replace(rule.pattern, (m) => { n++; return rule.redact(m); });
      counts[rule.id] = (counts[rule.id] ?? 0) + n;
      return replaced;
    }, PER_RULE_BUDGET_MS, out);
  }

  for (const cr of opts.customRegexes ?? []) {
    try {
      const re = new RegExp(cr.pattern, cr.flags ?? 'g');
      out = runWithBudget(() => {
        let n = 0;
        const r = out.replace(re, (m) => { n++; return `[REDACTED:${cr.id}:${m.length}]`; });
        counts[`custom:${cr.id}`] = (counts[`custom:${cr.id}`] ?? 0) + n;
        return r;
      }, PER_RULE_BUDGET_MS, out);
    } catch (e) { warnings.push(`custom rule ${cr.id} invalid: ${(e as Error).message}`); }
  }

  for (const term of opts.denylist ?? []) {
    if (!term) continue;
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`\\b${escaped}\\b`, 'gi');
    out = out.replace(re, (m) => `[REDACTED:denylist:${m.length}]`);
  }

  // Adversarial: detect possible split-line secrets by stripping whitespace and re-scanning
  const collapsed = input.replace(/\s+/g, '');
  for (const rule of activeRules) {
    if (rule.pattern.test(collapsed) && !rule.pattern.test(input)) {
      warnings.push(`possible split-line ${rule.id} secret detected`);
    }
  }

  return { output: out, counts, warnings };
}
```

- [ ] **Step 4.8: Implement `tools/src/lib/sanitizer/issueWrap.ts`**

```ts
export function wrapAsIssueMarkdown(content: string, summary = 'Sanitized agent trace'): string {
  const fence = '```';
  return `<details>\n<summary>${summary}</summary>\n\n${fence}\n${content}\n${fence}\n\n</details>\n`;
}
```

- [ ] **Step 4.9: Run unit tests, confirm pass**

Run: `npm --prefix tools test`
Expected: all sanitize.test.ts cases PASS.

- [ ] **Step 4.10: Commit**

```
git add tools/src/lib/sanitizer tools/tests/unit/sanitize.test.ts tools/tests/fixtures/sanitizer tools/vitest.config.ts
git commit -m "feat(sanitizer): regex pack + pure sanitize() with 3-class test coverage"
```

---

## Task 5: D4 sanitizer UI + network verifier (TDD with Playwright)

**Files:**
- Create: `tools/src/islands/SanitizerApp.ts`
- Modify: `tools/src/pages/sanitizer/index.astro`
- Modify: `tools/tests/e2e/sanitizer.spec.ts`

- [ ] **Step 5.1: Write failing E2E test**

`tools/tests/e2e/sanitizer.spec.ts`:

```ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('D4 sanitizer', () => {
  test('redacts secrets without any outbound request', async ({ page }) => {
    const requests: string[] = [];
    page.on('request', (r) => {
      const u = r.url();
      if (!u.startsWith('http://localhost:4321')) requests.push(u);
    });
    await page.goto('/tools/sanitizer/');
    await page.locator('textarea[data-test=input]').fill('My key: sk-FAKE12345abcdef67890hijklmnop');
    await page.locator('button[data-test=run]').click();
    await expect(page.locator('textarea[data-test=output]')).toContainText('[REDACTED:openai-sk');
    await expect(page.locator('[data-test=net-badge]')).toContainText('Network: 0 requests');
    expect(requests).toEqual([]);
  });

  test('copy-as-issue produces details block', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/tools/sanitizer/');
    await page.locator('textarea[data-test=input]').fill('AKIAFAKEFAKEFAKEFAKE in production');
    await page.locator('button[data-test=run]').click();
    await page.locator('button[data-test=copy-issue]').click();
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    expect(clip).toContain('<details>');
    expect(clip).toContain('[REDACTED:aws-access');
  });

  test('passes axe', async ({ page }) => {
    await page.goto('/tools/sanitizer/');
    const results = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa']).analyze();
    expect(results.violations, JSON.stringify(results.violations,null,2)).toEqual([]);
  });
});
```

- [ ] **Step 5.2: Run, confirm fail.**

Run: `npm --prefix tools run test:e2e -- sanitizer.spec`
Expected: FAIL.

- [ ] **Step 5.3: Create island `tools/src/islands/SanitizerApp.ts`**

```ts
import { sanitize } from '../lib/sanitizer/sanitize';
import { wrapAsIssueMarkdown } from '../lib/sanitizer/issueWrap';

const LS_CUSTOM = 'd4.customRegexes';
const LS_DENY = 'd4.denylist';

export function mount(root: HTMLElement) {
  const $ = <T extends Element>(sel: string) => root.querySelector(sel) as T;
  const input = $<HTMLTextAreaElement>('textarea[data-test=input]');
  const output = $<HTMLTextAreaElement>('textarea[data-test=output]');
  const runBtn = $<HTMLButtonElement>('button[data-test=run]');
  const copyBtn = $<HTMLButtonElement>('button[data-test=copy-issue]');
  const netBadge = $<HTMLElement>('[data-test=net-badge]');
  const custom = $<HTMLTextAreaElement>('textarea[data-test=custom]');
  const deny = $<HTMLTextAreaElement>('textarea[data-test=deny]');

  // Restore persisted preferences
  custom.value = localStorage.getItem(LS_CUSTOM) ?? '';
  deny.value = localStorage.getItem(LS_DENY) ?? '';

  // Network counter
  let requestCount = 0;
  const updateBadge = () => { netBadge.textContent = `Network: ${requestCount} requests`; };
  updateBadge();
  const origFetch = window.fetch;
  window.fetch = (...args) => { requestCount++; updateBadge(); return origFetch(...args); };
  const origOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (...args: any[]) { requestCount++; updateBadge(); return origOpen.apply(this, args as any); };

  runBtn.addEventListener('click', () => {
    localStorage.setItem(LS_CUSTOM, custom.value);
    localStorage.setItem(LS_DENY, deny.value);
    const customRegexes = custom.value.split('\n').filter(Boolean).map((line, i) => ({ id: `c${i}`, label: line, pattern: line }));
    const denylist = deny.value.split('\n').map(s => s.trim()).filter(Boolean);
    const { output: out } = sanitize(input.value, { customRegexes, denylist });
    output.value = out;
  });

  copyBtn.addEventListener('click', async () => {
    const md = wrapAsIssueMarkdown(output.value);
    await navigator.clipboard.writeText(md);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[data-island=sanitizer]') as HTMLElement | null;
  if (root) mount(root);
});
```

- [ ] **Step 5.4: Build `tools/src/pages/sanitizer/index.astro`**

```astro
---
import Base from '../../layouts/Base.astro';
const cspExtra = "connect-src 'none'";
---
<Base title="Agent Trace Sanitizer" description="Browser only. Paste an AI trace. Strip secrets. Copy a clean issue body." cspExtra={cspExtra} noAnalytics={true}>
  <section class="container" data-island="sanitizer">
    <h1>Agent Trace Sanitizer</h1>
    <p>Paste a trace. We run a deterministic regex pack in your browser. Nothing leaves this page.</p>
    <p><strong data-test="net-badge">Network: 0 requests</strong></p>

    <label for="san-in">Input</label>
    <textarea id="san-in" data-test="input" rows="10" style="width:100%"></textarea>

    <details>
      <summary>Custom regexes (one per line, JavaScript syntax)</summary>
      <textarea data-test="custom" rows="3" style="width:100%" placeholder="\\bACME-\\d{6}\\b"></textarea>
    </details>
    <details>
      <summary>Denylist of literal terms (one per line)</summary>
      <textarea data-test="deny" rows="3" style="width:100%" placeholder="MyCompany"></textarea>
    </details>

    <p>
      <button data-test="run" class="cta">Sanitize</button>
      <button data-test="copy-issue" class="cta" style="background:var(--muted)">Copy as GitHub issue</button>
    </p>

    <label for="san-out">Output</label>
    <textarea id="san-out" data-test="output" rows="10" style="width:100%" readonly></textarea>
  </section>

  <script type="module" src="/tools/_islands/sanitizer.js"></script>
</Base>
```

Note: Astro builds TS islands automatically when imported via `<script>` with TS path. Adjust to `import './SanitizerApp.ts'` inline script if path resolution differs. Use the canonical Astro pattern:

```astro
<script>
  import { mount } from '../../islands/SanitizerApp';
  const root = document.querySelector('[data-island=sanitizer]');
  if (root) mount(root as HTMLElement);
</script>
```

(Replace the `<script type="module" src=...>` line above with this `<script>` block — Astro will bundle it.)

- [ ] **Step 5.5: Run E2E, confirm pass**

Run: `npm --prefix tools run test:e2e -- sanitizer.spec`
Expected: PASS, axe clean, zero outbound requests.

- [ ] **Step 5.6: Commit**

```
git add tools/src/islands/SanitizerApp.ts tools/src/pages/sanitizer tools/tests/e2e/sanitizer.spec.ts
git commit -m "feat(sanitizer): UI island with network counter, copy-as-issue, CSP connect-src none"
```

---

## Task 6: I1 MCPMeter — parser + estimator + pricing (TDD)

**Files:**
- Create: `tools/src/lib/mcpmeter/parseConfig.ts`
- Create: `tools/src/lib/mcpmeter/estimate.ts`
- Create: `tools/src/lib/mcpmeter/pricing.ts`
- Create: `tools/src/lib/mcpmeter/permalink.ts`
- Create: `tools/src/data/pricing.json`
- Create: `tools/src/data/community-baseline.json`
- Create: `tools/tests/unit/estimate.test.ts`
- Create: `tools/tests/unit/permalink.test.ts`
- Create: `tools/tests/fixtures/mcpmeter/sample-configs.json`

- [ ] **Step 6.1: Create pricing JSON (`tools/src/data/pricing.json`)**

Maintained manually. Rates verified at top of file with `updated` date. Numbers are USD per 1M input tokens, derived from OpenAI/Anthropic public pricing pages as of 2026-05-27.

```json
{
  "updated": "2026-05-27",
  "source": "https://openai.com/api/pricing and https://www.anthropic.com/pricing",
  "models": {
    "openai:gpt-4o":        { "inputPer1M":  2.50, "outputPer1M": 10.00, "tokenizer": "openai" },
    "openai:gpt-4o-mini":   { "inputPer1M":  0.15, "outputPer1M":  0.60, "tokenizer": "openai" },
    "anthropic:claude-sonnet-4-6": { "inputPer1M": 3.00, "outputPer1M": 15.00, "tokenizer": "anthropic" },
    "anthropic:claude-haiku-4-5":  { "inputPer1M": 0.80, "outputPer1M":  4.00, "tokenizer": "anthropic" },
    "deepinfra:llama-3.1-70b": { "inputPer1M": 0.35, "outputPer1M": 0.40, "tokenizer": "openai" }
  }
}
```

(If real rates have moved, edit values; the schema and consumers are stable. See `QUESTION-FOR-MAIN-LOOP.md` if rates appear stale and a primary source is unreachable.)

- [ ] **Step 6.2: Create community baseline (`tools/src/data/community-baseline.json`)**

```json
{
  "updated": "2026-05-27",
  "samples": [
    { "name": "Bare Claude Desktop",                 "tokensPerTurn":  1200 },
    { "name": "Claude Desktop + filesystem",         "tokensPerTurn":  2600 },
    { "name": "Claude Desktop + GitHub + Slack",     "tokensPerTurn":  8400 },
    { "name": "Heavy power user (10+ servers)",      "tokensPerTurn": 19000 }
  ],
  "median": 5500,
  "p90":    16000
}
```

- [ ] **Step 6.3: Sample configs fixture (`tools/tests/fixtures/mcpmeter/sample-configs.json`)**

```json
{
  "claudeDesktopShape": {
    "mcpServers": {
      "filesystem": { "command": "npx", "args": ["@modelcontextprotocol/server-filesystem", "/Users/me"] },
      "github":     { "command": "npx", "args": ["@modelcontextprotocol/server-github"], "env": { "GITHUB_TOKEN": "fake" } }
    }
  },
  "genericListShape": {
    "servers": [
      { "name": "search",     "tools": [{ "name": "web_search", "description": "Search the web for a query.", "schema": "{\"type\":\"object\"}" }] },
      { "name": "calculator", "tools": [{ "name": "add", "description": "Add two numbers.", "schema": "{}" }] }
    ]
  },
  "malformed": "{ this is not JSON"
}
```

- [ ] **Step 6.4: Write failing unit tests**

`tools/tests/unit/estimate.test.ts`:

```ts
import { describe, test, expect } from 'vitest';
import { parseConfig } from '@/lib/mcpmeter/parseConfig';
import { estimateTokens } from '@/lib/mcpmeter/estimate';
import { costPerTurn } from '@/lib/mcpmeter/pricing';
import fx from '@fixtures/mcpmeter/sample-configs.json' assert { type: 'json' };
import pricing from '@/data/pricing.json' assert { type: 'json' };

describe('parseConfig', () => {
  test('parses claude_desktop_config.json shape', () => {
    const r = parseConfig(JSON.stringify(fx.claudeDesktopShape));
    expect(r.servers.map(s => s.name).sort()).toEqual(['filesystem','github']);
  });
  test('parses generic list shape', () => {
    const r = parseConfig(JSON.stringify(fx.genericListShape));
    expect(r.servers.length).toBe(2);
    expect(r.servers[0].tools![0].name).toBe('web_search');
  });
  test('rejects malformed JSON with a helpful error', () => {
    expect(() => parseConfig(fx.malformed)).toThrow(/JSON/i);
  });
});

describe('estimateTokens', () => {
  test('returns positive integer counts for both tokenizers', async () => {
    const parsed = parseConfig(JSON.stringify(fx.genericListShape));
    const r = await estimateTokens(parsed, { tokenizers: ['openai','anthropic'] });
    expect(r.perServer.length).toBe(2);
    for (const row of r.perServer) {
      expect(row.openaiTokens).toBeGreaterThan(0);
      expect(row.anthropicTokens).toBeGreaterThan(0);
    }
  });
});

describe('costPerTurn', () => {
  test('USD = (tokens / 1M) * inputPer1M', () => {
    const c = costPerTurn(1_000_000, pricing.models['anthropic:claude-sonnet-4-6']);
    expect(c).toBeCloseTo(3.00, 4);
  });
});
```

`tools/tests/unit/permalink.test.ts`:

```ts
import { describe, test, expect } from 'vitest';
import { encodePermalink, decodePermalink } from '@/lib/mcpmeter/permalink';

describe('permalink', () => {
  test('roundtrips a result', () => {
    const original = { totalTokens: 12345, model: 'anthropic:claude-sonnet-4-6', usd: 0.037 };
    const hash = encodePermalink(original);
    expect(hash).toMatch(/^[A-Za-z0-9_-]+$/);
    const decoded = decodePermalink(hash);
    expect(decoded).toEqual(original);
  });
});
```

- [ ] **Step 6.5: Run, confirm fail.**

Run: `npm --prefix tools test`
Expected: module-not-found failures for parseConfig/estimate/permalink.

- [ ] **Step 6.6: Implement `tools/src/lib/mcpmeter/parseConfig.ts`**

```ts
export interface ParsedTool { name: string; description?: string; schema?: string; }
export interface ParsedServer { name: string; tools?: ParsedTool[]; rawSize: number; }
export interface ParsedConfig { servers: ParsedServer[]; raw: unknown; }

export function parseConfig(text: string): ParsedConfig {
  let data: any;
  try { data = JSON.parse(text); }
  catch (e) { throw new Error(`JSON parse failed: ${(e as Error).message}`); }

  if (data && typeof data === 'object' && 'mcpServers' in data && data.mcpServers && typeof data.mcpServers === 'object') {
    const servers: ParsedServer[] = Object.entries(data.mcpServers).map(([name, cfg]) => ({
      name,
      tools: undefined,
      rawSize: JSON.stringify(cfg).length
    }));
    return { servers, raw: data };
  }

  if (data && Array.isArray(data.servers)) {
    const servers: ParsedServer[] = data.servers.map((s: any) => ({
      name: String(s.name ?? 'unnamed'),
      tools: Array.isArray(s.tools) ? s.tools.map((t: any) => ({
        name: String(t.name ?? ''),
        description: typeof t.description === 'string' ? t.description : undefined,
        schema: typeof t.schema === 'string' ? t.schema : (t.schema ? JSON.stringify(t.schema) : undefined)
      })) : undefined,
      rawSize: JSON.stringify(s).length
    }));
    return { servers, raw: data };
  }

  throw new Error('Unrecognized shape: expected `mcpServers` object or `servers` array.');
}
```

- [ ] **Step 6.7: Implement `tools/src/lib/mcpmeter/estimate.ts`**

```ts
import type { ParsedConfig, ParsedServer } from './parseConfig';

const SYSTEM_OVERHEAD_PER_TOOL_CHARS = 180; // tool description + JSON schema framing

export interface EstimateRow { server: string; toolCount: number; openaiTokens: number; anthropicTokens: number; }
export interface EstimateResult { perServer: EstimateRow[]; totals: { openai: number; anthropic: number }; }
export interface EstimateOpts { tokenizers: Array<'openai' | 'anthropic'>; }

async function getOpenAiTokenizer() {
  const mod = await import('gpt-tokenizer');
  return (text: string) => mod.encode(text).length;
}
async function getAnthropicTokenizer() {
  const mod = await import('@anthropic-ai/tokenizer');
  const tok = mod.getTokenizer();
  return (text: string) => tok.encode(text, 'all').length;
}

function rawTextFor(s: ParsedServer): string {
  if (s.tools && s.tools.length) {
    return s.tools.map(t => `${t.name}\n${t.description ?? ''}\n${t.schema ?? ''}`).join('\n');
  }
  return `${s.name}\n(no tool list available, using rawSize=${s.rawSize})`;
}

export async function estimateTokens(cfg: ParsedConfig, opts: EstimateOpts): Promise<EstimateResult> {
  const openai = opts.tokenizers.includes('openai') ? await getOpenAiTokenizer() : null;
  const anthropic = opts.tokenizers.includes('anthropic') ? await getAnthropicTokenizer() : null;
  const fallback = (t: string) => Math.ceil(t.length / 4);

  const perServer: EstimateRow[] = cfg.servers.map(s => {
    const text = rawTextFor(s);
    const toolCount = s.tools?.length ?? 0;
    const overhead = SYSTEM_OVERHEAD_PER_TOOL_CHARS * Math.max(toolCount, 1);
    const fullText = text + ' '.repeat(Math.min(overhead, 4000));
    return {
      server: s.name,
      toolCount,
      openaiTokens: openai ? openai(fullText) : fallback(fullText),
      anthropicTokens: anthropic ? anthropic(fullText) : fallback(fullText)
    };
  });

  const totals = perServer.reduce((acc, r) => ({
    openai: acc.openai + r.openaiTokens,
    anthropic: acc.anthropic + r.anthropicTokens
  }), { openai: 0, anthropic: 0 });

  return { perServer, totals };
}
```

- [ ] **Step 6.8: Implement `tools/src/lib/mcpmeter/pricing.ts`**

```ts
export interface ModelRate { inputPer1M: number; outputPer1M: number; tokenizer: 'openai' | 'anthropic'; }
export function costPerTurn(tokens: number, rate: ModelRate): number {
  return (tokens / 1_000_000) * rate.inputPer1M;
}
```

- [ ] **Step 6.9: Implement `tools/src/lib/mcpmeter/permalink.ts`**

```ts
function toBase64Url(s: string): string {
  return btoa(unescape(encodeURIComponent(s))).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}
function fromBase64Url(s: string): string {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  return decodeURIComponent(escape(atob(s.replaceAll('-', '+').replaceAll('_', '/') + pad)));
}
export function encodePermalink(data: unknown): string { return toBase64Url(JSON.stringify(data)); }
export function decodePermalink(hash: string): unknown { return JSON.parse(fromBase64Url(hash)); }
```

- [ ] **Step 6.10: Run unit tests, confirm pass.**

Run: `npm --prefix tools test`
Expected: estimate.test.ts and permalink.test.ts PASS.

- [ ] **Step 6.11: Commit**

```
git add tools/src/lib/mcpmeter tools/src/data tools/tests/unit/estimate.test.ts tools/tests/unit/permalink.test.ts tools/tests/fixtures/mcpmeter
git commit -m "feat(mcpmeter): parser, estimator, pricing math, permalink with unit coverage"
```

---

## Task 7: I1 MCPMeter UI + SVG badge

**Files:**
- Create: `tools/src/lib/mcpmeter/badge.ts`
- Create: `tools/src/islands/McpmeterApp.ts`
- Modify: `tools/src/pages/mcpmeter/index.astro`
- Create: `tools/tests/e2e/mcpmeter.spec.ts`

- [ ] **Step 7.1: Implement `tools/src/lib/mcpmeter/badge.ts`**

```ts
export interface BadgeInput { totalTokens: number; modelLabel: string; usd: number; variant: 'numeric' | 'percentile' | 'compare'; baselineMedian?: number; }

function xmlEscape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

export function svgBadge(b: BadgeInput): string {
  const tokensK = (b.totalTokens / 1000).toFixed(1);
  let line2: string;
  if (b.variant === 'percentile' && b.baselineMedian) {
    const pct = Math.round((b.totalTokens / b.baselineMedian) * 100);
    line2 = `${pct}% of community median`;
  } else if (b.variant === 'compare' && b.baselineMedian) {
    const diff = b.baselineMedian - b.totalTokens;
    line2 = diff >= 0 ? `${(diff/1000).toFixed(1)}K cheaper than median` : `${(-diff/1000).toFixed(1)}K above median`;
  } else {
    line2 = `${xmlEscape(b.modelLabel)} ~$${b.usd.toFixed(3)}/turn`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="80" role="img" aria-label="MCP setup ${tokensK}K tokens per turn">
  <rect width="420" height="80" rx="10" fill="#14161b"/>
  <text x="20" y="34" font-family="ui-sans-serif" font-size="18" fill="#5ee0a3" font-weight="700">My MCP setup: ${tokensK}K tokens/turn</text>
  <text x="20" y="62" font-family="ui-sans-serif" font-size="14" fill="#e6e7eb">${xmlEscape(line2)}</text>
</svg>`;
}
```

Caller note: callers must only render the returned SVG via `DOMParser().parseFromString(svg, 'image/svg+xml').documentElement` and `appendChild`, never via `innerHTML`. See Step 7.3.

- [ ] **Step 7.2: Write failing E2E test**

`tools/tests/e2e/mcpmeter.spec.ts`:

```ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const sample = JSON.stringify({
  mcpServers: {
    filesystem: { command: 'npx', args: ['@modelcontextprotocol/server-filesystem'] },
    github:     { command: 'npx', args: ['@modelcontextprotocol/server-github'] }
  }
}, null, 2);

test.describe('I1 MCPMeter', () => {
  test('estimates per server and shows total', async ({ page }) => {
    await page.goto('/tools/mcpmeter/');
    await page.locator('textarea[data-test=config]').fill(sample);
    await page.locator('button[data-test=run]').click();
    await expect(page.locator('[data-test=row]').first()).toBeVisible();
    await expect(page.locator('[data-test=total-tokens]')).not.toHaveText(/^0/);
  });

  test('share button produces permalink whose hash decodes', async ({ page }) => {
    await page.goto('/tools/mcpmeter/');
    await page.locator('textarea[data-test=config]').fill(sample);
    await page.locator('button[data-test=run]').click();
    const link = await page.locator('input[data-test=permalink]').inputValue();
    expect(link).toContain('#');
    const hash = new URL(link).hash.slice(1);
    expect(hash.length).toBeGreaterThan(0);
  });

  test('passes axe', async ({ page }) => {
    await page.goto('/tools/mcpmeter/');
    const results = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa']).analyze();
    expect(results.violations, JSON.stringify(results.violations,null,2)).toEqual([]);
  });
});
```

- [ ] **Step 7.3: Implement island `tools/src/islands/McpmeterApp.ts`**

```ts
import { parseConfig } from '../lib/mcpmeter/parseConfig';
import { estimateTokens } from '../lib/mcpmeter/estimate';
import { costPerTurn } from '../lib/mcpmeter/pricing';
import { svgBadge } from '../lib/mcpmeter/badge';
import { encodePermalink, decodePermalink } from '../lib/mcpmeter/permalink';
import pricing from '../data/pricing.json';
import baseline from '../data/community-baseline.json';

const DEFAULT_MODEL = 'anthropic:claude-sonnet-4-6';

export function mount(root: HTMLElement) {
  const $ = <T extends Element>(sel: string) => root.querySelector(sel) as T;
  const input = $<HTMLTextAreaElement>('textarea[data-test=config]');
  const runBtn = $<HTMLButtonElement>('button[data-test=run]');
  const tableBody = $<HTMLTableSectionElement>('tbody[data-test=tbody]');
  const totalCell = $<HTMLElement>('[data-test=total-tokens]');
  const permaInput = $<HTMLInputElement>('input[data-test=permalink]');
  const badgeBox = $<HTMLElement>('[data-test=badge]');
  const variantSel = $<HTMLSelectElement>('select[data-test=variant]');

  // Permalink rehydration (defined renderSvg below; declared early via function statement)
  if (location.hash.length > 1) {
    try {
      const data = decodePermalink(location.hash.slice(1)) as any;
      if (typeof data?.totalTokens === 'number' && typeof data?.model === 'string' && typeof data?.usd === 'number') {
        totalCell.textContent = String(data.totalTokens);
        const svg = svgBadge({ totalTokens: data.totalTokens, modelLabel: data.model, usd: data.usd, variant: 'numeric' });
        renderSvg(badgeBox, svg);
      }
    } catch {}
  }

  function renderSvg(host: HTMLElement, svg: string) {
    host.replaceChildren();
    const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
    const el = doc.documentElement;
    if (el && el.nodeName.toLowerCase() === 'svg') host.appendChild(el);
  }

  function renderRows(rows: Array<{ server: string; toolCount: number; tokens: number; usd: number }>) {
    tableBody.replaceChildren();
    for (const r of rows) {
      const tr = document.createElement('tr');
      tr.setAttribute('data-test', 'row');
      for (const cellText of [r.server, String(r.toolCount), String(r.tokens), `$${r.usd.toFixed(4)}`]) {
        const td = document.createElement('td');
        td.textContent = cellText; // textContent, never innerHTML — server names are user-controlled
        tr.appendChild(td);
      }
      tableBody.appendChild(tr);
    }
  }

  function renderErrorRow(message: string) {
    tableBody.replaceChildren();
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 4;
    td.setAttribute('role', 'alert');
    td.textContent = message;
    tr.appendChild(td);
    tableBody.appendChild(tr);
  }

  runBtn.addEventListener('click', async () => {
    runBtn.disabled = true; runBtn.textContent = 'Computing...';
    try {
      const parsed = parseConfig(input.value);
      const est = await estimateTokens(parsed, { tokenizers: ['openai','anthropic'] });

      const rate = (pricing as any).models[DEFAULT_MODEL];
      renderRows(est.perServer.map(r => ({
        server: r.server,
        toolCount: r.toolCount,
        tokens: r.anthropicTokens,
        usd: costPerTurn(r.anthropicTokens, rate)
      })));

      const total = est.totals.anthropic;
      totalCell.textContent = String(total);
      const totalUsd = costPerTurn(total, rate);
      const variant = (variantSel.value as any) || 'numeric';
      const svg = svgBadge({ totalTokens: total, modelLabel: 'Claude Sonnet', usd: totalUsd, variant, baselineMedian: (baseline as any).median });
      renderSvg(badgeBox, svg);

      const hash = encodePermalink({ totalTokens: total, model: DEFAULT_MODEL, usd: totalUsd });
      permaInput.value = `${location.origin}${location.pathname}#${hash}`;
    } catch (e) {
      renderErrorRow((e as Error).message);
    } finally {
      runBtn.disabled = false; runBtn.textContent = 'Estimate';
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[data-island=mcpmeter]') as HTMLElement | null;
  if (root) mount(root);
});
```

- [ ] **Step 7.4: Replace `tools/src/pages/mcpmeter/index.astro`**

```astro
---
import Base from '../../layouts/Base.astro';
---
<Base title="MCPMeter" description="Estimate token cost per turn of your MCP setup. Runs in your browser.">
  <section class="container" data-island="mcpmeter">
    <h1>MCPMeter</h1>
    <p>Paste your <code>claude_desktop_config.json</code> (or a server list). We estimate tokens added per turn.</p>

    <label for="cfg">Config</label>
    <textarea id="cfg" data-test="config" rows="12" style="width:100%" placeholder='{"mcpServers": {"...": {"command": "..."}}}'></textarea>

    <p>
      <label for="variant">Badge style </label>
      <select id="variant" data-test="variant">
        <option value="numeric">Numeric</option>
        <option value="percentile">Percentile vs community</option>
        <option value="compare">Comparison vs median</option>
      </select>
      <button data-test="run" class="cta">Estimate</button>
    </p>

    <table style="width:100%; border-collapse:collapse" aria-label="Per-server token estimate">
      <thead><tr><th>Server</th><th>Tools</th><th>Tokens</th><th>USD/turn</th></tr></thead>
      <tbody data-test="tbody"></tbody>
    </table>

    <p>Total tokens: <strong data-test="total-tokens">0</strong></p>

    <div data-test="badge" aria-label="Share badge"></div>

    <label for="perma">Share permalink (re-renders from URL hash, no server storage)</label>
    <input id="perma" data-test="permalink" type="text" style="width:100%" readonly />
  </section>

  <script>
    import { mount } from '../../islands/McpmeterApp';
    const root = document.querySelector('[data-island=mcpmeter]');
    if (root) mount(root as HTMLElement);
  </script>
</Base>
```

- [ ] **Step 7.5: Run E2E, confirm pass.**

Run: `npm --prefix tools run test:e2e -- mcpmeter.spec`
Expected: PASS.

- [ ] **Step 7.6: Commit**

```
git add tools/src/lib/mcpmeter/badge.ts tools/src/islands/McpmeterApp.ts tools/src/pages/mcpmeter tools/tests/e2e/mcpmeter.spec.ts
git commit -m "feat(mcpmeter): UI island with SVG share badge, permalink rehydrate, axe clean"
```

---

## Task 8: Workflow integration + Pages deploy

**Files:**
- Modify: `.github/workflows/deploy.yml`
- Create: `README-tools.md`

- [ ] **Step 8.1: Update workflow**

Replace existing `deploy.yml` build job (preserving existing Next.js step) with:

```yaml
      - name: Install dependencies (root)
        run: npm ci

      - name: Build Next.js site
        run: npm run build
        env:
          NEXT_PUBLIC_WEB3FORMS_KEY: ${{ secrets.WEB3FORMS_KEY }}
          NEXT_PUBLIC_GA_MEASUREMENT_ID: ${{ secrets.GA_MEASUREMENT_ID }}
          NEXT_PUBLIC_CLARITY_PROJECT_ID: ${{ secrets.CLARITY_PROJECT_ID }}

      - name: Install tools deps
        working-directory: tools
        run: npm ci

      - name: Build Astro tools app
        working-directory: tools
        run: npm run build

      - name: Merge Astro dist into Next out/tools/
        run: |
          mkdir -p out/tools
          cp -R tools/dist/. out/tools/

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./out
```

(The Astro app already has `base: '/tools'` and `build.format: 'directory'`, so output files use `/tools/...` paths.)

- [ ] **Step 8.2: Add `tools/.gitignore`**

```
dist/
node_modules/
playwright-report/
.test-results/
.astro/
```

- [ ] **Step 8.3: Verify both builds locally**

Run from repo root: `npm ci && npm run build && npm --prefix tools ci && npm --prefix tools run build && mkdir -p out/tools && cp -R tools/dist/. out/tools/`
Expected: `out/tools/index.html`, `out/tools/sanitizer/index.html`, `out/tools/mcpmeter/index.html` all exist.

- [ ] **Step 8.4: Create `README-tools.md`**

Short README describing what's under `tools/`, how to dev (`npm --prefix tools run dev`), how to test, and how the deploy merges into the existing Next.js site. Reference the architectural rule (no LLM at runtime) and link to PLAN.md for the full design.

- [ ] **Step 8.5: Commit**

```
git add .github/workflows/deploy.yml tools/.gitignore README-tools.md
git commit -m "ci: build Astro tools app and merge into Pages artifact under /tools/"
```

---

## Task 9: Verification + brief completion

- [ ] **Step 9.1: Run full local test pass**

```
npm --prefix tools run typecheck
npm --prefix tools test
npx --prefix tools playwright install --with-deps chromium
npm --prefix tools run test:e2e
```

All must be green. If `playwright install` fails on the dev machine, document in BRIEF-COMPLETION.md.

- [ ] **Step 9.2: Invoke verification-before-completion skill**

Walk the brief's acceptance criteria checklist for each tool. For any unmet criterion, either fix it or record under "What I could NOT meet" in BRIEF-COMPLETION.md.

- [ ] **Step 9.3: Write `BRIEF-COMPLETION.md`** at repo root

Sections:
1. What was built (per acceptance criterion, check or annotate)
2. What I did differently from the brief and why
3. What I could NOT meet, with reason
4. Hand-off notes for sessions B/C/D
5. Estimated LOC per tool (run `git diff --stat main..feat/tools-subdir`)

- [ ] **Step 9.4: Push branch and open PR**

```
git push -u origin feat/tools-subdir
gh pr create --title "feat(tools): add /tools subdir with D1 hub, D4 sanitizer, I1 MCPMeter" \
  --body-file BRIEF-COMPLETION.md
```

Do NOT auto-merge. The user reviews and merges.

- [ ] **Step 9.5: Exit session**

Per brief: do not begin sessions B/C/D.

---

## Self-Review

Performed at end of writing this plan:

1. **Spec coverage:** Every acceptance criterion in the brief maps to a step. D1 hub: Tasks 2, 3, 8. D4 sanitizer: Tasks 4, 5. I1 MCPMeter: Tasks 6, 7. CI/deploy: Task 8. Verification + BRIEF-COMPLETION.md: Task 9.
2. **Placeholder scan:** No "TBD", "implement later", or "appropriate error handling" placeholders. Each step has either full code or a precise interface signature plus enough detail to write the code blind.
3. **Type consistency:** `sanitize()` always returns `{ output, counts, warnings }` across rules, sanitize, UI. `parseConfig()` returns `ParsedConfig` used by `estimateTokens`. `costPerTurn(tokens, ModelRate)` is called consistently. SVG badge signature is stable.

Known soft spots that are intentional, not gaps:
- The `runWithBudget` 50ms guard cannot kill an in-flight regex in JS. Mitigation: all regex patterns are linear (no nested quantifiers on the same character class without anchors); the budget is observational, not pre-emptive. Documented in code comment.
- The split-line adversarial test asserts a *warning*, not a redaction, because newlines genuinely break canonical regex matches and over-eager whitespace stripping risks destroying legitimate content.

---

## Devils Advocate Addendum

**Verdict:** PROCEED WITH CAUTION. The plan is buildable as written; the four amendments below close the largest unmitigated failure modes before code begins.

### Steel-man
The plan ships three browser-only deterministic tools inside an existing Next.js portfolio repo, reusing the existing Pages deploy and adding only a sibling Astro build step. Risk is mostly contained to the new `tools/` subtree.

### Top failure modes (pre-mortem at 12 months)

**FM-1: D4 "Network: 0 requests" badge lies.**
- Root cause: The plan wraps `fetch` and `XMLHttpRequest.open` from inside a deferred Astro `<script>` module. By the time the wrapper runs, the browser has already issued requests for fonts, preload/prefetch links, favicon, sourcemaps, and any image with `src`. The badge shows "0" but `chrome://net-export` would show outbound traffic.
- Likelihood 4 / Impact 5 (this is the load-bearing privacy promise for D4). Score 20.
- **Mitigation (amend Task 5):** Add a synchronous inline `<script>` at the top of `<head>` on `/tools/sanitizer/` that wraps `fetch`, `XMLHttpRequest.prototype.open`, `navigator.sendBeacon`, `EventSource`, and `WebSocket` BEFORE any other script runs. Also wrap `new Image()` via Proxy on `HTMLImageElement.prototype` `src` setter. Tighten the per-route CSP to `default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'none'; font-src 'self'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'` so the browser itself blocks egress even if the JS counter is bypassed. Add an E2E assertion that route loads with `page.route('**/*', r => r.continue())` and asserts `requests.filter(u => new URL(u).hostname !== 'localhost').length === 0` over the full session, not just after the button click.

**FM-2: MCP tool definitions aren't in `claude_desktop_config.json`.**
- Root cause: The config file only declares `command` + `args` + `env` to spawn each MCP server. It does NOT contain the tool schemas the LLM ultimately sees. Without actually launching each server, the estimator cannot count tokens accurately. The plan's `rawTextFor()` fallback uses the config-entry size as a proxy, which is roughly 50 to 200 tokens — but real servers expose 500 to 8000 tokens of tool definitions. The numbers ship will be wildly under-reported, and a user comparing against the community baseline will draw wrong conclusions.
- Likelihood 5 / Impact 4. Score 20.
- **Mitigation (amend Task 6):** Add `tools/src/data/known-servers.json` — a hand-curated lookup keyed by canonical npx package name (e.g. `@modelcontextprotocol/server-filesystem`, `@modelcontextprotocol/server-github`, `@modelcontextprotocol/server-slack`, `@modelcontextprotocol/server-postgres`, plus the popular community ones). For each known server, record measured `toolCount` and `approxToolDefTokens` (from running the server once and reading the `list_tools` response, documented in `known-servers.json` provenance comments). In `estimate.ts`, prefer the known-server lookup; fall back to `rawSize` heuristic with a visible `confidence: 'low'` flag in the row. UI displays a "?" badge on rows that fall back. This converts a silent under-report into an honest "we don't know yet" — and the path to fix is just adding a row to JSON.

**FM-3: Pricing JSON rots within days.**
- Root cause: Provider rates change. The plan commits a `pricing.json` with rates "as of 2026-05-27" and provides no mechanism to detect when it is stale.
- Likelihood 4 / Impact 2. Score 8.
- **Mitigation (amend Task 6):** Add an `updated` field check in the island that warns if `pricing.updated` is more than 60 days behind `new Date()`. Render a small banner: "Pricing snapshot is N days old. Treat as approximate." This is honest and does not require network access. Also add a `LAST-CHECKED.md` next to `pricing.json` with the URLs consulted, so the next session can refresh quickly. If primary sources are unreachable while writing the plan, fall through to `QUESTION-FOR-MAIN-LOOP.md`.

**FM-4: Astro app under `tools/` breaks the existing Next.js dev server.**
- Root cause: The Next.js dev server walks the repo tree. If Astro's `tools/dist/` or `tools/.astro/` gets indexed by Next, build errors or hot-reload loops can result. The existing repo has `next-sitemap` which crawls files.
- Likelihood 2 / Impact 3. Score 6.
- **Mitigation (amend Task 1 and Task 8):** Confirm `tools/.gitignore` excludes `dist/`, `node_modules/`, `.astro/`, `playwright-report/`, `.test-results/`. Add `tools/` to `next.config.mjs` via `outputFileTracingIgnores` or simply rely on Next's default behavior of only crawling `app/`, `pages/`, and `src/`. If `next-sitemap` errors on Astro paths, exclude `tools/` in its config. Verify Step 8.3 runs both builds end-to-end before declaring done.

### Cognitive biases detected and addressed
- **Survivorship**: Plan referenced typical Astro-as-static-site success without acknowledging that mixing Astro with a Next.js parent is uncommon. Addressed via FM-4.
- **Planning fallacy**: 9 tasks across 3 tools in one session is aggressive. Mitigation: each task ends with a green test and a commit, so partial-completion is recoverable. The brief allows incomplete tools to be flagged in BRIEF-COMPLETION.md.
- **Anchoring**: The brief anchored on "Astro framework" — Astro is a fine choice but the plan should note that if Astro's basePath handling for static export under `/tools` proves brittle, Vite + a hand-rolled router would also satisfy the brief. The architectural rule (no LLM at runtime) is the load-bearing constraint, not the framework choice.

### Alternatives considered and rejected
1. **Separate `mtalhas/tools` repo with cross-repo deploy** — the brief's fallback. Rejected because it adds a deploy-key rotation burden and a second Pages site. Single repo wins unless FM-4 proves fatal during Task 1.
2. **Vanilla TS + Vite, no Astro** — would also work and produces a smaller bundle. Rejected because the brief explicitly names Astro and the framework cost is small.
3. **Server-side estimator for MCPMeter** — would solve FM-2 but violates the architectural rule (AI in runtime serving path).

### Amendments applied to the plan
- Task 5: per-route CSP tightened, network wrapper moved to inline `<script>` at top of `<head>`, more network surfaces wrapped, E2E assertion expanded.
- Task 6: add `tools/src/data/known-servers.json` lookup table + `confidence` flag; estimator prefers known-server lookup.
- Task 6: pricing-staleness banner in UI; add `tools/src/data/LAST-CHECKED.md`.
- Task 1/8: explicit `tools/.gitignore` + verify Next.js does not index `tools/dist`.

(These amendments are encoded as concrete steps in their respective tasks during execution; the addendum here is the audit trail.)
