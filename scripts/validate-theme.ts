#!/usr/bin/env node
/**
 * Theme Validator — Script de validación del sistema de temas
 * ============================================================
 *
 * Este script verifica la integridad y consistencia del sistema de temas:
 *
 * 1. Verifica que theme.css contenga todos los tokens necesarios.
 * 2. Verifica que cada token definido en :root/[data-theme="light"] tenga
 *    su contraparte en [data-theme="dark"].
 * 3. Verifica que no haya tokens huérfanos (solo definidos en un tema).
 * 4. Verifica que themeStore.ts y theme.css estén sincronizados.
 * 5. Verifica que BaseLayout.astro importe correctamente theme.css.
 *
 * Uso:
 *   npx tsx scripts/validate-theme.ts
 *   npm run theme:validate
 *
 * Salida:
 *   - Exit code 0: todo OK
 *   - Exit code 1: hay errores que requieren atención
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');
const SRC = resolve(ROOT, 'src');

interface CheckResult {
  name: string;
  passed: boolean;
  message: string;
  errors: string[];
}

const results: CheckResult[] = [];

function addResult(
  name: string,
  passed: boolean,
  message: string,
  errors: string[] = []
): void {
  results.push({ name, passed, message, errors });
}

// ---------------------------------------------------------------------------
// Helper: Extract CSS custom properties from a string
// ---------------------------------------------------------------------------

function extractCSSVariables(css: string): string[] {
  const vars = new Set<string>();
  const regex = /--[\w-]+/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(css)) !== null) {
    vars.add(match[0]);
  }
  return [...vars].sort();
}

/**
 * Extracts CSS variables from ALL blocks matching a selector prefix.
 * For ':root', matches both ':root' and ':root,[data-theme='light']'.
 * Handles nested blocks by tracking brace depth.
 */
function extractVarsFromBlock(css: string, blockSelector: string): string[] {
  const allVars = new Set<string>();
  let searchFrom = 0;

  while (true) {
    const startIdx = css.indexOf(blockSelector, searchFrom);
    if (startIdx === -1) break;

    // Verify this is actually a selector start (preceded by whitespace/newline or at start)
    if (startIdx > 0) {
      const prev = css[startIdx - 1];
      if (prev !== '\n' && prev !== '\r' && prev !== ' ' && prev !== '\t' && prev !== ';' && prev !== '}') {
        // This match is part of a larger selector name, skip it
        searchFrom = startIdx + blockSelector.length;
        continue;
      }
    }

    // Find the opening brace
    const openBrace = css.indexOf('{', startIdx);
    if (openBrace === -1) break;

    // Track brace depth to find matching closing brace
    let depth = 1;
    let i = openBrace + 1;
    while (i < css.length && depth > 0) {
      if (css[i] === '{') depth++;
      else if (css[i] === '}') depth--;
      i++;
    }

    const block = css.slice(openBrace + 1, i - 1);
    const vars = extractCSSVariables(block);
    for (const v of vars) {
      allVars.add(v);
    }

    // Continue searching after this block
    searchFrom = i;
  }

  return [...allVars].sort();
}

// ---------------------------------------------------------------------------
// Helper: Assert file exists
// ---------------------------------------------------------------------------

function assertFileExists(filePath: string, label: string): boolean {
  const exists = existsSync(filePath);
  if (!exists) {
    addResult(label, false, `Archivo no encontrado: ${filePath}`);
  }
  return exists;
}

// ---------------------------------------------------------------------------
// 1. File existence checks
// ---------------------------------------------------------------------------

const themeCSSPath = resolve(SRC, 'styles', 'theme.css');
const themeStorePath = resolve(SRC, 'stores', 'themeStore.ts');
const baseLayoutPath = resolve(SRC, 'layouts', 'BaseLayout.astro');
const themeTogglePath = resolve(SRC, 'components', 'ThemeToggle.astro');
const testPath = resolve(ROOT, 'tests', 'unit', 'stores', 'themeStore.test.ts');

const filesExist = [
  assertFileExists(themeCSSPath, 'theme.css existe'),
  assertFileExists(themeStorePath, 'themeStore.ts existe'),
  assertFileExists(baseLayoutPath, 'BaseLayout.astro existe'),
  assertFileExists(themeTogglePath, 'ThemeToggle.astro existe'),
  assertFileExists(testPath, 'themeStore.test.ts existe'),
];

