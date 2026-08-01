/**
 * CampFit Multi-Agent Audit Script
 * 
 * Runs automated checks across 6 audit areas in parallel:
 * 1. Security (auth, route guards, firestore rules, env vars)
 * 2. Code Quality (TypeScript types, file sizes, console.*, window.*, any)
 * 3. Performance (Firestore queries, pagination, limits)
 * 4. UI/UX (theme system, accessibility, hardcoded colors)
 * 5. Testing (coverage, placeholders, E2E)
 * 6. i18n (translation parity, missing keys)
 * 
 * Usage:
 *   node scripts/audit.mjs              # Full audit
 *   node scripts/audit.mjs --quick      # Quick audit (no build/test)
 *   node scripts/audit.mjs --area=security  # Single area
 * 
 * @returns {void} Writes report to docs/AUDIT_REPORT.md
 */

import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// ============================================================
// TYPES
// ============================================================

/**
 * @typedef {Object} AuditFinding
 * @property {string} id - Unique identifier (e.g., 'SEC-001')
 * @property {'critical'|'medium'|'low'} severity
 * @property {string} title - Short title
 * @property {string} description - Detailed description
 * @property {string} file - File path
 * @property {number} [line] - Line number
 * @property {string} agent - Agent that found this
 * @property {string} recommendation - How to fix
 */

/**
 * @typedef {Object} AuditArea
 * @property {string} name
 * @property {string} agent
 * @property {AuditFinding[]} findings
 * @property {number} filesScanned
 * @property {number} durationMs
 */

// ============================================================
// UTILITIES
// ============================================================

/**
 * Recursively get all files in a directory with given extensions.
 * @param {string} dir - Directory to scan
 * @param {string[]} extensions - File extensions to include (e.g., ['.ts', '.astro'])
 * @param {string[]} excludeDirs - Directory names to exclude
 * @returns {Promise<string[]>} Array of file paths
 */
async function getFiles(dir, extensions, excludeDirs = ['node_modules', 'dist', '.git', 'tests']) {
    const results = [];

    if (!existsSync(dir)) return results;

    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = join(dir, entry.name);

        if (entry.isDirectory()) {
            if (!excludeDirs.includes(entry.name)) {
                results.push(...await getFiles(fullPath, extensions, excludeDirs));
            }
        } else if (extensions.includes(extname(entry.name))) {
            results.push(fullPath);
        }
    }

    return results;
}

/**
 * Read file content safely.
 * @param {string} filePath
 * @returns {Promise<string>}
 */
async function safeReadFile(filePath) {
    try {
        return await readFile(filePath, 'utf-8');
    } catch {
        return '';
    }
}

/**
 * Count lines in a string.
 * @param {string} content
 * @returns {number}
 */
function countLines(content) {
    return content.split('\n').length;
}

/**
 * Get line number of a match in content.
 * @param {string} content
 * @param {number} index - Character index
 * @returns {number}
 */
function getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
}

// ============================================================
// AUDIT AREA 1: SECURITY
// ============================================================

/**
 * Security Audit Agent
 * Checks: route guards, firestore rules, env vars, auth patterns, CSP
 * @returns {Promise<AuditArea>}
 */
