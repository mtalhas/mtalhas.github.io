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
  retries: 0,
  fullyParallel: false
});