if (!filesExist.every(Boolean)) {
  console.error('❌ Faltan archivos del sistema de temas. Abortando validación.');
  printResults();
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 2. CSS Token Validation
// ---------------------------------------------------------------------------

const themeCSS = readFileSync(themeCSSPath, 'utf-8');

const lightVars = extractVarsFromBlock(themeCSS, '[data-theme=\'light\']');
const darkVars = extractVarsFromBlock(themeCSS, '[data-theme=\'dark\']');
const rootVars = extractVarsFromBlock(themeCSS, ':root');
// Combine :root and light vars (light is the default)
const allLightVars = new Set([...rootVars, ...lightVars]);
const allDarkVars = new Set(darkVars);

// Token groups that should be present
const requiredTokenPrefixes = [
  '--color-bg-',
  '--color-surface-',
  '--color-text-',
  '--color-border-',
  '--color-brand-',
  '--color-status-',
  '--color-scrollbar-',
];

// Check required token categories exist in both themes
const missingTokens: string[] = [];
for (const prefix of requiredTokenPrefixes) {
  const hasLight = [...allLightVars].some((v) => v.startsWith(prefix));
  const hasDark = [...allDarkVars].some((v) => v.startsWith(prefix));
  if (!hasLight) missingTokens.push(`${prefix}* en tema claro`);
  if (!hasDark) missingTokens.push(`${prefix}* en tema oscuro`);
}

addResult(
  'Tokens requeridos presentes en ambos temas',
  missingTokens.length === 0,
  missingTokens.length === 0
    ? 'Todas las categorías de tokens están presentes en ambos temas.'
    : `Faltan ${missingTokens.length} categorías.`,
  missingTokens
);

// Check each light token has a dark counterpart (color tokens only)
const colorLightVars = [...allLightVars].filter(
  (v) =>
    v.startsWith('--color-') &&
    !v.startsWith('--color-scrollbar-track') // shared between themes
);
const colorDarkVars = new Set(
  [...allDarkVars].filter((v) => v.startsWith('--color-'))
);

const orphans: string[] = [];
for (const lightVar of colorLightVars) {
  if (!colorDarkVars.has(lightVar)) {
    orphans.push(`Token "${lightVar}" definido en light pero no en dark`);
  }
}
for (const darkVar of colorDarkVars) {
  if (
    !allLightVars.has(darkVar) &&
    !darkVar.startsWith('--color-scrollbar-track')
  ) {
    orphans.push(`Token "${darkVar}" definido en dark pero no en light`);
  }
}

addResult(
  'Tokens sincronizados entre temas',
  orphans.length === 0,
  orphans.length === 0
    ? 'Todos los tokens de color tienen definiciones en ambos temas.'
    : `${orphans.length} token(s) huérfano(s) encontrado(s).`,
  orphans
);

// ---------------------------------------------------------------------------
// 3. Check BaseLayout imports theme.css
// ---------------------------------------------------------------------------

const baseLayout = readFileSync(baseLayoutPath, 'utf-8');

const importsThemeCSS = baseLayout.includes("import '@/styles/theme.css'") ||
  baseLayout.includes('import "@/styles/theme.css"');

addResult(
  'BaseLayout importa theme.css',
  importsThemeCSS,
  importsThemeCSS
    ? 'BaseLayout.astro importa correctamente theme.css.'
    : 'BaseLayout.astro NO importa theme.css. Agrega: @import \'@/styles/theme.css\';',
  importsThemeCSS ? [] : ['Falta @import en BaseLayout.astro']
);

// ---------------------------------------------------------------------------
// 4. Check BaseLayout uses semantic classes
// ---------------------------------------------------------------------------

const usesSemanticClasses =
  baseLayout.includes('theme-bg-gradient') &&
  baseLayout.includes('theme-text-primary');

addResult(
  'BaseLayout usa clases semánticas',
  usesSemanticClasses,
  usesSemanticClasses
    ? 'BaseLayout.astro usa clases semánticas del tema.'
    : 'BaseLayout.astro NO usa clases semánticas. Reemplaza las clases hardcodeadas con theme-bg-gradient, theme-text-primary, etc.',
  usesSemanticClasses
    ? []
    : ['Reemplazar clases hardcodeadas en BaseLayout.astro']
);

// ---------------------------------------------------------------------------
// 5. Check themeStore imports
// ---------------------------------------------------------------------------

const themeStore = readFileSync(themeStorePath, 'utf-8');

const hasNanostoresImport = themeStore.includes("from 'nanostores'") ||
  themeStore.includes('from "nanostores"');
const exportsAtom = themeStore.includes('export const $theme');
const exportsComputed = themeStore.includes('export const $isDark');
const exportsSetTheme = themeStore.includes('export function setTheme');
const exportsToggleTheme = themeStore.includes('export function toggleTheme');
const exportsInitTheme = themeStore.includes('export function initTheme');

addResult(
  'themeStore API completo',
  hasNanostoresImport &&
    exportsAtom &&
    exportsComputed &&
    exportsSetTheme &&
    exportsToggleTheme &&
    exportsInitTheme,
  'Todas las exportaciones esperadas están presentes en themeStore.ts.',
  [
    !hasNanostoresImport && 'Falta import de nanostores',
    !exportsAtom && 'Falta export $theme',
    !exportsComputed && 'Falta export $isDark/$isLight',
    !exportsSetTheme && 'Falta export setTheme()',
    !exportsToggleTheme && 'Falta export toggleTheme()',
    !exportsInitTheme && 'Falta export initTheme()',
  ].filter(Boolean) as string[]
);

// ---------------------------------------------------------------------------
// 6. Detect hardcoded color classes in Astro files
// ---------------------------------------------------------------------------

import { readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const HARDCODED_PATTERNS = [
  /\bbg-zinc-9\d\d\b/g,
  /\bbg-zinc-8\d\d\b/g,
  /\bbg-zinc-7\d\d\b/g,
  /\bbg-white\b(?!\/)/g,
  /\bbg-black\b/g,
  /\bbg-gray-\d\d\d\b/g,
  /\btext-zinc-[1-7]\d\d\b/g,
  /\btext-white\b(?!\/)/g,
  /\btext-black\b/g,
  /\bborder-zinc-[78]\d\d\b/g,
  /\bborder-white\b/g,
  /\bborder-black\b/g,
  /\btext-emerald-[45]00\b/g,
  /\bbg-emerald-[56]00\b(?!\/)/g,
  /\bborder-emerald-[45]00\b/g,
];

// Ignore: Google brand colors in SVGs, BaseLayout meta theme-color, CSS @theme block hex values
function findAllAstroFiles(dir: string): string[] {
  const files: string[] = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      files.push(...findAllAstroFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.astro')) {
      files.push(fullPath);
    }
  }
  return files;
}

const astroFiles = findAllAstroFiles(SRC);
const hardcodeErrors: string[] = [];

for (const file of astroFiles) {
  const content = readFileSync(file, 'utf-8');
  for (const pattern of HARDCODED_PATTERNS) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const lineNum = content.slice(0, match.index).split('\n').length;
      const relPath = relative(ROOT, file);
      hardcodeErrors.push(`${relPath}:${lineNum} — "${match[0]}" (usa clase semántica)`);
    }
  }
}

