import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const sample = JSON.stringify({
  mcpServers: {
    filesystem: { command: 'npx', args: ['-y', '@modelcontextprotocol/server-filesystem', '/path'] },
    github:     { command: 'npx', args: ['-y', '@modelcontextprotocol/server-github'] }
  }
}, null, 2);

test.describe('I1 MCPMeter', () => {
  test('estimates per server and shows nonzero total', async ({ page }) => {
    await page.goto('/tools/mcpmeter/');
    await page.locator('textarea[data-test=config]').fill(sample);
    await page.locator('button[data-test=run]').click();
    await expect(page.locator('[data-test=row]').first()).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('[data-test=total-tokens]')).not.toHaveText(/^0$/);
  });

  test('share button produces permalink whose hash is non-empty', async ({ page }) => {
    await page.goto('/tools/mcpmeter/');
    await page.locator('textarea[data-test=config]').fill(sample);
    await page.locator('button[data-test=run]').click();
    await expect(page.locator('[data-test=row]').first()).toBeVisible({ timeout: 15_000 });
    const link = await page.locator('input[data-test=permalink]').inputValue();
    expect(link).toContain('#');
    const hash = new URL(link).hash.slice(1);
    expect(hash.length).toBeGreaterThan(0);
  });

  test('passes axe a11y scan', async ({ page }) => {
    await page.goto('/tools/mcpmeter/');
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });
});
