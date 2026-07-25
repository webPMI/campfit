#!/usr/bin/env node
/**
 * Script para corregir clases rotas tras la migración.
 * Arregla:
 * 1. theme-surface-hover mal usado como bg base → theme-surface-secondary
 * 2. focus:theme-border-focus/50 → eliminado (no compatible con custom classes)
 * 3. placeholder-zinc → placeholder-theme-text-*
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, join, extname, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');
const SRC = resolve(ROOT, 'src');

const replacements: { pattern: RegExp; replacement: string; desc: string }[] = [
  {
    pattern: /\btheme-surface-hover\b(?=\s+(px-|py-|text-|rounded-|w-|h-|outline-|transition-|focus:))/g,
    replacement: 'theme-surface-secondary',
    desc: 'theme-surface-hover (bg base) → theme-surface-secondary',
  },
  {
    pattern: /\bfocus:theme-border-focus\/50\b/g,
    replacement: 'focus:ring-2 focus:ring-emerald-500/10',
    desc: 'focus:theme-border-focus/50 → focus:ring-2 focus:ring-emerald-500/10',
  },
  {
    pattern: /\bplaceholder-zinc-600\b/g,
    replacement: 'placeholder-theme-text-tertiary',
    desc: 'placeholder-zinc-600 → placeholder-theme-text-tertiary',
  },
  {
    pattern: /\bplaceholder-zinc-500\b/g,
    replacement: 'placeholder-theme-text-tertiary',
    desc: 'placeholder-zinc-500 → placeholder-theme-text-tertiary',
  },
  {
    pattern: /\bplaceholder-zinc-400\b/g,
    replacement: 'placeholder-theme-text-secondary',
    desc: 'placeholder-zinc-400 → placeholder-theme-text-secondary',
  },
];

const placeholderCSS = `
/* --- Placeholder text --- */
.placeholder-theme-text-tertiary::placeholder {
  color: var(--color-text-tertiary);
}
.placeholder-theme-text-secondary::placeholder {
  color: var(--color-text-secondary);
}`;

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

const files = findAllAstroFiles(SRC);
let fixedCount = 0;
let changeCount = 0;

for (const file of files) {
  let content = readFileSync(file, 'utf-8');
  let modified = false;

  for (const repl of replacements) {
    const before = content;
    content = content.replace(repl.pattern, repl.replacement);
    if (content !== before) {
      const occurrences = (before.match(repl.pattern) || []).length;
      console.log(`  ${repl.desc} (${occurrences}x) → ${relative(ROOT, file)}`);
      modified = true;
      changeCount += occurrences;
    }
  }

  if (modified) {
    writeFileSync(file, content, 'utf-8');
    fixedCount++;
  }
}

// Add placeholder CSS to theme.css
const themeCSSPath = resolve(SRC, 'styles', 'theme.css');
let themeCSS = readFileSync(themeCSSPath, 'utf-8');

if (!themeCSS.includes('placeholder-theme-text-tertiary')) {
  const before = '/* --- Scrollbar --- */';
  const after = placeholderCSS + '\n\n/* --- Scrollbar --- */';
  themeCSS = themeCSS.replace(before, after);
  writeFileSync(themeCSSPath, themeCSS, 'utf-8');
  console.log('  + placeholder classes → theme.css');
}

console.log(`\n✅ ${fixedCount} archivos corregidos (${changeCount} cambios)`);