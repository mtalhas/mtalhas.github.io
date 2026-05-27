import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('D3 AzureAIWeather', () => {
  test('renders subscribe channels and FAQ JSON-LD', async ({ page }) => {
    await page.goto('/tools/azureaiweather/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Azure AI Weather/);
    await expect(page.locator('[data-test=slack-form]')).toBeAttached();
    const ld = await page.locator('script[type="application/ld+json"]').textContent();
    expect(JSON.parse(ld!)['@type']).toBe('FAQPage');
  });

  test('rejects non-https slack URL', async ({ page }) => {
    await page.goto('/tools/azureaiweather/');
    // Open the slack details
    const slackSummary = page.locator('details:has(input[data-test=slack-url]) summary');
    await slackSummary.click();
    await page.locator('[data-test=slack-url]').fill('http://hooks.slack.com/services/T01234567/B01234567/abcdefghijklmnopqrstuvwx');
    await page.locator('[data-test=slack-subscribe]').click();
    await expect(page.locator('[data-test=slack-status]')).toContainText(/Rejected/);
  });

  test('passes axe a11y scan', async ({ page }) => {
    await page.goto('/tools/azureaiweather/');
    const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(r.violations, JSON.stringify(r.violations, null, 2)).toEqual([]);
  });
});
