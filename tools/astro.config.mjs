import { defineConfig } from 'astro/config';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

export default defineConfig({
  site: 'https://mtalhas.github.io',
  base: '/tools',
  trailingSlash: 'always',
  output: 'static',
  build: { format: 'directory' },
  vite: {
    plugins: [wasm(), topLevelAwait()],
    build: { sourcemap: false },
    server: { fs: { strict: true } }
  }
});
