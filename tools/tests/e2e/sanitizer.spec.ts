import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('D4 sanitizer', () => {
  test('redacts secrets with zero outbound requests', async ({ page }) => {
    const externalRequests: string[] = [];
    page.on('request', (r) => {
      const u = r.url();
      if (!u.startsWith('http://localhost:4321') && !u.startsWith('data:') && !u.startsWith('about:')) {
        externalRequests.push(u);
      }
    });
    await page.goto('/tools/sanitizer/');
    await page.locator('textarea[data-test=input]').fill('My key: sk-FAKE12345abcdef67890hijklmnop AKIAFAKEFAKEFAKEFAKE');
    await page.locator('button[data-test=run]').click();
    await expect(page.locator('textarea[data-test=output]')).toHaveValue(/\[REDACTED:openai-sk/);
    await expect(page.locator('textarea[data-test=output]')).toHaveValue(/\[REDACTED:aws-access/);
    await expect(page.locator('[data-test=net-badge]')).toContainText('Network: 0 requests');
    expect(externalRequests, JSON.stringify(externalRequests)).toEqual([]);
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

  test('passes axe a11y scan', async ({ page }) => {
    await page.goto('/tools/sanitizer/');
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });
});
