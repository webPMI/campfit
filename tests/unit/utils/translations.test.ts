/**
 * Test de integridad de traducciones.
 *
 * Verifica que todas las keys usadas en los archivos del proyecto
 * con la función t('...') existan en los archivos de traducción.
 *
 * También detecta keys que están en las traducciones pero no se usan.
 *
 * Ejecutar: npx vitest tests/unit/utils/translations.test.ts
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

// ─── Configuración ───────────────────────────────────────────────────────────

const SRC_DIR = path.resolve(__dirname, '../../../src');
const TRANSLATIONS_FILE = path.resolve(SRC_DIR, 'i18n/translations.ts');
const CLIENT_TRANSLATIONS_FILE = path.resolve(SRC_DIR, 'i18n/client.ts');

// Extensiones de archivos a escanear
const SCAN_EXTENSIONS = ['.astro', '.ts', '.tsx'];

// ─── Utilidades ──────────────────────────────────────────────────────────────

/**
 * Extrae todas las keys de traducción de un archivo de traducciones.
 * Busca el patrón: 'key': 'valor' dentro de los objetos Record<Language, Record<string, string>>
 */
function extractTranslationKeys(filePath: string): string[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const keys: string[] = [];

  // Busca todas las keys dentro de los objetos de traducción
  // Patrón: 'algo.con.puntos': 'valor' o "algo.con.puntos": "valor"
  const regex = /['"]((?:[a-z]+\.)+[a-z][a-zA-Z0-9.]*)['"]\s*:/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    if (match[1]) {
      keys.push(match[1]);
    }
  }

  return [...new Set(keys)].sort();
}

/**
 * Extrae todas las keys de traducción usadas en archivos .astro y .ts del proyecto.
 * Busca el patrón: t('key') o t("key")
 */
function extractUsedKeys(dir: string): string[] {
  const keys: string[] = [];
  const files = getAllFiles(dir);

  for (const file of files) {
    const ext = path.extname(file);
    if (!SCAN_EXTENSIONS.includes(ext)) continue;
    if (file.includes('node_modules') || file.includes('.astro/') || file.includes('dist/')) continue;

    const content = fs.readFileSync(file, 'utf-8');

    // Busca t('key') o t("key") - tanto en template Astro como en JS/TS
    const regex = /t\(['"]([^'"]+)['"]\)/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(content)) !== null) {
      if (match[1]) {
        keys.push(match[1]);
      }
    }
  }

  return [...new Set(keys)].sort();
}

/**
 * Obtiene todos los archivos recursivamente.
 */
function getAllFiles(dir: string): string[] {
  const files: string[] = [];

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === '.astro' || entry.name === 'dist') continue;
        files.push(...getAllFiles(fullPath));
      } else {
        files.push(fullPath);
      }
    }
  } catch {
    // Si no existe el directorio, ignorar
  }

  return files;
}

/**
 * Determina si una key se usa en contexto cliente (JS/TS) o solo en SSR (template Astro).
 * Simple heurística: si el archivo tiene <script> y la key aparece dentro, es cliente.
 */
