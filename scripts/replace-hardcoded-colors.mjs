/**
 * Migración automática de clases hardcodeadas zinc/emerald a CSS variables.
 * Soluciona texto invisible en light mode y desbordamiento de inputs.
 */
import { readFileSync, writeFileSync, globSync } from 'fs';
import { join } from 'path';

const ROOT = join(import.meta.dirname, '..', 'src');

const files = globSync('**/*.astro', { cwd: ROOT });

// Mapa de reemplazos de clases hardcodeadas a CSS variables
const replacements = [
    // ── Fondos ──────────────────────────────────────
    { from: /bg-zinc-950/g, to: 'bg-[var(--surface-0)]' },
    { from: /bg-zinc-900\/95/g, to: 'bg-[var(--surface-1)]' },
    { from: /bg-zinc-900\/90/g, to: 'glass' },
    { from: /bg-zinc-900\/80/g, to: 'bg-[var(--surface-1)]' },
    { from: /bg-zinc-900\/60/g, to: 'bg-[var(--surface-2)]' },
    { from: /bg-zinc-900\/40/g, to: 'bg-[var(--surface-2)]' },
    { from: /bg-zinc-900\b/g, to: 'bg-[var(--surface-1)]' },
    { from: /bg-zinc-800\/80/g, to: 'bg-[var(--surface-3)]' },
    { from: /bg-zinc-800\/60/g, to: 'bg-[var(--surface-3)]' },
    { from: /bg-zinc-800\/50/g, to: 'bg-[var(--surface-4)]' },
    { from: /bg-zinc-800\/40/g, to: 'bg-[var(--surface-3)]' },
    { from: /bg-zinc-800\/30/g, to: 'bg-[var(--surface-4)]' },
    { from: /bg-zinc-800\b/g, to: 'bg-[var(--surface-3)]' },
    { from: /bg-zinc-700\/80/g, to: 'bg-[var(--surface-4)]' },
    { from: /bg-zinc-700\b/g, to: 'bg-[var(--surface-4)]' },
    { from: /bg-zinc-600\b/g, to: 'bg-[var(--surface-5)]' },
    { from: /bg-zinc-500\/10/g, to: 'bg-[var(--brand-dim)]' },
    { from: /bg-zinc-500\/5/g, to: 'bg-[var(--brand-dim)]' },

    // ── Bordes ──────────────────────────────────────
    { from: /border-zinc-900/g, to: 'border-[var(--surface-2)]' },
    { from: /border-zinc-800\/60/g, to: 'border-[var(--border-default)]' },
    { from: /border-zinc-800\/40/g, to: 'border-[var(--border-subtle)]' },
    { from: /border-zinc-800\b/g, to: 'border-[var(--border-default)]' },
    { from: /border-zinc-700\/50/g, to: 'border-[var(--border-default)]' },
    { from: /border-zinc-700\/60/g, to: 'border-[var(--border-default)]' },
    { from: /border-zinc-700\b/g, to: 'border-[var(--border-strong)]' },
    { from: /border-zinc-600/g, to: 'border-[var(--border-strong)]' },

    // ── Textos ──────────────────────────────────────
    { from: /text-zinc-900/g, to: 'text-[var(--text-primary)]' },
    { from: /text-zinc-200/g, to: 'text-[var(--text-primary)]' },
    { from: /text-zinc-300/g, to: 'text-[var(--text-secondary)]' },
    { from: /text-zinc-400/g, to: 'text-[var(--text-secondary)]' },
    { from: /text-zinc-500/g, to: 'text-[var(--text-tertiary)]' },
    { from: /text-zinc-600/g, to: 'text-[var(--text-disabled)]' },
    { from: /text-zinc-100/g, to: 'text-[var(--text-primary)]' },
    { from: /text-zinc-700/g, to: 'text-[var(--text-disabled)]' },
    { from: /text-zinc-800/g, to: 'text-[var(--text-primary)]' },

    // ── Placeholders ────────────────────────────────
    { from: /placeholder-zinc-600/g, to: 'placeholder:text-[var(--text-tertiary)]' },
    { from: /placeholder-zinc-500/g, to: 'placeholder:text-[var(--text-tertiary)]' },
    { from: /placeholder-zinc-400/g, to: 'placeholder:text-[var(--text-tertiary)]' },

    // ── Brand colors (emerald → CSS var) ───────────
    { from: /bg-emerald-500\/10/g, to: 'bg-[var(--brand-dim)]' },
    { from: /bg-emerald-500\/20/g, to: 'bg-[var(--brand-dim)]' },
    { from: /bg-emerald-500\/5/g, to: 'bg-[var(--brand-dim)]' },
    { from: /bg-emerald-400\/10/g, to: 'bg-[var(--brand-dim)]' },
    { from: /text-emerald-400/g, to: 'text-[var(--brand)]' },
    { from: /text-emerald-300/g, to: 'text-[var(--brand-hover)]' },
    { from: /text-emerald-500/g, to: 'text-[var(--brand)]' },
    { from: /text-emerald-200/g, to: 'text-[var(--brand-hover)]' },
    { from: /text-emerald-600/g, to: 'text-[var(--brand)]' },
    { from: /border-emerald-500\/50/g, to: 'border-[var(--border-brand)]' },
    { from: /border-emerald-500\/20/g, to: 'border-[var(--border-brand)]' },
    { from: /border-emerald-500\/10/g, to: 'border-[var(--border-brand)]' },
    { from: /border-emerald-400/g, to: 'border-[var(--border-brand)]' },
    { from: /bg-emerald-500\/30/g, to: 'bg-[var(--brand-dim)]' },
    { from: /focus:border-emerald-500\/50/g, to: 'focus:border-[var(--brand)]' },
    { from: /hover:text-emerald-300/g, to: 'hover:text-[var(--brand-hover)]' },
    { from: /hover:bg-emerald-500\/20/g, to: 'hover:bg-[var(--brand-dim)]' },
    { from: /hover:bg-emerald-500\/10/g, to: 'hover:bg-[var(--brand-dim)]' },
    { from: /shadow-emerald-500\/20/g, to: 'shadow-[var(--shadow-glow-sm)]' },
    { from: /shadow-emerald-500\/30/g, to: 'shadow-[var(--shadow-glow-md)]' },
    { from: /from-emerald-400/g, to: 'from-[var(--brand-hover)]' },
    { from: /from-emerald-500/g, to: 'from-[var(--brand)]' },
    { from: /to-emerald-500/g, to: 'to-[var(--brand)]' },
    { from: /to-emerald-600/g, to: 'to-[var(--brand)]' },
    { from: /bg-emerald-600/g, to: 'bg-[var(--brand)]' },
    { from: /bg-emerald-500\b/g, to: 'bg-[var(--brand)]' },
    { from: /hover:bg-emerald-500/g, to: 'hover:bg-[var(--brand-hover)]' },
    { from: /ring-emerald-500\/10/g, to: 'ring-[var(--brand-dim)]' },
    { from: /ring-emerald-500\/20/g, to: 'ring-[var(--brand-dim)]' },
    { from: /focus:ring-emerald-500\/10/g, to: 'focus:shadow-[0_0_0_3px_var(--brand-dim)]' },
    { from: /focus:ring-2 focus:ring-emerald-500\/20/g, to: 'focus:shadow-[0_0_0_3px_var(--brand-dim)]' },

    // ── Accent colors ───────────────────────────────
    { from: /bg-blue-500\/10/g, to: 'bg-[var(--info-dim)]' },
    { from: /text-blue-400/g, to: 'text-[var(--info)]' },
    { from: /border-blue-500\/20/g, to: 'border-[var(--info)]' },
    { from: /bg-purple-500\/10/g, to: 'bg-[var(--accent-purple-dim)]' },
    { from: /text-purple-400/g, to: 'text-[var(--accent-purple)]' },
    { from: /border-purple-500\/20/g, to: 'border-[var(--accent-purple)]' },
    { from: /bg-orange-500\/10/g, to: 'bg-[var(--warning-dim)]' },
    { from: /text-orange-400/g, to: 'text-[var(--warning)]' },
    { from: /border-orange-500\/20/g, to: 'border-[var(--warning)]' },
    { from: /bg-rose-500\/10/g, to: 'bg-[var(--danger-dim)]' },
    { from: /text-rose-400/g, to: 'text-[var(--danger)]' },
    { from: /bg-yellow-500\/10/g, to: 'bg-[var(--warning-dim)]' },
    { from: /bg-yellow-500\/5/g, to: 'bg-[var(--warning-dim)]' },
    { from: /text-yellow-400/g, to: 'text-[var(--warning)]' },
    { from: /border-yellow-500\/20/g, to: 'border-[var(--warning)]' },

    // ── Red colors (danger) ─────────────────────────
    { from: /bg-red-500\/10/g, to: 'bg-[var(--danger-dim)]' },
    { from: /bg-red-500\/5/g, to: 'bg-[var(--danger-dim)]' },
    { from: /text-red-400/g, to: 'text-[var(--danger)]' },
    { from: /text-red-300/g, to: 'text-[var(--danger)]' },
    { from: /border-red-500\/20/g, to: 'border-[var(--danger)]' },
    { from: /hover:bg-red-500\/20/g, to: 'hover:bg-[var(--danger-dim)]' },
    { from: /bg-red-500\/20/g, to: 'bg-[var(--danger-dim)]' },

    // ── Orange/Amber colors ─────────────────────────
    { from: /bg-orange-500\/5/g, to: 'bg-[var(--warning-dim)]' },
    { from: /text-orange-300/g, to: 'text-[var(--warning)]' },
];

let totalReplaced = 0;

for (const file of files) {
    const fullPath = join(ROOT, file);
    let content = readFileSync(fullPath, 'utf-8');
    let fileChanged = false;

    for (const { from, to } of replacements) {
        const before = content;
        content = content.replace(from, to);
        if (content !== before) {
            fileChanged = true;
        }
    }

    if (fileChanged) {
        writeFileSync(fullPath, content, 'utf-8');
        totalReplaced++;
        console.log(`✅ Migrado: ${file}`);
    }
}

console.log(`\n🎨 ${totalReplaced} archivos migrados a CSS variables.`);
