/**
 * Script para eliminar claves duplicadas en archivos de idioma
 * Uso: node scripts/i18n-remove-duplicates.cjs [archivo.ts] [--interactive]
 * 
 * Modos:
 *   Sin argumentos: Procesa todos los archivos en src/i18n/locales/
 *   archivo.ts: Procesa ese archivo específico
 *   --interactive: Modo interactivo para elegir qué duplicados eliminar
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const localesDir = path.join(projectRoot, 'src', 'i18n', 'locales');

/**
 * Analiza el archivo y encuentra claves duplicadas
 * @param {string} content - Contenido del archivo
 * @returns {Object} { lines, duplicates: Map<key, [lineIndex1, lineIndex2, ...]> }
 */
function analyzeDuplicates(content) {
    const lines = content.split('\n');
    const keyLocations = new Map();
    let inObject = false;
    let objectDepth = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Detectar inicio del objeto exportado
        if (line.includes('export const') && line.includes(':')) {
            inObject = true;
            continue;
        }

        // Detectar apertura/cierre de llave
        if (inObject) {
            if (line.includes('{')) {
                objectDepth++;
            }
            if (line.includes('}')) {
                objectDepth--;
                if (objectDepth === 0) {
                    inObject = false;
                }
            }

            // Si estamos dentro del objeto, buscar claves
            if (objectDepth > 0) {
                const match = line.match(/^\s*'([^']+)'\s*:/);

                if (match) {
                    const key = match[1];

                    if (!keyLocations.has(key)) {
                        keyLocations.set(key, []);
                    }

                    keyLocations.get(key).push(i);
                }
            }
        }
    }

    // Filtrar solo las claves duplicadas
    const duplicates = new Map();
    for (const [key, locations] of keyLocations.entries()) {
        if (locations.length > 1) {
            duplicates.set(key, locations);
        }
    }

    return { lines, duplicates };
}

/**
 * Elimina claves duplicadas de un objeto de traducciones
 * @param {string} content - Contenido del archivo
 * @param {Set<string>} keysToRemove - Claves que se deben eliminar (opcional)
 * @returns {string} Contenido limpio
 */
function removeDuplicateKeys(content, keysToRemove = null) {
    const { lines, duplicates } = analyzeDuplicates(content);
    const result = [];
    let duplicateCount = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const match = line.match(/^\s*'([^']+)'\s*:/);

        if (match) {
            const key = match[1];

            // Verificar si esta clave está duplicada
            if (duplicates.has(key)) {
                const locations = duplicates.get(key);
                const isFirstOccurrence = locations[0] === i;

                // Si no es la primera ocurrencia, o si está en la lista de eliminación
                if (!isFirstOccurrence || (keysToRemove && keysToRemove.has(key))) {
                    duplicateCount++;
                    console.warn(`  ⚠️  Duplicado eliminado: ${key} (línea ${i + 1})`);
                    continue;
                }
            }
        }

        result.push(line);
    }

    if (duplicateCount > 0) {
        console.log(`  ✅ Eliminadas ${duplicateCount} claves duplicadas`);
    }

    return result.join('\n');
}

/**
 * Modo interactivo para elegir qué duplicados eliminar
 * @param {string} content - Contenido del archivo
 * @returns {string} Contenido limpio
 */