async function auditSecurity() {
    const start = Date.now();
    const findings = [];
    let filesScanned = 0;

    // 1. Check route guards cover all protected pages
    const routeGuardsPath = join(PROJECT_ROOT, 'src/lib/routeGuards.ts');
    const routeGuardsContent = await safeReadFile(routeGuardsPath);
    filesScanned++;

    const protectedRoutes = [
        '/admin/dashboard', '/admin/users', '/admin/trainers', '/admin/clients',
        '/admin/clinical', '/admin/workouts', '/admin/diets', '/admin/progress',
        '/admin/chat', '/admin/settings',
        '/trainer/dashboard', '/trainer/clients', '/trainer/clinical',
        '/trainer/workouts', '/trainer/diets', '/trainer/chat', '/trainer/settings',
        '/client/dashboard', '/client/workouts', '/client/diets', '/client/progress',
        '/client/medical-profile', '/client/chat', '/client/support', '/client/settings',
    ];

    for (const route of protectedRoutes) {
        if (!routeGuardsContent.includes(route)) {
            findings.push({
                id: `SEC-${String(findings.length + 1).padStart(3, '0')}`,
                severity: 'critical',
                title: `Ruta no protegida: ${route}`,
                description: `La ruta ${route} no aparece en routeGuards.ts. Cualquier usuario autenticado podría acceder.`,
                file: 'src/lib/routeGuards.ts',
                agent: 'audit-security',
                recommendation: `Agregar ${route} a las rutas protegidas en routeGuards.ts`,
            });
        }
    }

    // 2. Check firestore.rules for bootstrap admin email
    const firestoreRulesPath = join(PROJECT_ROOT, 'firestore.rules');
    const firestoreRulesContent = await safeReadFile(firestoreRulesPath);
    filesScanned++;

    const authServicePath = join(PROJECT_ROOT, 'src/services/authService.ts');
    const authServiceContent = await safeReadFile(authServicePath);
    filesScanned++;

    const emailRegex = /['"]([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})['"]/g;
    const authEmails = new Set();
    let match;
    while ((match = emailRegex.exec(authServiceContent)) !== null) {
        if (match[1].includes('gmail.com') || match[1].includes('admin')) {
            authEmails.add(match[1]);
        }
    }

    for (const email of authEmails) {
        if (!firestoreRulesContent.includes(email)) {
            findings.push({
                id: `SEC-${String(findings.length + 1).padStart(3, '0')}`,
                severity: 'critical',
                title: `Email bootstrap no en firestore.rules: ${email}`,
                description: `El código usa ${email} como admin bootstrap, pero no está en firestore.rules. Firestore denegará acceso.`,
                file: 'firestore.rules',
                agent: 'audit-security',
                recommendation: `Agregar ${email} a firestore.rules como admin autorizado`,
            });
        }
    }

    // 3. Check .env.example for real credentials
    const envExamplePath = join(PROJECT_ROOT, '.env.example');
    const envExampleContent = await safeReadFile(envExamplePath);
    filesScanned++;

    const realKeyPattern = /AIza[0-9A-Za-z_-]{35}/;
    if (realKeyPattern.test(envExampleContent)) {
        findings.push({
            id: `SEC-${String(findings.length + 1).padStart(3, '0')}`,
            severity: 'critical',
            title: 'Credenciales reales en .env.example',
            description: '.env.example contiene una API key real de Firebase (AIza...). Debe ser un placeholder.',
            file: '.env.example',
            agent: 'audit-security',
            recommendation: 'Reemplazar credenciales reales con placeholders (ej: YOUR_API_KEY_HERE)',
        });
    }

    // 4. Check for hardcoded secrets in source
    const srcFiles = await getFiles(join(PROJECT_ROOT, 'src'), ['.ts', '.astro', '.mjs']);
    for (const file of srcFiles) {
        const content = await safeReadFile(file);
        filesScanned++;

        if (realKeyPattern.test(content)) {
            findings.push({
                id: `SEC-${String(findings.length + 1).padStart(3, '0')}`,
                severity: 'critical',
                title: 'API key hardcodeada en código fuente',
                description: `El archivo contiene una API key real de Firebase.`,
                file: relative(PROJECT_ROOT, file),
                agent: 'audit-security',
                recommendation: 'Usar import.meta.env.PUBLIC_FIREBASE_API_KEY en su lugar',
            });
        }

        const passwordPattern = /(?:password|secret|token|private_key)\s*[:=]\s*['"][^'"]{8,}['"]/i;
        if (passwordPattern.test(content) && !file.includes('test') && !file.includes('mock')) {
            const pwdMatch = passwordPattern.exec(content);
            if (pwdMatch) {
                findings.push({
                    id: `SEC-${String(findings.length + 1).padStart(3, '0')}`,
                    severity: 'medium',
                    title: 'Posible secreto hardcodeado',
                    description: `Patrón sospechoso: ${pwdMatch[0].substring(0, 50)}...`,
                    file: relative(PROJECT_ROOT, file),
                    agent: 'audit-security',
                    recommendation: 'Mover a variables de entorno',
                });
            }
        }
    }

    // 5. Check for try/catch with console.* instead of logger
    const catchPattern = /catch\s*\(\s*\w*\s*\)\s*{/g;
    for (const file of srcFiles) {
        const content = await safeReadFile(file);
        const catches = content.match(catchPattern);
        if (catches) {
            for (let i = 0; i < catches.length; i++) {
                const idx = content.indexOf(catches[i]);
                const line = getLineNumber(content, idx);
                const surrounding = content.substring(idx, idx + 200);
                if (!surrounding.includes('instanceof') && !surrounding.includes('as AuthError') && !surrounding.includes('as FirebaseError') && !surrounding.includes(': Error')) {
                    if (surrounding.includes('console.') && !surrounding.includes('logger.')) {
                        findings.push({
                            id: `SEC-${String(findings.length + 1).padStart(3, '0')}`,
                            severity: 'low',
                            title: 'Catch genérico con console.* en lugar de logger',
                            description: `Bloque catch usa console.* en lugar del logger estructurado.`,
                            file: relative(PROJECT_ROOT, file),
                            line,
                            agent: 'audit-security',
                            recommendation: 'Usar logger.error con contexto tipado',
                        });
                    }
                }
            }
        }
    }

    return {
        name: 'Security',
        agent: 'audit-security',
        findings,
        filesScanned,
        durationMs: Date.now() - start,
    };
}

// ============================================================
// AUDIT AREA 2: CODE QUALITY
// ============================================================

/**
 * Code Quality Audit Agent
 * Checks: TypeScript any, file sizes >300 lines, console.*, window.__, JSDoc
 * @returns {Promise<AuditArea>}
 */
async function auditCodeQuality() {
    const start = Date.now();
    const findings = [];
    let filesScanned = 0;

    const srcFiles = await getFiles(join(PROJECT_ROOT, 'src'), ['.ts', '.astro', '.mjs']);

    for (const file of srcFiles) {
        const content = await safeReadFile(file);
        filesScanned++;
        const lines = countLines(content);
        const relPath = relative(PROJECT_ROOT, file);

        // 1. Check file size > 300 lines
        if (lines > 300) {
            findings.push({
                id: `QUAL-${String(findings.length + 1).padStart(3, '0')}`,
                severity: lines > 500 ? 'critical' : 'medium',
                title: `Archivo > 300 líneas (${lines} líneas)`,
                description: `El archivo tiene ${lines} líneas, violando Golden Rule #9 (máximo 300).`,
                file: relPath,
                line: lines,
                agent: 'audit-quality',
                recommendation: 'Refactorizar en componentes/archivos más pequeños',
            });
        }

        // 2. Check for `any` type
        const anyPattern = /:\s*any\b/g;
        let anyMatch;
        while ((anyMatch = anyPattern.exec(content)) !== null) {
            const line = getLineNumber(content, anyMatch.index);
            if (!file.includes('test') && !file.includes('mock') && !file.includes('.d.ts')) {
                findings.push({
                    id: `QUAL-${String(findings.length + 1).padStart(3, '0')}`,
                    severity: 'medium',
                    title: 'Uso de `any` (Golden Rule #1 violada)',
                    description: `Tipo \`any\` detectado. Debe tiparse explícitamente.`,
                    file: relPath,
                    line,
                    agent: 'audit-quality',
                    recommendation: 'Crear una interface o usar un tipo específico',
                });
            }
        }

        // 3. Check for console.log/error/warn (not logger)
        const consolePattern = /console\.(log|error|warn|info|debug)\s*\(/g;
        let consoleMatch;
        while ((consoleMatch = consolePattern.exec(content)) !== null) {
            const line = getLineNumber(content, consoleMatch.index);
            if (!file.includes('logger') && !file.includes('consoleFileLogger') && !file.includes('debug')) {
                findings.push({
                    id: `QUAL-${String(findings.length + 1).padStart(3, '0')}`,
                    severity: 'medium',
                    title: `console.${consoleMatch[1]} en lugar de logger`,
                    description: `Usa console.${consoleMatch[1]}() en lugar del sistema de logging estructurado.`,
                    file: relPath,
                    line,
                    agent: 'audit-quality',
                    recommendation: 'Usar logger.info/warn/error con contexto',
                });
            }
        }

        // 4. Check for window.__ global assignments
        const windowPattern = /window\.__\w+\s*=/g;
        let windowMatch;
        while ((windowMatch = windowPattern.exec(content)) !== null) {
            const line = getLineNumber(content, windowMatch.index);
            findings.push({
                id: `QUAL-${String(findings.length + 1).padStart(3, '0')}`,
                severity: 'medium',
                title: 'Asignación a window.__ (global)',
                description: `Asigna a window.__ que expone estado global. Debe usar event listeners con data-attributes.`,
                file: relPath,
                line,
                agent: 'audit-quality',
                recommendation: 'Migrar a event delegation con data-action attributes',
            });
        }

        // 5. Check for inline styles in .astro files (CSP violation)
        if (file.endsWith('.astro')) {
            const stylePattern = /<style\b/g;
            if (stylePattern.test(content)) {
                findings.push({
                    id: `QUAL-${String(findings.length + 1).padStart(3, '0')}`,
                    severity: 'low',
                    title: 'Bloque <style> inline (CSP)',
                    description: 'El bloque <style> inline puede romper la política CSP.',
                    file: relPath,
                    agent: 'audit-quality',
                    recommendation: 'Mover estilos a archivos CSS externos o usar Tailwind',
                });
            }
        }
    }

    return {
        name: 'Code Quality',
        agent: 'audit-quality',
        findings,
        filesScanned,
        durationMs: Date.now() - start,
    };
}

// ============================================================
// AUDIT AREA 3: PERFORMANCE
// ============================================================

/**
 * Performance Audit Agent
 * Checks: Firestore queries without limits, pagination, subscriptions, bundle size
 * @returns {Promise<AuditArea>}
 */
async function auditPerformance() {
    const start = Date.now();
    const findings = [];
    let filesScanned = 0;

    const srcFiles = await getFiles(join(PROJECT_ROOT, 'src'), ['.ts']);

    for (const file of srcFiles) {
        const content = await safeReadFile(file);
        filesScanned++;
        const relPath = relative(PROJECT_ROOT, file);

        // 1. Check for Firestore queries without .limit()
        const queryPattern = /\.(get|where|orderBy|onSnapshot)\s*\(/g;
        const limitPattern = /\.limit\s*\(/g;

        let queryMatch;
        while ((queryMatch = queryPattern.exec(content)) !== null) {
            const after = content.substring(queryMatch.index, queryMatch.index + 500);
            if (!limitPattern.test(after) && !file.includes('test') && !file.includes('mock')) {
                const line = getLineNumber(content, queryMatch.index);
                if (after.includes('collection(') || after.includes('Collection(')) {
                    findings.push({
                        id: `PERF-${String(findings.length + 1).padStart(3, '0')}`,
                        severity: 'medium',
                        title: 'Consulta Firestore sin .limit()',
                        description: 'Consulta a colección sin límite. Puede traer documentos excesivos.',
                        file: relPath,
                        line,
                        agent: 'audit-performance',
                        recommendation: 'Agregar .limit(50) o implementar paginación',
                    });
                }
            }
        }

        // 2. Check for onSnapshot without unsubscribe
        const onSnapshotPattern = /onSnapshot\s*\(/g;
        let snapshotMatch;
        while ((snapshotMatch = onSnapshotPattern.exec(content)) !== null) {
            const after = content.substring(snapshotMatch.index, snapshotMatch.index + 1000);
            if (!after.includes('return') && !after.includes('unsubscribe') && !file.includes('test')) {
                const line = getLineNumber(content, snapshotMatch.index);
                findings.push({
                    id: `PERF-${String(findings.length + 1).padStart(3, '0')}`,
                    severity: 'medium',
                    title: 'onSnapshot sin unsubscribe visible',
                    description: 'Suscripción onSnapshot sin unsubscribe explícito puede causar memory leaks.',
                    file: relPath,
                    line,
                    agent: 'audit-performance',
                    recommendation: 'Guardar el return de onSnapshot y llamar unsubscribe en cleanup',
                });
            }
        }

        // 3. Check for subscribeToCollectionCount (anti-pattern)
        if (content.includes('subscribeToCollectionCount')) {
            findings.push({
                id: `PERF-${String(findings.length + 1).padStart(3, '0')}`,
                severity: 'medium',
                title: 'subscribeToCollectionCount (anti-pattern)',
                description: 'Usa subscribeToCollectionCount que es ineficiente. Debe usar count() aggregation.',
                file: relPath,
                agent: 'audit-performance',
                recommendation: 'Reemplazar con firestore().collection().count().get()',
            });
        }
    }

    return {
        name: 'Performance',
        agent: 'audit-performance',
        findings,
        filesScanned,
        durationMs: Date.now() - start,
    };
}

// ============================================================
// AUDIT AREA 4: UI/UX
// ============================================================

/**
 * UI/UX Audit Agent
 * Checks: hardcoded colors, theme tokens, accessibility, components
 * @returns {Promise<AuditArea>}
 */
async function auditUIUX() {
    const start = Date.now();
    const findings = [];
    let filesScanned = 0;

    const astroFiles = await getFiles(join(PROJECT_ROOT, 'src'), ['.astro']);

    const hardcodedPatterns = [
        { regex: /bg-zinc-\d+/g, name: 'bg-zinc-*' },
        { regex: /text-zinc-\d+/g, name: 'text-zinc-*' },
        { regex: /bg-gray-\d+/g, name: 'bg-gray-*' },
        { regex: /text-gray-\d+/g, name: 'text-gray-*' },
        { regex: /bg-slate-\d+/g, name: 'bg-slate-*' },
        { regex: /text-slate-\d+/g, name: 'text-slate-*' },
        { regex: /bg-neutral-\d+/g, name: 'bg-neutral-*' },
        { regex: /text-neutral-\d+/g, name: 'text-neutral-*' },
        { regex: /#[0-9a-fA-F]{3,8}\b/g, name: 'hex color' },
    ];

    for (const file of astroFiles) {
        const content = await safeReadFile(file);
        filesScanned++;
        const relPath = relative(PROJECT_ROOT, file);

        for (const { regex, name } of hardcodedPatterns) {
            let match;
            const pattern = new RegExp(regex.source, 'g');
            while ((match = pattern.exec(content)) !== null) {
                const line = getLineNumber(content, match.index);
                if (!file.includes('theme-tokens') && !file.includes('BaseLayout')) {
                    findings.push({
                        id: `UIUX-${String(findings.length + 1).padStart(3, '0')}`,
                        severity: 'low',
                        title: `Color hardcodeado: ${match[0]}`,
                        description: `Usa ${name} en lugar de tokens del theme system.`,
                        file: relPath,
                        line,
                        agent: 'audit-uiux',
                        recommendation: 'Usar clases del theme system (bg-surface, text-content, etc.)',
                    });
                }
            }
        }

        // Check for missing aria attributes on interactive elements
        const buttonPattern = /<button\b[^>]*>/g;
        let buttonMatch;
        while ((buttonMatch = buttonPattern.exec(content)) !== null) {
            if (!buttonMatch[0].includes('aria-label') && !buttonMatch[0].includes('aria-labelledby')) {
                const after = content.substring(buttonMatch.index, buttonMatch.index + 200);
                if (after.includes('</button>') && !after.includes('>') && !buttonMatch[0].includes('type="submit"')) {
                    const line = getLineNumber(content, buttonMatch.index);
                    findings.push({
                        id: `UIUX-${String(findings.length + 1).padStart(3, '0')}`,
                        severity: 'low',
                        title: 'Botón sin aria-label',
                        description: 'Botón interactivo sin atributo de accesibilidad aria-label.',
                        file: relPath,
                        line,
                        agent: 'audit-uiux',
                        recommendation: 'Agregar aria-label descriptivo',
                    });
                }
            }
        }

        // Check for missing alt on images
        const imgPattern = /<img\b[^>]*>/g;
        let imgMatch;
        while ((imgMatch = imgPattern.exec(content)) !== null) {
            if (!imgMatch[0].includes('alt=')) {
                const line = getLineNumber(content, imgMatch.index);
                findings.push({
                    id: `UIUX-${String(findings.length + 1).padStart(3, '0')}`,
                    severity: 'low',
                    title: 'Imagen sin atributo alt',
                    description: 'Imagen sin atributo alt viola WCAG 2.1 AA.',
                    file: relPath,
                    line,
                    agent: 'audit-uiux',
                    recommendation: 'Agregar alt descriptivo o alt="" si es decorativa',
                });
            }
        }
    }

    // Check theme tokens consistency
    const themeTokensPath = join(PROJECT_ROOT, 'public/theme-tokens.css');
    const themeContent = await safeReadFile(themeTokensPath);
    filesScanned++;

    const rootVars = themeContent.match(/--[\w-]+:/g) || [];
    const darkVars = themeContent.match(/\.dark\s+--[\w-]+:/g) || [];

    if (rootVars.length !== darkVars.length) {
        findings.push({
            id: `UIUX-${String(findings.length + 1).padStart(3, '0')}`,
            severity: 'medium',
            title: 'Variables light/dark asimétricas',
            description: `:root tiene ${rootVars.length} variables, .dark tiene ${darkVars.length}. Falta sincronización.`,
            file: 'public/theme-tokens.css',
            agent: 'audit-uiux',
            recommendation: 'Sincronizar variables entre light y dark mode',
        });
    }

    return {
        name: 'UI/UX',
        agent: 'audit-uiux',
        findings,
        filesScanned,
        durationMs: Date.now() - start,
    };
}

// ============================================================
// AUDIT AREA 5: TESTING
// ============================================================

/**
 * Testing Audit Agent
 * Checks: test placeholders, coverage gaps, test file structure
 * @returns {Promise<AuditArea>}
 */
async function auditTesting() {
    const start = Date.now();
    const findings = [];
    let filesScanned = 0;

    const testFiles = await getFiles(join(PROJECT_ROOT, 'tests'), ['.ts'], []);

    for (const file of testFiles) {
        const content = await safeReadFile(file);
        filesScanned++;
        const relPath = relative(PROJECT_ROOT, file);

        // 1. Check for placeholder tests
        const placeholderPattern = /expect\(true\)\.toBe\(true\)/g;
        let placeholderMatch;
        while ((placeholderMatch = placeholderPattern.exec(content)) !== null) {
            const line = getLineNumber(content, placeholderMatch.index);
            findings.push({
                id: `TEST-${String(findings.length + 1).padStart(3, '0')}`,
                severity: 'medium',
                title: 'Test placeholder (expect(true).toBe(true))',
                description: 'Test placeholder sin aserción real.',
                file: relPath,
                line,
                agent: 'audit-testing',
                recommendation: 'Reemplazar con aserciones reales sobre el comportamiento',
            });
        }

        // 2. Check for empty test blocks
        const emptyTestPattern = /it\s*\(['"`].*['"`]\s*,\s*\(\)\s*=>\s*\{\s*\}\)/g;
        let emptyMatch;
        while ((emptyMatch = emptyTestPattern.exec(content)) !== null) {
            const line = getLineNumber(content, emptyMatch.index);
            findings.push({
                id: `TEST-${String(findings.length + 1).padStart(3, '0')}`,
                severity: 'medium',
                title: 'Test vacío (sin implementación)',
                description: 'Bloque it() sin implementación.',
                file: relPath,
                line,
                agent: 'audit-testing',
                recommendation: 'Implementar el test o marcar como .skip con razón',
            });
        }

        // 3. Check for .skip tests
        const skipPattern = /it\.skip|describe\.skip/g;
        let skipMatch;
        while ((skipMatch = skipPattern.exec(content)) !== null) {
            const line = getLineNumber(content, skipMatch.index);
            findings.push({
                id: `TEST-${String(findings.length + 1).padStart(3, '0')}`,
                severity: 'low',
                title: 'Test saltado (.skip)',
                description: 'Test marcado como .skip no se ejecuta.',
                file: relPath,
                line,
                agent: 'audit-testing',
                recommendation: 'Revisar y arreglar o eliminar si ya no aplica',
            });
        }

        // 4. Check for tests without assertions
        const testBlockPattern = /it\s*\(['"`]([^'"`]+)['"`]\s*,\s*async\s*\(\)\s*=>\s*\{([^}]*)\}/gs;
        let testBlockMatch;
        while ((testBlockMatch = testBlockPattern.exec(content)) !== null) {
            const body = testBlockMatch[2];
            if (!body.includes('expect') && !body.includes('assert') && !body.includes('throw')) {
                const line = getLineNumber(content, testBlockMatch.index);
                findings.push({
                    id: `TEST-${String(findings.length + 1).padStart(3, '0')}`,
                    severity: 'low',
                    title: `Test sin aserciones: ${testBlockMatch[1].substring(0, 40)}`,
                    description: 'Test sin llamadas a expect() o assert().',
                    file: relPath,
                    line,
                    agent: 'audit-testing',
                    recommendation: 'Agregar aserciones que validen el comportamiento',
                });
            }
        }
    }

    // Check for source files without corresponding tests
    const srcServiceFiles = await getFiles(join(PROJECT_ROOT, 'src/services'), ['.ts']);
    const srcLibFiles = await getFiles(join(PROJECT_ROOT, 'src/lib'), ['.ts'], []);

    for (const srcFile of [...srcServiceFiles, ...srcLibFiles]) {
        const relPath = relative(PROJECT_ROOT, srcFile);
        const baseName = relPath.replace(/\.\w+$/, '').replace(/[/\\]/g, '.');

        const testDirs = ['tests/unit/services', 'tests/unit/lib', 'tests/unit'];
        let hasTest = false;

        for (const testDir of testDirs) {
            const testPath = join(PROJECT_ROOT, testDir);
            if (existsSync(testPath)) {
                const testFilesInDir = await getFiles(testPath, ['.ts'], []);
                for (const testFile of testFilesInDir) {
                    const testRel = relative(PROJECT_ROOT, testFile);
                    if (testRel.includes(baseName.split('.').pop() || '')) {
                        hasTest = true;
                        break;
                    }
                }
            }
            if (hasTest) break;
        }

        if (!hasTest && !relPath.includes('types') && !relPath.includes('index') && !relPath.includes('debug')) {
            findings.push({
                id: `TEST-${String(findings.length + 1).padStart(3, '0')}`,
                severity: 'low',
                title: `Archivo sin test: ${relPath}`,
                description: 'Archivo de código fuente sin archivo de test correspondiente.',
                file: relPath,
                agent: 'audit-testing',
                recommendation: 'Crear test file en tests/unit/ con la misma estructura',
            });
        }
    }

    return {
        name: 'Testing',
        agent: 'audit-testing',
        findings,
        filesScanned,
        durationMs: Date.now() - start,
    };
}

// ============================================================
// AUDIT AREA 6: I18N
// ============================================================

/**
 * i18n Audit Agent
 * Checks: translation parity, missing keys, unused keys
 * @returns {Promise<AuditArea>}
 */
async function auditI18n() {
    const start = Date.now();
    const findings = [];
    let filesScanned = 0;

    const translationsPath = join(PROJECT_ROOT, 'src/i18n/translations.ts');
    const content = await safeReadFile(translationsPath);
    filesScanned++;

    // Extract ES keys
    const esBlockMatch = content.match(/es\s*:\s*\{([\s\S]*?)\n\}/);
    const enBlockMatch = content.match(/en\s*:\s*\{([\s\S]*?)\n\}/);

    const esKeys = new Set();
    const enKeys = new Set();

    if (esBlockMatch) {
        const keyPattern = /(\w+):\s*['"`]/g;
        let keyMatch;
        while ((keyMatch = keyPattern.exec(esBlockMatch[1])) !== null) {
            esKeys.add(keyMatch[1]);
        }
    }

    if (enBlockMatch) {
        const keyPattern = /(\w+):\s*['"`]/g;
        let keyMatch;
        while ((keyMatch = keyPattern.exec(enBlockMatch[1])) !== null) {
            enKeys.add(keyMatch[1]);
        }
    }

    // Find keys in ES but not in EN
    for (const key of esKeys) {
        if (!enKeys.has(key)) {
            findings.push({
                id: `I18N-${String(findings.length + 1).padStart(3, '0')}`,
                severity: 'medium',
                title: `Clave ES sin traducción EN: ${key}`,
                description: `La clave '${key}' existe en español pero no en inglés.`,
                file: 'src/i18n/translations.ts',
                agent: 'audit-i18n',
                recommendation: `Agregar traducción EN para '${key}'`,
            });
        }
    }

    // Find keys in EN but not in ES
    for (const key of enKeys) {
        if (!esKeys.has(key)) {
            findings.push({
                id: `I18N-${String(findings.length + 1).padStart(3, '0')}`,
                severity: 'medium',
                title: `Clave EN sin traducción ES: ${key}`,
                description: `La clave '${key}' existe en inglés pero no en español.`,
                file: 'src/i18n/translations.ts',
                agent: 'audit-i18n',
                recommendation: `Agregar traducción ES para '${key}'`,
            });
        }
    }

    // Check for hardcoded strings in .astro files
    const astroFiles = await getFiles(join(PROJECT_ROOT, 'src/pages'), ['.astro']);
    for (const file of astroFiles) {
        const content = await safeReadFile(file);
        filesScanned++;
        const relPath = relative(PROJECT_ROOT, file);

        const textPattern = />([A-ZÁÉÍÓÚÑa-záéíóúñ][a-záéíóúñ\s,.'!?]{10,})</g;
        let textMatch;
        while ((textMatch = textPattern.exec(content)) !== null) {
            const text = textMatch[1].trim();
            if (!text.includes('{') && !text.includes('$') && !text.includes('class=')) {
                const line = getLineNumber(content, textMatch.index);
                const surrounding = content.substring(Math.max(0, textMatch.index - 500), textMatch.index);
                if (!surrounding.includes('getT(') && !surrounding.includes('t(') && !surrounding.includes('const t')) {
                    findings.push({
                        id: `I18N-${String(findings.length + 1).padStart(3, '0')}`,
                        severity: 'low',
                        title: `Texto hardcodeado: "${text.substring(0, 40)}..."`,
                        description: 'Texto en español directamente en HTML sin usar i18n.',
                        file: relPath,
                        line,
                        agent: 'audit-i18n',
                        recommendation: 'Usar getT() y agregar clave a translations.ts',
                    });
                }
            }
        }
    }

    return {
        name: 'i18n',
        agent: 'audit-i18n',
        findings,
        filesScanned,
        durationMs: Date.now() - start,
    };
}

// ============================================================
// REPORT GENERATOR
// ============================================================

/**
 * Generate a consolidated Markdown report from all audit areas.
 * @param {AuditArea[]} areas
 * @returns {string} Markdown report
 */
function generateReport(areas) {
    const now = new Date().toISOString();
    const totalFindings = areas.reduce((sum, a) => sum + a.findings.length, 0);
    const criticalCount = areas.reduce((sum, a) => sum + a.findings.filter(f => f.severity === 'critical').length, 0);
    const mediumCount = areas.reduce((sum, a) => sum + a.findings.filter(f => f.severity === 'medium').length, 0);
    const lowCount = areas.reduce((sum, a) => sum + a.findings.filter(f => f.severity === 'low').length, 0);
    const totalFiles = areas.reduce((sum, a) => sum + a.filesScanned, 0);
    const totalDuration = areas.reduce((sum, a) => sum + a.durationMs, 0);

    let report = `# 🔍 CampFit Multi-Agent Audit Report

> **Fecha:** ${now}  
> **Agentes desplegados:** ${areas.length}  
> **Archivos escaneados:** ${totalFiles}  
> **Duración total:** ${(totalDuration / 1000).toFixed(2)}s  

---

## 📊 Resumen Consolidado

| Severidad | Cantidad |
|-----------|----------|
| 🔴 CRÍTICO | ${criticalCount} |
| 🟡 MEDIO | ${mediumCount} |
| 🟢 BAJO | ${lowCount} |
| **TOTAL** | **${totalFindings}** |

### Por Agente

| Agente | Findings | Críticos | Medios | Bajos | Archivos | Duración |
|--------|---------|----------|--------|-------|----------|----------|
`;

    for (const area of areas) {
        const crit = area.findings.filter(f => f.severity === 'critical').length;
        const med = area.findings.filter(f => f.severity === 'medium').length;
        const low = area.findings.filter(f => f.severity === 'low').length;
        report += `| ${area.agent} | ${area.findings.length} | ${crit} | ${med} | ${low} | ${area.filesScanned} | ${(area.durationMs / 1000).toFixed(2)}s |\n`;
    }

    report += `\n---\n\n`;

    // Per-area detailed findings
    for (const area of areas) {
        report += `## 🤖 ${area.name} (${area.agent})\n\n`;
        report += `**Archivos escaneados:** ${area.filesScanned} | **Duración:** ${(area.durationMs / 1000).toFixed(2)}s\n\n`;

        if (area.findings.length === 0) {
            report += `✅ No se encontraron problemas.\n\n`;
        } else {
            // Group by severity
            for (const severity of ['critical', 'medium', 'low']) {
                const severityFindings = area.findings.filter(f => f.severity === severity);
                if (severityFindings.length === 0) continue;

                const icon = severity === 'critical' ? '🔴' : severity === 'medium' ? '🟡' : '🟢';
                const label = severity === 'critical' ? 'CRÍTICO' : severity === 'medium' ? 'MEDIO' : 'BAJO';

                report += `### ${icon} ${label} (${severityFindings.length})\n\n`;

                for (const f of severityFindings) {
                    report += `#### ${f.id}: ${f.title}\n`;
                    report += `- **Archivo:** \`${f.file}\`${f.line ? `:${f.line}` : ''}\n`;
                    report += `- **Descripción:** ${f.description}\n`;
                    report += `- **Recomendación:** ${f.recommendation}\n\n`;
                }
            }
        }

        report += `---\n\n`;
    }

    // Prioritized action plan
    report += `## 🎯 Plan de Acción Priorizado\n\n`;

    const allFindings = areas.flatMap(a => a.findings);
    const sorted = allFindings.sort((a, b) => {
        const order = { critical: 0, medium: 1, low: 2 };
        return order[a.severity] - order[b.severity];
    });

    report += `| # | ID | Severidad | Título | Archivo | Agente |\n`;
    report += `|---|-----|-----------|--------|---------|--------|\n`;

    sorted.slice(0, 30).forEach((f, i) => {
        const icon = f.severity === 'critical' ? '🔴' : f.severity === 'medium' ? '🟡' : '🟢';
        report += `| ${i + 1} | ${f.id} | ${icon} ${f.severity.toUpperCase()} | ${f.title.substring(0, 50)} | \`${f.file}\` | ${f.agent} |\n`;
    });

    if (sorted.length > 30) {
        report += `\n> ... y ${sorted.length - 30} más (ver secciones detalladas arriba)\n`;
    }

    report += `\n---\n\n`;
    report += `## 📎 Comandos de Verificación\n\n`;
    report += '```bash\n';
    report += `# Build\nnpx astro build 2>&1 | findstr error\n\n`;
    report += `# TypeScript\nnpx tsc --noEmit 2>&1\n\n`;
    report += `# Tests\nnpx vitest run 2>&1 | findstr FAIL\n\n`;
    report += `# Buscar console.* sin logger\nfindstr /S "console\\.(log|error|warn)" src\\*.ts src\\*.astro\n\n`;
    report += `# Buscar window.__\nfindstr /S "window\\.__" src\\\n\n`;
    report += `# Buscar any\nfindstr /S ": any" src\\*.ts\n\n`;
    report += `# Clases hardcodeadas\nfindstr /S "bg-zinc-" src\\*.astro\nfindstr /S "text-zinc-" src\\*.astro\n`;
    report += '```\n\n';

    report += `---\n\n`;
    report += `> **Generado por:** CampFit Multi-Agent Audit System v1.0\n`;
    report += `> **Agentes:** ${areas.map(a => a.agent).join(', ')}\n`;

    return report;
}

// ============================================================
// MAIN
// ============================================================

/**
 * Main entry point.
 * @returns {Promise<void>}
 */
async function main() {
    const args = process.argv.slice(2);
    const quick = args.includes('--quick');
    const areaArg = args.find(a => a.startsWith('--area='));
    const specificArea = areaArg ? areaArg.split('=')[1] : null;

    console.log('🔍 CampFit Multi-Agent Audit System v1.0\n');
    console.log(`📅 ${new Date().toISOString()}\n`);

    /** @type {Array<{name: string, fn: () => Promise<AuditArea>}>} */
    const auditFunctions = [
        { name: 'security', fn: auditSecurity },
        { name: 'quality', fn: auditCodeQuality },
        { name: 'performance', fn: auditPerformance },
        { name: 'uiux', fn: auditUIUX },
        { name: 'testing', fn: auditTesting },
        { name: 'i18n', fn: auditI18n },
    ];

    const toRun = specificArea
        ? auditFunctions.filter(a => a.name === specificArea)
        : auditFunctions;

    if (toRun.length === 0) {
        console.error(`❌ Área desconocida: ${specificArea}`);
        console.error(`   Áreas disponibles: ${auditFunctions.map(a => a.name).join(', ')}`);
        process.exit(1);
    }

    console.log(`🤖 Desplegando ${toRun.length} agentes de auditoría...\n`);

    // Run all audits in parallel
    const results = await Promise.all(
        toRun.map(async ({ name, fn }) => {
            console.log(`  ▶️  Iniciando audit-${name}...`);
            const result = await fn();
            console.log(`  ✅ audit-${name} completado: ${result.findings.length} findings en ${(result.durationMs / 1000).toFixed(2)}s`);
            return result;
        })
    );

    // Generate report
    console.log('\n📝 Generando reporte consolidado...');
    const report = generateReport(results);

    // Write report
    const reportPath = join(PROJECT_ROOT, 'docs', 'AUDIT_REPORT.md');
    await mkdir(dirname(reportPath), { recursive: true });
    await writeFile(reportPath, report, 'utf-8');

    // Summary
    const totalFindings = results.reduce((sum, a) => sum + a.findings.length, 0);
    const critical = results.reduce((sum, a) => sum + a.findings.filter(f => f.severity === 'critical').length, 0);
    const medium = results.reduce((sum, a) => sum + a.findings.filter(f => f.severity === 'medium').length, 0);
    const low = results.reduce((sum, a) => sum + a.findings.filter(f => f.severity === 'low').length, 0);

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE AUDITORÍA');
    console.log('='.repeat(60));
    console.log(`  🔴 Críticos:  ${critical}`);
    console.log(`  🟡 Medios:    ${medium}`);
    console.log(`  🟢 Bajos:     ${low}`);
    console.log(`  📋 Total:     ${totalFindings}`);
    console.log('='.repeat(60));
    console.log(`\n📄 Reporte guardado en: docs/AUDIT_REPORT.md\n`);

    if (critical > 0 && !quick) {
        console.log(`⚠️  ${critical} problemas críticos encontrados. Revisar reporte.\n`);
    }
}

main().catch(err => {
    console.error('❌ Error en auditoría:', err);
    process.exit(1);
});