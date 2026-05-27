import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('I3 PolyJB', () => {
  test('renders project description and links to the github repo', async ({ page }) => {
    await page.goto('/tools/polyjb/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/PolyJB/);
    await expect(page.getByRole('link', { name: /github\.com\/mtalhas\/polyjb/ })).toBeVisible();
  });

  test('shows placeholder banner prominently', async ({ page }) => {
    await page.goto('/tools/polyjb/');
    await expect(page.locator('[role=status]').first()).toContainText(/PLACEHOLDER/i);
  });

  test('methodology page describes deterministic evaluation', async ({ page }) => {
    await page.goto('/tools/polyjb/methodology/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Methodology/);
    await expect(page.locator('h2')).toContainText(/Why not LLM-as-judge/);
  });

  test('passes axe a11y scan', async ({ page }) => {
    await page.goto('/tools/polyjb/');
    const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(r.violations, JSON.stringify(r.violations, null, 2)).toEqual([]);
  });
});
