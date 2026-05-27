import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('B4 MCP Server Health', () => {
  test('renders the table with seed rows', async ({ page }) => {
    await page.goto('/tools/mcp-health/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/MCP Server Health/);
    await expect(page.locator('[data-test=row]').first()).toBeVisible();
  });

  test('methodology page describes the formula', async ({ page }) => {
    await page.goto('/tools/mcp-health/methodology/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Methodology/);
    await expect(page.locator('pre')).toContainText('composite =');
  });

  test('passes axe', async ({ page }) => {
    await page.goto('/tools/mcp-health/');
    const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(r.violations, JSON.stringify(r.violations, null, 2)).toEqual([]);
  });

  test('hub does NOT render mcp-health card while feature flag is off', async ({ page }) => {
    await page.goto('/tools/');
    await expect(page.getByRole('link', { name: /open mcp server health/i })).toHaveCount(0);
  });
});
