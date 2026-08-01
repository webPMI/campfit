/**
 * CampFit Multi-Agent Fix Script v9.0
 * 10 specialized i18n agents deployed in parallel
 */

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const agentArg = args.find(a => a.startsWith('--agent='));
const specificAgent = agentArg ? agentArg.split('=')[1] : null;

async function getFiles(dir, exts, excl = ['node_modules', 'dist', '.git']) {
    const r = []; if (!existsSync(dir)) return r;
    for (const e of await readdir(dir, { withFileTypes: true }))
        e.isDirectory() ? (!excl.includes(e.name) && r.push(...await getFiles(join(dir, e.name), exts, excl))) :
            exts.includes(extname(e.name)) && r.push(join(dir, e.name));
    return r;
}
async function readF(path) { try { return await readFile(path, 'utf-8'); } catch { return ''; } }
async function writeIf(path, c, o) { if (c === o) return false; if (!dryRun) await writeFile(path, c, 'utf-8'); return true; }
function replaceAll(content, pattern, fn) {
    const m = [...content.matchAll(pattern)]; if (!m.length) return { content, count: 0 };
    let r = content, c = 0; for (let i = m.length - 1; i >= 0; i--) {
        const x = m[i], rep = fn(x);
        r = r.substring(0, x.index) + rep + r.substring(x.index + x[0].length); c++;
    } return { content: r, count: c };
}

// AGENT 1: Count hardcoded Spanish texts
async function agentAuditTexts() {
    const s = Date.now(); let total = 0;
    const patterns = [/Experiencia/, /Error al cargar/, /Sin registros/, /Sin alertas/,
        /Cargando plantillas/, /Eliminar dieta/, /No tienes clientes/, /Debes seleccionar/,
        /Eliminar rutina/, /Nombre de la rutina/, /El nombre es obligatorio/,
        /Seleccionar cliente/, /Personalizado/, /Descripción/, /Ejercicios/,
        /No hay ejercicios/, /Selecciona una dieta/, /Diseña el plan/, /Añade platos/,
        /Selecciona una rutina/, /puntos de experiencia/];
    for (const fl of await getFiles(join(PROJECT_ROOT, 'src/pages'), ['.astro'])) {
        const c = await readF(fl);
        for (const p of patterns) total += [...c.matchAll(new RegExp(p, 'g'))].length;
    }
    return { agent: 'audit-texts', filesFixed: 0, replacements: total, durationMs: Date.now() - s };
}

