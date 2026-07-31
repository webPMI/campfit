/**
 * Genera iconos PWA PNG (192x192 y 512x512) usando sharp a partir del SVG oficial de la app.
 *
 * Uso: node scripts/generate-pwa-icons.mjs
 */

import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// SVG base del icono de CampFit (mismo diseño que favicon.svg, escalado a 512)
const svgBuffer = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="#0f1117"/>
  <path d="M328 104 A184 184 0 1 0 328 408 L328 344 A120 120 0 1 1 328 168 Z" fill="url(#g)"/>
  <path d="M328 168 A120 120 0 1 1 328 344 L360 344 A152 152 0 1 0 360 168 Z" fill="#0f1117"/>
</svg>`);

const SIZES = [192, 512];

async function generate() {
  try {
    const sharp = (await import('sharp')).default;
    const results = await Promise.all(
      SIZES.map(async (size) => {
        const outputPath = join(root, 'public', `pwa-icon-${size}.png`);
        await sharp(svgBuffer).resize(size, size).png().toFile(outputPath);
        return outputPath;
      })
    );
    results.forEach((path) => console.log(`✅ Icono PWA generado: ${path}`));
    console.log('\n✅ Iconos PWA generados correctamente.');
  } catch (err) {
    console.error('❌ Error al generar iconos PWA:', err.message);
    console.error('   Asegúrate de que sharp está instalado: npm install sharp');
    process.exit(1);
  }
}

generate();