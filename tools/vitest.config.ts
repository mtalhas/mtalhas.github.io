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
