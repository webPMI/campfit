#!/usr/bin/env node
/**
 * Theme Migration Script — Convierte clases hardcodeadas a clases semánticas
 * ========================================================================
 *
 * Este script reemplaza clases Tailwind de color hardcodeadas por las
 * clases semánticas definidas en theme.css, para garantizar que el cambio
 * de tema (oscuro ↔ claro) funcione en toda la aplicación.
 *
 * Uso:
 *   npx tsx scripts/migrate-theme.ts [--dry-run] [--file path/to/file.astro]
 *
 * Modo dry-run: muestra los cambios sin escribir archivos.
 * Sin --file: procesa todos los archivos Astro en src/
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, relative, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');
const SRC = resolve(ROOT, 'src');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const specificFile = args.find((a) => a.startsWith('--file='))?.replace('--file=', '');

// ---------------------------------------------------------------------------
// Migration Map: Tailwind hardcoded classes → Semantic theme classes
// ---------------------------------------------------------------------------
// Order matters: more specific patterns first
// ---------------------------------------------------------------------------

interface Replacement {
  pattern: RegExp;
  replacement: string;
  description: string;
}

const replacements: Replacement[] = [
  // ====== Backgrounds ======
  // bg-zinc-950 → theme-bg-primary
  { pattern: /\bbg-zinc-950\b/g, replacement: 'theme-bg-primary', description: 'bg-zinc-950 → theme-bg-primary' },
  // bg-zinc-900 → theme-bg-secondary / theme-surface
  { pattern: /\bbg-zinc-900\/80\b/g, replacement: 'theme-surface', description: 'bg-zinc-900/80 → theme-surface' },
  { pattern: /\bbg-zinc-900\/60\b/g, replacement: 'theme-surface-secondary', description: 'bg-zinc-900/60 → theme-surface-secondary' },
  { pattern: /\bbg-zinc-900\/40\b/g, replacement: 'theme-surface-secondary', description: 'bg-zinc-900/40 → theme-surface-secondary' },
  { pattern: /\bbg-zinc-900\b/g, replacement: 'theme-surface', description: 'bg-zinc-900 → theme-surface' },
  // bg-zinc-800 → theme-surface-secondary / theme-surface-hover
  { pattern: /\bbg-zinc-800\/50\b/g, replacement: 'theme-surface-hover', description: 'bg-zinc-800/50 → theme-surface-hover' },
  { pattern: /\bbg-zinc-800\b/g, replacement: 'theme-surface-secondary', description: 'bg-zinc-800 → theme-surface-secondary' },
  // bg-zinc-700 → theme-surface-active
  { pattern: /\bbg-zinc-700\b/g, replacement: 'theme-surface-active', description: 'bg-zinc-700 → theme-surface-active' },
  // bg-white/black
  { pattern: /\bbg-white\b/g, replacement: 'theme-bg-elevated', description: 'bg-white → theme-bg-elevated' },
  { pattern: /\bbg-black\b/g, replacement: 'theme-bg-primary', description: 'bg-black → theme-bg-primary' },

  // ====== Text ======
  // text-zinc-100 → theme-text-primary
  { pattern: /\btext-zinc-100\b/g, replacement: 'theme-text-primary', description: 'text-zinc-100 → theme-text-primary' },
  { pattern: /\btext-zinc-200\b/g, replacement: 'theme-text-primary', description: 'text-zinc-200 → theme-text-primary' },
  // text-zinc-300 → theme-text-secondary
  { pattern: /\btext-zinc-300\b/g, replacement: 'theme-text-secondary', description: 'text-zinc-300 → theme-text-secondary' },
  // text-zinc-400 → theme-text-secondary
  { pattern: /\btext-zinc-400\b/g, replacement: 'theme-text-secondary', description: 'text-zinc-400 → theme-text-secondary' },
  // text-zinc-500 → theme-text-tertiary
  { pattern: /\btext-zinc-500\b/g, replacement: 'theme-text-tertiary', description: 'text-zinc-500 → theme-text-tertiary' },
  // text-zinc-600 → theme-text-tertiary
  { pattern: /\btext-zinc-600\b/g, replacement: 'theme-text-tertiary', description: 'text-zinc-600 → theme-text-tertiary' },
  // text-zinc-700 → theme-text-tertiary
  { pattern: /\btext-zinc-700\b/g, replacement: 'theme-text-tertiary', description: 'text-zinc-700 → theme-text-tertiary' },
  // text-white → theme-text-primary (en dark es blanco, en light es oscuro)
  { pattern: /\btext-white\b(?!\/)/g, replacement: 'theme-text-primary', description: 'text-white → theme-text-primary' },

  // ====== Borders ======
  { pattern: /\bborder-zinc-800\/60\b/g, replacement: 'theme-border', description: 'border-zinc-800/60 → theme-border' },
  { pattern: /\bborder-zinc-800\/40\b/g, replacement: 'theme-border', description: 'border-zinc-800/40 → theme-border' },
  { pattern: /\bborder-zinc-800\b/g, replacement: 'theme-border', description: 'border-zinc-800 → theme-border' },
  { pattern: /\bborder-zinc-700\/50\b/g, replacement: 'theme-border-strong', description: 'border-zinc-700/50 → theme-border-strong' },
  { pattern: /\bborder-zinc-700\b/g, replacement: 'theme-border-strong', description: 'border-zinc-700 → theme-border-strong' },

  // ====== Border hover ======
  { pattern: /\bhover:border-zinc-600\b/g, replacement: 'hover:border-zinc-400', description: 'hover:border-zinc-600 → hover:border-zinc-400' },

  // ====== Hover backgrounds ======
  { pattern: /\bhover:bg-zinc-800\b/g, replacement: 'theme-surface-hover', description: 'hover:bg-zinc-800 → theme-surface-hover' },
  { pattern: /\bhover:bg-zinc-700\b/g, replacement: 'theme-surface-hover', description: 'hover:bg-zinc-700 → theme-surface-hover' },

  // ====== Hover text ======
  { pattern: /\bhover:text-zinc-200\b/g, replacement: 'hover:text-zinc-50', description: 'hover:text-zinc-200 → hover:text-zinc-50' },
  { pattern: /\bhover:text-white\b/g, replacement: 'hover:text-zinc-50', description: 'hover:text-white → hover:text-zinc-50' },

  // ====== Brand colors (emerald) ======
  // text-emerald-400 → theme-text-brand
  { pattern: /\btext-emerald-400\b/g, replacement: 'theme-text-brand', description: 'text-emerald-400 → theme-text-brand' },
  { pattern: /\btext-emerald-500\b/g, replacement: 'theme-text-brand', description: 'text-emerald-500 → theme-text-brand' },
  { pattern: /\btext-emerald-600\b/g, replacement: 'theme-text-brand', description: 'text-emerald-600 → theme-text-brand' },

  // bg-emerald-500 → theme-brand (solid buttons)
  { pattern: /\bbg-emerald-500\b/g, replacement: 'theme-brand', description: 'bg-emerald-500 → theme-brand' },
  { pattern: /\bbg-emerald-600\b/g, replacement: 'theme-brand', description: 'bg-emerald-600 → theme-brand' },
  // bg-emerald-500/10 → theme-brand-light (subtle backgrounds)
  { pattern: /\bbg-emerald-500\/10\b/g, replacement: 'bg-emerald-500/10', description: 'bg-emerald-500/10 (keep — opacity variant)' },
  { pattern: /\bbg-emerald-500\/20\b/g, replacement: 'bg-emerald-500/20', description: 'bg-emerald-500/20 (keep — opacity variant)' },

  // border-emerald → border-brand
  { pattern: /\bborder-emerald-400\b/g, replacement: 'theme-border-focus', description: 'border-emerald-400 → theme-border-focus' },
  { pattern: /\bborder-emerald-500\b/g, replacement: 'theme-border-focus', description: 'border-emerald-500 → theme-border-focus' },

  // Gradientes
  { pattern: /\bfrom-zinc-950\b/g, replacement: 'from-zinc-100 dark:from-zinc-950', description: 'from-zinc-950 → theme-aware' },
  { pattern: /\bvia-zinc-900\b/g, replacement: 'via-white dark:via-zinc-900', description: 'via-zinc-900 → theme-aware' },
  { pattern: /\bto-zinc-950\b/g, replacement: 'to-zinc-100 dark:to-zinc-950', description: 'to-zinc-950 → theme-aware' },

  // Grayscale text
  { pattern: /\btext-gray-400\b/g, replacement: 'theme-text-tertiary', description: 'text-gray-400 → theme-text-tertiary' },
  { pattern: /\btext-gray-500\b/g, replacement: 'theme-text-tertiary', description: 'text-gray-500 → theme-text-tertiary' },
  { pattern: /\btext-gray-600\b/g, replacement: 'theme-text-secondary', description: 'text-gray-600 → theme-text-secondary' },
  { pattern: /\btext-gray-700\b/g, replacement: 'theme-text-primary', description: 'text-gray-700 → theme-text-primary' },
  { pattern: /\btext-gray-800\b/g, replacement: 'theme-text-primary', description: 'text-gray-800 → theme-text-primary' },
  { pattern: /\btext-gray-900\b/g, replacement: 'theme-text-primary', description: 'text-gray-900 → theme-text-primary' },
  { pattern: /\bbg-gray-50\b/g, replacement: 'theme-bg-secondary', description: 'bg-gray-50 → theme-bg-secondary' },
  { pattern: /\bbg-gray-100\b/g, replacement: 'theme-bg-secondary', description: 'bg-gray-100 → theme-bg-secondary' },
  { pattern: /\bbg-gray-200\b/g, replacement: 'theme-bg-tertiary', description: 'bg-gray-200 → theme-bg-tertiary' },
  { pattern: /\bbg-gray-800\b/g, replacement: 'theme-surface-secondary', description: 'bg-gray-800 → theme-surface-secondary' },
  { pattern: /\bbg-gray-900\b/g, replacement: 'theme-surface', description: 'bg-gray-900 → theme-surface' },
];

// ---------------------------------------------------------------------------
// Scan & Process
// ---------------------------------------------------------------------------

interface FileChange {
  file: string;
  original: string;
  modified: string;
  changes: string[];
}

function findAllAstroFiles(dir: string): string[] {
  const files: string[] = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      files.push(...findAllAstroFiles(fullPath));
    } else if (entry.isFile() && extname(entry.name) === '.astro') {
      files.push(fullPath);
    }
  }
  return files;
}

function processFile(filePath: string): FileChange | null {
  const original = readFileSync(filePath, 'utf-8');
  let modified = original;
  const changes: string[] = [];

  for (const repl of replacements) {
    const before = modified;
    modified = modified.replace(repl.pattern, repl.replacement);
    if (modified !== before) {
      const count = (before.match(repl.pattern) || []).length;
      changes.push(`  ${repl.description} (${count} ocurrencias)`);
    }
  }

  if (changes.length === 0) return null;

  return {
    file: relative(ROOT, filePath),
    original,
    modified,
    changes,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const files = specificFile
  ? [resolve(ROOT, specificFile)]
  : findAllAstroFiles(SRC);

console.log(`\n🔍 Escaneando ${files.length} archivos Astro...`);
if (dryRun) console.log('⚠️  MODO DRY-RUN: no se modificarán archivos.\n');

const results: FileChange[] = [];
let totalChanges = 0;

for (const file of files) {
  const result = processFile(file);
  if (result) {
    results.push(result);
    totalChanges += result.changes.length;
  }
}

if (results.length === 0) {
  console.log('✅ No se encontraron clases hardcodeadas para migrar.\n');
  process.exit(0);
}

console.log(`📋 ${results.length} archivos con clases hardcodeadas (${totalChanges} tipos de cambios):\n`);

for (const result of results) {
  console.log(`📄 ${result.file}`);
  for (const change of result.changes) {
    console.log(change);
  }
  console.log();
}

if (!dryRun) {
  console.log('✏️  Aplicando cambios...\n');
  for (const result of results) {
    writeFileSync(resolve(ROOT, result.file), result.modified, 'utf-8');
    console.log(`  ✅ ${result.file}`);
  }
  console.log(`\n🎉 Migración completada: ${results.length} archivos actualizados.\n`);
} else {
  console.log('💡 Ejecuta sin --dry-run para aplicar los cambios.\n');
}