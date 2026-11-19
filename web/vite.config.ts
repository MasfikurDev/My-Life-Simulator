import { defineConfig } from 'vitest/config';
import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte({ preprocess: vitePreprocess() })],
  // GitHub Pages serves the app from the repository subpath.
  base: process.env.VITE_BASE_PATH ?? '/',
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
  build: { target: 'es2022', sourcemap: false, assetsInlineLimit: 4096 },
});