const MAX_ALLOWED = 0; // Goal: zero hardcoded colors

addResult(
  'Detección de hardcodeos en Astro',
  hardcodeErrors.length <= MAX_ALLOWED,
  hardcodeErrors.length === 0
    ? 'No se encontraron clases de color hardcodeadas en archivos Astro.'
    : `${hardcodeErrors.length} clases hardcodeadas encontradas. Ejecuta: npx tsx scripts/migrate-theme.ts`,
  hardcodeErrors.slice(0, 20) // Show first 20 to avoid flooding
);

// ---------------------------------------------------------------------------
// 7. Count tokens for reporting
// ---------------------------------------------------------------------------

const themeLightVarCount = colorLightVars.length;
const themeDarkVarCount = colorDarkVars.size;
const totalUtilityClasses = (themeCSS.match(/\.theme-/g) || []).length;

addResult(
  'Estadísticas del tema',
  true,
  [
    `Tokens de color (light): ${themeLightVarCount}`,
    `Tokens de color (dark): ${themeDarkVarCount}`,
    `Clases utilitarias semánticas: ${totalUtilityClasses}`,
  ].join(' | '),
  []
);

// ---------------------------------------------------------------------------
// Print results and exit
// ---------------------------------------------------------------------------

function printResults(): void {
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║       🎨 CampFit Theme System Validator         ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  let passedCount = 0;
  let failedCount = 0;

  for (const result of results) {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.name}`);
    console.log(`   ${result.message}`);
    if (result.errors.length > 0) {
      for (const err of result.errors) {
        console.log(`   ↳ ${err}`);
      }
    }
    console.log();

    if (result.passed) passedCount++;
    else failedCount++;
  }

  console.log('──────────────────────────────────────────────────');
  console.log(
    `Resultado: ${passedCount} pasaron, ${failedCount} fallaron de ${results.length} verificaciones.`
  );

  // Score summary
  const score = Math.round((passedCount / results.length) * 100);
  const bar =
    '█'.repeat(Math.round(score / 10)) +
    '░'.repeat(10 - Math.round(score / 10));
  console.log(`Puntuación: [${bar}] ${score}%`);
  console.log('──────────────────────────────────────────────────\n');

  if (failedCount > 0) {
    console.log(
      '⚠️  Hay verificaciones que fallaron. Revisa los errores arriba.\n'
    );
  } else {
    console.log('🎉 ¡El sistema de temas está completo y consistente!\n');
  }
}

printResults();

const allPassed = results.every((r) => r.passed);
process.exit(allPassed ? 0 : 1);