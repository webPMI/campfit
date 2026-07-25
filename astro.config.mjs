// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
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
});
