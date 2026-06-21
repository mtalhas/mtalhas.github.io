import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('D1 hub', () => {
  test('lists both tools with CTAs and cal.com footer', async ({ page }) => {
    await page.goto('/tools/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/tools/i);
    await expect(page.getByRole('link', { name: /open agent trace sanitizer/i })).toHaveAttribute('href', /\/tools\/sanitizer\//);
    await expect(page.getByRole('link', { name: /open mcpmeter/i })).toHaveAttribute('href', /\/tools\/mcpmeter\//);
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
