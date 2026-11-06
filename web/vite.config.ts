import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  // GitHub Pages serves from a repository subpath; Cloudflare Workers serves from the domain root.
  base: process.env.VITE_BASE_PATH ?? '/',
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
  build: { target: 'es2022', sourcemap: false, assetsInlineLimit: 4096 },
});
