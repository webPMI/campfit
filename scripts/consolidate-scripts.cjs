/**
 * Script para consolidar scripts duplicados
 * Mantiene solo las versiones .cjs y elimina .js y .sh duplicados
 * 
 * Uso: node scripts/consolidate-scripts.cjs [--interactive]
 */

const fs = require('fs');
const path = require('path');

const scriptsDir = path.join(__dirname);

// Grupos de scripts duplicados conocidos
const duplicateGroups = [
    { base: 'i18n-dedup', description: 'i18n deduplicador' },
    { base: 'i18n-find-missing', description: 'i18n finder de textos faltantes' },
    { base: 'i18n-report', description: 'i18n report generator' },
    { base: 'i18n-sync', description: 'i18n sync' },
    { base: 'i18n-validate', description: 'i18n validator' },
];

/**
 * Compara dos archivos para ver si son similares
 */
function areFilesSimilar(file1, file2) {
    try {
        const content1 = fs.readFileSync(file1, 'utf-8');
        const content2 = fs.readFileSync(file2, 'utf-8');

        // Si tienen el mismo tamaño, probablemente son idénticos
        if (content1.length === content2.length) {
            return true;
        }

        // Comparar primeras líneas para confirmar
        const lines1 = content1.split('\n').slice(0, 10).join('\n');
        const lines2 = content2.split('\n').slice(0, 10).join('\n');

        return lines1 === lines2;
    } catch (error) {
        return false;
    }
}

/**
 * Analiza los scripts duplicados
 */
function analyzeDuplicates() {
    const duplicates = [];

    for (const group of duplicateGroups) {
        const cjsFile = path.join(scriptsDir, `${group.base}.cjs`);
        const jsFile = path.join(scriptsDir, `${group.base}.js`);
        const shFile = path.join(scriptsDir, `${group.base}.sh`);

        const existingFiles = [];

        if (fs.existsSync(cjsFile)) existingFiles.push({ path: cjsFile, ext: '.cjs' });
        if (fs.existsSync(jsFile)) existingFiles.push({ path: jsFile, ext: '.js' });
        if (fs.existsSync(shFile)) existingFiles.push({ path: shFile, ext: '.sh' });

        if (existingFiles.length > 1) {
            duplicates.push({
                base: group.base,
                description: group.description,
                files: existingFiles
            });
        }
    }

    return duplicates;
}

/**
 * Modo interactivo para elegir qué archivos eliminar
 */
function interactiveMode(duplicates) {
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const filesToDelete = [];

    console.log('\n📋 Scripts duplicados encontrados:\n');

    let groupIndex = 1;
    for (const group of duplicates) {
        console.log(`${groupIndex}. ${group.description} (${group.base})`);

        for (const file of group.files) {
            const stats = fs.statSync(file.path);
            const size = (stats.size / 1024).toFixed(2);
            console.log(`   [${file.ext}] ${path.basename(file.path)} (${size} KB)`);
        }

        const question = new Promise((resolve) => {
            rl.question(`   ¿Mantener solo .cjs? (s/n): `, (answer) => {
                resolve(answer.toLowerCase().trim());
            });
        });

        question.then(answer => {
            if (answer === 's' || answer === 'si' || answer === 'y' || answer === 'yes') {
                // Eliminar .js y .sh, mantener .cjs
                for (const file of group.files) {
                    if (file.ext !== '.cjs') {
                        filesToDelete.push(file.path);
                    }
                }
                console.log(`   ✅ Se eliminarán las versiones .js y .sh\n`);
            } else {
                console.log(`   ⏭️  Se conservan todos los archivos\n`);
            }
        });

        groupIndex++;
    }

    rl.close();

    return filesToDelete;
}

/**
 * Modo automático - elimina sin preguntar
 */
function autoMode(duplicates) {
    const filesToDelete = [];

    console.log('\n🗑️  Modo automático: eliminando versiones .js y .sh...\n');

    for (const group of duplicates) {
        console.log(`📦 ${group.description} (${group.base})`);

        for (const file of group.files) {
            if (file.ext !== '.cjs') {
                filesToDelete.push(file.path);
                console.log(`   🗑️  Eliminando: ${path.basename(file.path)}`);
            } else {
                console.log(`   ✅ Manteniendo: ${path.basename(file.path)}`);
            }
        }
    }

    return filesToDelete;
}

/**
 * Elimina archivos
 */
function deleteFiles(filesToDelete) {
    if (filesToDelete.length === 0) {
        console.log('\n✓ No hay archivos para eliminar');
        return;
    }

    console.log('\n💾 Creando backup...');
    const backupDir = path.join(scriptsDir, '_backup_duplicates');

    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    for (const file of filesToDelete) {
        const fileName = path.basename(file);
        const backupPath = path.join(backupDir, fileName);

        fs.copyFileSync(file, backupPath);
        fs.unlinkSync(file);

        console.log(`   📦 ${fileName} → backup/`);
    }

    console.log(`\n✅ Eliminados ${filesToDelete.length} archivos duplicados`);
    console.log(`   💾 Backup guardado en: scripts/_backup_duplicates/`);
}

// Main
console.log('🔍 Analizando scripts duplicados...\n');

const duplicates = analyzeDuplicates();

if (duplicates.length === 0) {
    console.log('✓ No se encontraron scripts duplicados');
    process.exit(0);
}

console.log(`⚠️  Encontrados ${duplicates.length} grupos de scripts duplicados\n`);

const args = process.argv.slice(2);
const interactive = args.includes('--interactive') || args.includes('-i');

let filesToDelete;

if (interactive) {
    filesToDelete = interactiveMode(duplicates);
} else {
    filesToDelete = autoMode(duplicates);
}

deleteFiles(filesToDelete);

console.log('\n✅ Proceso completado\n');