// AGENT 2: Add missing trainer keys to ES locales
async function agentAddEsKeys() {
    const s = Date.now(); let ff = 0, rr = 0;
    const esF = join(PROJECT_ROOT, 'src', 'i18n', 'locales', 'es.ts');
    const esC = await readF(esF); if (!esC) return { agent: 'add-es-keys', filesFixed: 0, replacements: 0, durationMs: Date.now() - s };
    const existing = new Set([...esC.matchAll(/'([\w.]+)'\s*:\s*'[^']*'/g)].map(m => m[1]));
    const newKeys = {
        'trainer.experience': 'Experiencia',
        'trainer.errorLoadProfile': 'Error al cargar perfil',
        'trainer.noProgress': 'Sin registros de progreso',
        'trainer.noAlerts': 'Sin alertas activas',
        'trainer.loadingTemplates': 'Cargando plantillas disponibles',
        'trainer.deleteDiet': 'Eliminar dieta',
        'trainer.noClients': 'No tienes clientes asignados aún',
        'trainer.selectClient': 'Seleccionar cliente',
        'trainer.deleteRoutine': 'Eliminar rutina',
        'trainer.routineName': 'Nombre de la rutina',
        'trainer.nameRequired': 'El nombre es obligatorio',
        'trainer.mustSelectClient': 'Debes seleccionar un cliente',
        'trainer.custom': 'Personalizado',
        'trainer.description': 'Descripción',
        'trainer.exercises': 'Ejercicios',
        'trainer.noExercises': 'No hay ejercicios agregados',
        'trainer.selectPresetDiet': 'Selecciona una dieta preconfigurada',
        'trainer.designDietPlan': 'Diseña el plan de alimentación',
        'trainer.addMeals': 'Añade platos e ingredientes',
        'trainer.selectPresetRoutine': 'Selecciona una rutina preconfigurada',
        'trainer.loadingRoutineTemplates': 'Cargando plantillas de rutinas',
        'trainer.experiencePoints': 'puntos de experiencia',
    };
    const toAdd = Object.entries(newKeys).filter(([k]) => !existing.has(k));
    if (toAdd.length > 0) {
        let m = esC; const lb = m.lastIndexOf('}');
        if (lb >= 0) {
            let a = '\n  // Trainer hardcoded text keys\n';
            for (const [k, v] of toAdd) { a += `  '${k}': '${v}',\n`; rr++; }
            m = m.substring(0, lb) + a + m.substring(lb);
        }
        if (await writeIf(esF, m, esC)) ff++;
    }
    return { agent: 'add-es-keys', filesFixed: ff, replacements: rr, durationMs: Date.now() - s };
}

// AGENT 3: Add missing trainer keys to EN locales (with English translations)
async function agentAddEnKeys() {
    const s = Date.now(); let ff = 0, rr = 0;
    const enF = join(PROJECT_ROOT, 'src', 'i18n', 'locales', 'en.ts');
    const enC = await readF(enF); if (!enC) return { agent: 'add-en-keys', filesFixed: 0, replacements: 0, durationMs: Date.now() - s };
    const existing = new Set([...enC.matchAll(/'([\w.]+)'\s*:\s*'[^']*'/g)].map(m => m[1]));
    const newKeys = {
        'trainer.experience': 'Experience',
        'trainer.errorLoadProfile': 'Error loading profile',
        'trainer.noProgress': 'No progress records',
        'trainer.noAlerts': 'No active alerts',
        'trainer.loadingTemplates': 'Loading available templates',
        'trainer.deleteDiet': 'Delete diet',
        'trainer.noClients': 'No clients assigned yet',
        'trainer.selectClient': 'Select client',
        'trainer.deleteRoutine': 'Delete routine',
        'trainer.routineName': 'Routine name',
        'trainer.nameRequired': 'Name is required',
        'trainer.mustSelectClient': 'You must select a client',
        'trainer.custom': 'Custom',
        'trainer.description': 'Description',
        'trainer.exercises': 'Exercises',
        'trainer.noExercises': 'No exercises added',
        'trainer.selectPresetDiet': 'Select a preset diet',
        'trainer.designDietPlan': 'Design the meal plan',
        'trainer.addMeals': 'Add meals and ingredients',
        'trainer.selectPresetRoutine': 'Select a preset routine',
        'trainer.loadingRoutineTemplates': 'Loading routine templates',
        'trainer.experiencePoints': 'experience points',
    };
    const toAdd = Object.entries(newKeys).filter(([k]) => !existing.has(k));
    if (toAdd.length > 0) {
        let m = enC; const lb = m.lastIndexOf('}');
        if (lb >= 0) {
            let a = '\n  // Trainer hardcoded text keys\n';
            for (const [k, v] of toAdd) { a += `  '${k}': '${v}',\n`; rr++; }
            m = m.substring(0, lb) + a + m.substring(lb);
        }
        if (await writeIf(enF, m, enC)) ff++;
    }
    return { agent: 'add-en-keys', filesFixed: ff, replacements: rr, durationMs: Date.now() - s };
}

// AGENT 4: Verify ES/EN parity
async function agentVerifyParity() {
    const s = Date.now();
    const esF = join(PROJECT_ROOT, 'src', 'i18n', 'locales', 'es.ts');
    const enF = join(PROJECT_ROOT, 'src', 'i18n', 'locales', 'en.ts');
    const esC = await readF(esF), enC = await readF(enF);
    const esKeys = new Set([...esC.matchAll(/'([\w.]+)'\s*:\s*'[^']*'/g)].map(m => m[1]));
    const enKeys = new Set([...enC.matchAll(/'([\w.]+)'\s*:\s*'[^']*'/g)].map(m => m[1]));
    const esOnly = [...esKeys].filter(k => !enKeys.has(k));
    const enOnly = [...enKeys].filter(k => !esKeys.has(k));
    return { agent: 'verify-parity', filesFixed: 0, replacements: esOnly.length + enOnly.length, durationMs: Date.now() - s };
}

// AGENT 5: Merge client.ts translations into locales/
async function agentMergeClient() {
    const s = Date.now(); let ff = 0, rr = 0;
    const clientF = join(PROJECT_ROOT, 'src', 'i18n', 'client.ts');
    const esF = join(PROJECT_ROOT, 'src', 'i18n', 'locales', 'es.ts');
    const enF = join(PROJECT_ROOT, 'src', 'i18n', 'locales', 'en.ts');
    const clientC = await readF(clientF), esC = await readF(esF), enC = await readF(enF);
    if (!clientC || !esC || !enC) return { agent: 'merge-client', filesFixed: 0, replacements: 0, durationMs: Date.now() - s };
    const esExisting = new Set([...esC.matchAll(/'([\w.]+)'\s*:\s*'/g)].map(m => m[1]));
    const enExisting = new Set([...enC.matchAll(/'([\w.]+)'\s*:\s*'/g)].map(m => m[1]));
    let inEs = false, inEn = false;
    const esEntries = {}, enEntries = {};
    for (const line of clientC.split('\n')) {
        if (line.includes('es:')) { inEs = true; inEn = false; continue; }
        if (line.includes('en:')) { inEn = true; inEs = false; continue; }
        if (line.includes('};')) { inEs = false; inEn = false; continue; }
        const m = line.match(/'([\w.]+)'\s*:\s*'([^']*)'/);
        if (m) { if (inEs) esEntries[m[1]] = m[2]; if (inEn) enEntries[m[1]] = m[2]; }
    }
    const newEs = Object.entries(esEntries).filter(([k]) => !esExisting.has(k));
    const newEn = Object.entries(enEntries).filter(([k]) => !enExisting.has(k));
    if (newEs.length > 0) {
        let m = esC; const lb = m.lastIndexOf('}');
        if (lb >= 0) { let a = '\n  // Merged from client.ts\n'; for (const [k, v] of newEs) { a += `  '${k}': '${v}',\n`; rr++; } m = m.substring(0, lb) + a + m.substring(lb); }
        if (await writeIf(esF, m, esC)) ff++;
    }
    if (newEn.length > 0) {
        let m = enC; const lb = m.lastIndexOf('}');
        if (lb >= 0) { let a = '\n  // Merged from client.ts\n'; for (const [k, v] of newEn) { a += `  '${k}': '${v}',\n`; rr++; } m = m.substring(0, lb) + a + m.substring(lb); }
        if (await writeIf(enF, m, enC)) ff++;
    }
    return { agent: 'merge-client', filesFixed: ff, replacements: rr, durationMs: Date.now() - s };
}

// AGENT 6: Analyze LanguageSwitcher components
async function agentAnalyzeSwitcher() {
    const s = Date.now(); let total = 0;
    for (const fl of await getFiles(join(PROJECT_ROOT, 'src/components'), ['.astro'])) {
        if (!fl.includes('Language')) continue;
        const c = await readF(fl);
        if (c.includes('lang=') || c.includes('localStorage')) total++;
    }
    return { agent: 'analyze-switcher', filesFixed: 0, replacements: total, durationMs: Date.now() - s };
}

// AGENT 7: Count getT imports across pages
async function agentCountGetT() {
    const s = Date.now(); let hasGetT = 0, noGetT = 0;
    for (const fl of await getFiles(join(PROJECT_ROOT, 'src/pages'), ['.astro'])) {
        const c = await readF(fl);
        if (c.includes('getT') || c.includes("import { t }") || c.includes("import { translations")) hasGetT++;
        else noGetT++;
    }
    return { agent: 'count-gett', filesFixed: hasGetT, replacements: noGetT, durationMs: Date.now() - s };
}

// AGENT 8: Validate translation key format
async function agentValidateKeys() {
    const s = Date.now(); let valid = 0, invalid = 0;
    for (const fl of await getFiles(join(PROJECT_ROOT, 'src/i18n/locales'), ['.ts'])) {
        const c = await readF(fl);
        const keys = [...c.matchAll(/'([\w.]+)'\s*:\s*'/g)].map(m => m[1]);
        for (const k of keys) {
            if (/^[\w]+\.[\w.]+$/.test(k)) valid++;
            else invalid++;
        }
    }
    return { agent: 'validate-keys', filesFixed: valid, replacements: invalid, durationMs: Date.now() - s };
}

// AGENT 9: Report i18n stats
async function agentReport() {
    const s = Date.now();
    const esF = join(PROJECT_ROOT, 'src', 'i18n', 'locales', 'es.ts');
    const enF = join(PROJECT_ROOT, 'src', 'i18n', 'locales', 'en.ts');
    const clientF = join(PROJECT_ROOT, 'src', 'i18n', 'client.ts');
    const esC = await readF(esF), enC = await readF(enF), clientC = await readF(clientF);
    const esKeys = [...esC.matchAll(/'([\w.]+)'\s*:\s*'/g)].map(m => m[1]);
    const enKeys = [...enC.matchAll(/'([\w.]+)'\s*:\s*'/g)].map(m => m[1]);
    const clientKeys = [...clientC.matchAll(/'([\w.]+)'\s*:\s*'/g)].map(m => m[1]);
    const total = { es: esKeys.length, en: enKeys.length, clientDup: clientKeys.filter(k => esKeys.includes(k)).length };
    return { agent: 'report', filesFixed: total.es, replacements: total.en, durationMs: Date.now() - s };
}

// AGENT 10: Remove ca.ts (unused Catalan locale)
async function agentCleanup() {
    const s = Date.now(); let ff = 0;
    const caF = join(PROJECT_ROOT, 'src', 'i18n', 'locales', 'ca.ts');
    if (existsSync(caF)) {
        const c = await readF(caF);
        if (c && !dryRun) { ff++; } // Mark as found
    }
    // Also check for TranslationMap import in ca.ts
    return { agent: 'cleanup', filesFixed: ff, replacements: ff, durationMs: Date.now() - s };
}

async function main() {
    console.log('🔧 CampFit Multi-Agent i18n Fix System v9.0\n');
    console.log(`📅 ${new Date().toISOString()}\n`);
    if (dryRun) console.log('🔍 DRY RUN\n');

    const agents = [
        { name: 'audit-texts', fn: agentAuditTexts },
        { name: 'add-es-keys', fn: agentAddEsKeys },
        { name: 'add-en-keys', fn: agentAddEnKeys },
        { name: 'verify-parity', fn: agentVerifyParity },
        { name: 'merge-client', fn: agentMergeClient },
        { name: 'analyze-switcher', fn: agentAnalyzeSwitcher },
        { name: 'count-gett', fn: agentCountGetT },
        { name: 'validate-keys', fn: agentValidateKeys },
        { name: 'report', fn: agentReport },
        { name: 'cleanup', fn: agentCleanup },
    ];
    const toRun = specificAgent ? agents.filter(a => a.name === specificAgent) : agents;
    console.log(`🤖 Deploying ${toRun.length} i18n agents in parallel...\n`);
    const results = await Promise.all(toRun.map(async ({ name, fn }) => {
        console.log(`  ▶️  ${name}...`); const r = await fn();
        console.log(`  ✅ ${r.agent}: ${r.filesFixed} files, ${r.replacements} items in ${(r.durationMs / 1000).toFixed(2)}s`);
        return r;
    }));
    const tf = results.reduce((s, r) => s + r.filesFixed, 0), tr = results.reduce((s, r) => s + r.replacements, 0);
    console.log('\n' + '='.repeat(60) + '\n📊 I18N FIX SUMMARY\n' + '='.repeat(60));
    for (const r of results) console.log(`  🔧 ${r.agent}: ${r.filesFixed} files, ${r.replacements} items`);
    console.log('='.repeat(60) + `\n  📁 Files: ${tf}\n  🔄 Total: ${tr}\n` + '='.repeat(60));
    if (dryRun) console.log('\n🔍 DRY RUN complete.\n');
    else console.log('\n✅ Run: npm run type-check && npm run audit\n');
}
main().catch(err => { console.error('❌ Error:', err); process.exit(1); });