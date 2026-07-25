#!/usr/bin/env node

/**
 * i18n-report.js - Genera reporte completo del estado de i18n
 * Versión Node.js multiplataforma
 */

const fs = require('fs');
const path = require('path');

const TRANSLATIONS_FILE = path.join(process.cwd(), 'src/i18n/translations.ts');

console.log('📊 GENERANDO REPORTE i18n');
console.log('════════════════════════════════════════\n');

// Verificar que el archivo existe
if (!fs.existsSync(TRANSLATIONS_FILE)) {
  console.error('❌ Error: No se encontró src/i18n/translations.ts');
  process.exit(1);
}

// Leer archivo
const content = fs.readFileSync(TRANSLATIONS_FILE, 'utf8');

// Extraer el objeto translations
const translationsMatch = content.match(/export const translations[^=]*=\s*({[\s\S]*?});/);
if (!translationsMatch) {
  console.error('❌ Error: No se pudo extraer el objeto translations');
  process.exit(1);
}

// Evaluar el objeto de traducciones
const translations = eval('(' + translationsMatch[1] + ')');

const esKeys = Object.keys(translations.es || {});
const enKeys = Object.keys(translations.en || {});

const esSet = new Set(esKeys);
const enSet = new Set(enKeys);

// Claves faltantes
const missingInEN = esKeys.filter(key => !enSet.has(key));
const missingInES = enKeys.filter(key => !esSet.has(key));

// Sincronizadas
const synchronized = esKeys.filter(key => enSet.has(key)).length;

// Duplicados
const valueToKeysES = new Map();
const valueToKeysEN = new Map();

Object.entries(translations.es || {}).forEach(([key, value]) => {
  if (!valueToKeysES.has(value)) valueToKeysES.set(value, []);
  valueToKeysES.get(value).push(key);
});

Object.entries(translations.en || {}).forEach(([key, value]) => {
  if (!valueToKeysEN.has(value)) valueToKeysEN.set(value, []);
  valueToKeysEN.get(value).push(key);
});

const duplicatesES = [...valueToKeysES.entries()].filter(([_, keys]) => keys.length > 1);
const duplicatesEN = [...valueToKeysEN.entries()].filter(([_, keys]) => keys.length > 1);

// Output del reporte
console.log('=== REPORTE i18n: translations.ts ===\n');
console.log('📦 Total claves ES:', esKeys.length);
console.log('📦 Total claves EN:', enKeys.length);
console.log('✅ Claves sincronizadas:', synchronized, '/', esKeys.length);
console.log('');

// Claves faltantes
console.log('=== CLAVES FALTANTES ===');
if (missingInEN.length > 0 || missingInES.length > 0) {
  if (missingInEN.length > 0) {
    console.log('\n❌ EN:', missingInEN.length, 'clave(s) faltante(s)');
    missingInEN.forEach(key => console.log('   -', key));
  }
  
  if (missingInES.length > 0) {
    console.log('\n❌ ES:', missingInES.length, 'clave(s) faltante(s)');
    missingInES.forEach(key => console.log('   -', key));
  }
  console.log('');
} else {
  console.log('✅ No hay claves faltantes\n');
}

// Textos hardcodeados (búsqueda básica)
console.log('=== TEXTOS HARDCODEADOS ===');
let hardcodedCount = 0;
const srcDir = path.join(process.cwd(), 'src');

function findFiles(dir, extension) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  
  const items = fs.readdirSync(dir);
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('.git')) {
      results = results.concat(findFiles(fullPath, extension));
    } else if (stat.isFile() && item.endsWith(extension)) {
      results.push(fullPath);
    }
  });
  
  return results;
}

function isUIText(text) {
  if (text.length <= 2) return false;
  if (/^(console|debug|log|Debug|Log)/.test(text)) return false;
  if (/^(https?:\/\/|\/|#)/.test(text)) return false;
  if (/^[0-9]+$/.test(text)) return false;
  if (/^\{.*\}$/.test(text)) return false;
  if (/^(type|autocomplete|placeholder|name|id|class|href|src)=/.test(text)) return false;
  return true;
}

// Buscar en .astro
const astroFiles = findFiles(srcDir, '.astro');
astroFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((line, idx) => {
    if (line.includes('t(') || line.includes('// ')) return;
    
    const matches = line.match(/>[A-Za-z][A-Za-z0-9\s.,!?¿¡()'-]{3,}</g);
    if (matches) {
      matches.forEach(match => {
        const text = match.slice(1, -1);
        if (isUIText(text)) {
          if (hardcodedCount === 0) console.log('');
          const relativePath = path.relative(process.cwd(), file);
          console.log('⚠️  ' + relativePath + ':' + (idx + 1) + ' - "' + text + '"');
          hardcodedCount++;
        }
      });
    }
  });
});

if (hardcodedCount === 0) {
  console.log('✅ No se encontraron textos hardcodeados');
} else {
  console.log('\n⚠️  Textos hardcodeados detectados:', hardcodedCount);
}
console.log('');

// Duplicados
console.log('=== VALORES DUPLICADOS ===');
let totalDuplicates = 0;

if (duplicatesES.length > 0) {
  console.log('\n♻️  ES:', duplicatesES.length, 'valor(es) duplicado(s)');
  duplicatesES.forEach(([value, keys]) => {
    console.log('   "' + value + '" en:', keys.slice(0, 3).join(', ') + (keys.length > 3 ? '...' : ''));
    totalDuplicates++;
  });
}

if (duplicatesEN.length > 0) {
  console.log('\n♻️  EN:', duplicatesEN.length, 'valor(es) duplicado(s)');
  duplicatesEN.forEach(([value, keys]) => {
    console.log('   "' + value + '" en:', keys.slice(0, 3).join(', ') + (keys.length > 3 ? '...' : ''));
    totalDuplicates++;
  });
}

if (totalDuplicates === 0) {
  console.log('✅ No hay duplicados innecesarios');
}
console.log('');

// Estadísticas finales
console.log('=== ESTADÍSTICAS ===');
const coverageES = esKeys.length > 0 ? Math.round((synchronized / esKeys.length) * 100) : 0;
const coverageEN = enKeys.length > 0 ? Math.round((synchronized / enKeys.length) * 100) : 0;

console.log('📊 Cobertura ES:', coverageES + '% (' + esKeys.length + '/' + esKeys.length + ')');
console.log('📊 Cobertura EN:', coverageEN + '% (' + synchronized + '/' + enKeys.length + ')');
console.log('📊 Textos hardcodeados:', hardcodedCount);
console.log('📊 Duplicados:', totalDuplicates, 'grupo(s)');
console.log('');

// Resumen de salud
const issues = missingInEN.length + missingInES.length + hardcodedCount;
if (issues === 0) {
  console.log('════════════════════════════════════════');
  console.log('✅ ESTADO: EXCELENTE');
  console.log('   Sistema i18n completamente saludable');
  console.log('════════════════════════════════════════');
  process.exit(0);
} else if (issues < 5) {
  console.log('════════════════════════════════════════');
  console.log('⚠️  ESTADO: BUENO');
  console.log('   ' + issues + ' issue(s) menor(es) detectado(s)');
  console.log('════════════════════════════════════════');
  process.exit(0);
} else {
  console.log('════════════════════════════════════════');
  console.log('❌ ESTADO: REQUIERE ATENCIÓN');
  console.log('   ' + issues + ' issue(s) detectado(s)');
  console.log('════════════════════════════════════════');
  process.exit(1);
}