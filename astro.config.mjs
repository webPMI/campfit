// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// ─── SSR con @astrojs/node ──────────────────────────────────
// Cuando estés listo para SSR, descomenta el adapter:
// import node from '@astrojs/node';
//
// export default defineConfig({
//   output: 'server',
//   adapter: node({ mode: 'standalone' }),
//   vite: { plugins: [tailwindcss()] },
// });
// ─────────────────────────────────────────────────────────────

// https://astro.build/config
export default defineConfig({
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
});
