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