function getKeysByContext(dir: string): { ssrKeys: string[]; clientKeys: string[] } {
  const ssrKeys: string[] = [];
  const clientKeys: string[] = [];
  const files = getAllFiles(dir);

  for (const file of files) {
    const ext = path.extname(file);
    if (!SCAN_EXTENSIONS.includes(ext)) continue;
    if (file.includes('node_modules') || file.includes('.astro/') || file.includes('dist/')) continue;

    const content = fs.readFileSync(file, 'utf-8');

    // Para archivos .astro, separar template (SSR) de script (cliente)
    if (ext === '.astro') {
      const scriptMatch = content.match(/<script[\s\S]*?<\/script>/);
      const templateContent = scriptMatch ? content.replace(scriptMatch[0], '') : content;
      const scriptContent = scriptMatch ? scriptMatch[0] : '';

      // Keys en template (SSR)
      const ssrRegex = /t\(['"]([^'"]+)['"]\)/g;
      let m: RegExpExecArray | null;
      while ((m = ssrRegex.exec(templateContent)) !== null) {
        if (m[1]) ssrKeys.push(m[1]);
      }

      // Keys en script (cliente)
      const clientRegex = /t\(['"]([^'"]+)['"]\)/g;
      while ((m = clientRegex.exec(scriptContent)) !== null) {
        if (m[1]) clientKeys.push(m[1]);
      }
    } else {
      // Archivos .ts/.tsx - asumimos cliente
      const regex = /t\(['"]([^'"]+)['"]\)/g;
      let m: RegExpExecArray | null;
      while ((m = regex.exec(content)) !== null) {
        if (m[1]) clientKeys.push(m[1]);
      }
    }
  }

  return {
    ssrKeys: [...new Set(ssrKeys)].sort(),
    clientKeys: [...new Set(clientKeys)].sort(),
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Integridad de traducciones', () => {
  const translationsKeys = extractTranslationKeys(TRANSLATIONS_FILE);
  const clientKeys = extractTranslationKeys(CLIENT_TRANSLATIONS_FILE);
  const usedKeys = getKeysByContext(SRC_DIR);

  // ─── 1. Keys usadas en SSR deben estar en translations.ts ──────────────────

  describe('Keys SSR (template Astro)', () => {
    const missing: string[] = [];

    for (const key of usedKeys.ssrKeys) {
      if (!translationsKeys.includes(key)) {
        missing.push(key);
      }
    }

    it('todas las keys usadas en SSR deben existir en translations.ts', () => {
      if (missing.length > 0) {
        console.log('\n❌ Keys faltantes en translations.ts (usadas en SSR):');
        missing.forEach((k) => console.log(`   - ${k}`));
      }
      expect(missing).toEqual([]);
    });
  });

  // ─── 2. Keys usadas en cliente deben estar en client.ts ────────────────────

  describe('Keys Cliente (JS/TS)', () => {
    const missing: string[] = [];

    for (const key of usedKeys.clientKeys) {
      if (!clientKeys.includes(key)) {
        missing.push(key);
      }
    }

    it('todas las keys usadas en cliente deben existir en client.ts', () => {
      if (missing.length > 0) {
        console.log('\n❌ Keys faltantes en client.ts (usadas en JS/TS):');
        missing.forEach((k) => console.log(`   - ${k}`));
      }
      expect(missing).toEqual([]);
    });
  });

  // ─── 3. Keys en translations.ts no usadas (posible limpieza) ───────────────

  describe('Keys no utilizadas en translations.ts', () => {
    const allUsed = [...usedKeys.ssrKeys, ...usedKeys.clientKeys];
    // Excluir keys que son organizativas o de uso indirecto
    const excludePrefixes = ['admin.', 'trainer.', 'client.support'];
    const unused = translationsKeys.filter(
      (key) =>
        !allUsed.includes(key) &&
        !excludePrefixes.some((p) => key.startsWith(p)),
    );

    it('no debería haber keys sin usar en translations.ts (excepto admin/trainer/support)', () => {
      if (unused.length > 0) {
        console.log('\n⚠️  Posibles keys sin usar en translations.ts:');
        unused.forEach((k) => console.log(`   - ${k}`));
      }
      // No falla, solo advierte
      expect(true).toBe(true);
    });
  });

  // ─── 4. Keys en client.ts no usadas (posible limpieza) ─────────────────────

  describe('Keys no utilizadas en client.ts', () => {
    const unused = clientKeys.filter((key) => !usedKeys.clientKeys.includes(key));

    it('no debería haber keys sin usar en client.ts', () => {
      if (unused.length > 0) {
        console.log('\n⚠️  Posibles keys sin usar en client.ts:');
        unused.forEach((k) => console.log(`   - ${k}`));
      }
      // No falla, solo advierte
      expect(true).toBe(true);
    });
  });

  // ─── 5. Reporte completo ───────────────────────────────────────────────────

  it('reporte completo de cobertura de traducciones', () => {
    console.log('\n══════════════════════════════════════════');
    console.log('   REPORTE DE COBERTURA DE TRADUCCIONES');
    console.log('══════════════════════════════════════════');
    console.log(`\n📊 translations.ts: ${translationsKeys.length} keys`);
    console.log(`📊 client.ts:       ${clientKeys.length} keys`);
    console.log(`📊 Usadas en SSR:   ${usedKeys.ssrKeys.length} keys`);
    console.log(`📊 Usadas en JS/TS: ${usedKeys.clientKeys.length} keys`);
    console.log(`📊 Total únicas:    ${new Set([...usedKeys.ssrKeys, ...usedKeys.clientKeys]).size} keys`);

    // Mostrar todas las keys usadas
    console.log('\n📋 Keys usadas en SSR:');
    usedKeys.ssrKeys.forEach((k) => {
      const exists = translationsKeys.includes(k) ? '✅' : '❌';
      console.log(`   ${exists} ${k}`);
    });

    console.log('\n📋 Keys usadas en JS/TS (cliente):');
    usedKeys.clientKeys.forEach((k) => {
      const exists = clientKeys.includes(k) ? '✅' : '❌';
      console.log(`   ${exists} ${k}`);
    });

    console.log('\n══════════════════════════════════════════\n');
    expect(true).toBe(true);
  });
});