function interactiveMode(content) {
    const { lines, duplicates } = analyzeDuplicates(content);

    if (duplicates.size === 0) {
        console.log('  ✓ No se encontraron duplicados');
        return content;
    }

    console.log(`\n  📋 Se encontraron ${duplicates.size} claves duplicadas:\n`);

    const keysToRemove = new Set();
    let index = 1;

    for (const [key, locations] of duplicates.entries()) {
        console.log(`  ${index}. "${key}"`);
        console.log(`     Aparece en líneas: ${locations.map(l => l + 1).join(', ')}`);

        // Mostrar las líneas duplicadas
        for (const loc of locations) {
            const line = lines[loc];
            console.log(`     Línea ${loc + 1}: ${line.trim()}`);
        }

        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const question = new Promise((resolve) => {
            rl.question(`     ¿Eliminar esta clave? (s/n/primera/última): `, (answer) => {
                rl.close();
                resolve(answer.toLowerCase().trim());
            });
        });

        question.then(answer => {
            if (answer === 's' || answer === 'si' || answer === 'y' || answer === 'yes') {
                // Eliminar todas las ocurrencias excepto la primera
                for (let i = 1; i < locations.length; i++) {
                    keysToRemove.add(locations[i]);
                }
                console.log(`     ✅ Se eliminarán ${locations.length - 1} ocurrencias (se conserva la primera)`);
            } else if (answer === 'primera') {
                // Eliminar todas excepto la primera
                for (let i = 1; i < locations.length; i++) {
                    keysToRemove.add(locations[i]);
                }
                console.log(`     ✅ Se eliminarán ${locations.length - 1} ocurrencias (se conserva la primera)`);
            } else if (answer === 'última' || answer === 'ultima') {
                // Eliminar todas excepto la última
                for (let i = 0; i < locations.length - 1; i++) {
                    keysToRemove.add(locations[i]);
                }
                console.log(`     ✅ Se eliminarán ${locations.length - 1} ocurrencias (se conserva la última)`);
            } else {
                console.log(`     ⏭️  Se conservan todas las ocurrencias`);
            }
        });

        index++;
    }

    // Esperar a que el usuario termine de responder
    console.log('\n  ⏳ Procesando respuestas...');

    return removeDuplicateKeys(content, keysToRemove);
}

/**
 * Procesa un archivo de idioma
 * @param {string} filePath - Ruta del archivo
 * @param {boolean} interactive - Si es true, usa modo interactivo
 */
function processFile(filePath, interactive = false) {
    try {
        console.log(`\n📄 Procesando: ${filePath}`);

        const content = fs.readFileSync(filePath, 'utf-8');
        let cleaned;

        if (interactive) {
            cleaned = interactiveMode(content);
        } else {
            const { duplicates } = analyzeDuplicates(content);

            if (duplicates.size > 0) {
                console.log(`  ⚠️  Encontradas ${duplicates.size} claves duplicadas:`);
                for (const [key, locations] of duplicates.entries()) {
                    console.log(`     - "${key}" en líneas ${locations.map(l => l + 1).join(', ')}`);
                }
                console.log(`  💡 Usa --interactive para elegir cuáles eliminar`);
            } else {
                console.log(`  ✓ Sin duplicados encontrados`);
                return;
            }

            cleaned = removeDuplicateKeys(content);
        }

        if (content !== cleaned) {
            // Hacer backup del archivo original
            const backupPath = filePath + '.bak';
            fs.writeFileSync(backupPath, content, 'utf-8');
            console.log(`  💾 Backup guardado en: ${backupPath}`);

            // Escribir archivo limpio
            fs.writeFileSync(filePath, cleaned, 'utf-8');
            console.log(`  ✅ Archivo actualizado`);
        } else {
            console.log(`  ✓ Sin cambios necesarios`);
        }
    } catch (error) {
        console.error(`  ❌ Error procesando ${filePath}:`, error.message);
    }
}

// Main
const args = process.argv.slice(2);
const targetFile = args.find(arg => !arg.startsWith('--'));
const interactive = args.includes('--interactive');

if (targetFile) {
    // Procesar archivo específico
    const fullPath = path.join(projectRoot, targetFile);
    processFile(fullPath, interactive);
} else {
    // Procesar todos los archivos de idioma
    console.log('🌐 Procesando todos los archivos de idioma...\n');

    const files = [
        path.join(localesDir, 'es.ts'),
        path.join(localesDir, 'en.ts')
    ];

    files.forEach(file => {
        if (fs.existsSync(file)) {
            processFile(file, interactive);
        } else {
            console.warn(`\n⚠️  Archivo no encontrado: ${file}`);
        }
    });

    console.log('\n✅ Proceso completado\n');
}