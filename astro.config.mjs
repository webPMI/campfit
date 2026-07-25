// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://astro.build/config
export default defineConfig({
<<<<<<< HEAD
    output: 'static',
    vite: {
        server: {
            headers: {
                'Cross-Origin-Opener-Policy': 'unsafe-none',
                'Cross-Origin-Embedder-Policy': 'unsafe-none',
            },
        },
        plugins: [tailwindcss()],
        css: {
            transformer: 'lightningcss',
        },
    },
=======
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve('./src'),
      },
    },
  },
>>>>>>> 4042d86ac520c28484786564a781e3d6e901af5a
});
