#!/usr/bin/env node

/**
 * i18n-dedup.js - Encuentra claves duplicadas o valores repetidos
 * Versión Node.js multiplataforma
 */

const fs = require('fs');
const path = require('path');

const TRANSLATIONS_FILE = path.join(process.cwd(), 'src/i18n/translations.ts');

console.log('🔍 Buscando valores duplicados...\n');

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

// Mapa de valor -> lista de claves
const valueToKeysES = new Map();
const valueToKeysEN = new Map();

// Analizar ES
Object.entries(translations.es || {}).forEach(([key, value]) => {
  if (!valueToKeysES.has(value)) {
    valueToKeysES.set(value, []);
  }
  valueToKeysES.get(value).push(key);
});

// Analizar EN
Object.entries(translations.en || {}).forEach(([key, value]) => {
  if (!valueToKeysEN.has(value)) {
    valueToKeysEN.set(value, []);
  }
  valueToKeysEN.get(value).push(key);
});

// Encontrar duplicados (valores que aparecen más de una vez)
const duplicatesES = [...valueToKeysES.entries()].filter(([_, keys]) => keys.length > 1);
const duplicatesEN = [...valueToKeysEN.entries()].filter(([_, keys]) => keys.length > 1);

// Output
console.log('📊 ANÁLISIS DE DUPLICADOS:');
console.log('   Total valores únicos ES:', valueToKeysES.size);
console.log('   Total valores únicos EN:', valueToKeysEN.size);
console.log('');

let totalDuplicates = 0;

if (duplicatesES.length > 0) {
  console.log('♻️  VALORES DUPLICADOS EN ES:');
  console.log('');
  duplicatesES.forEach(([value, keys]) => {
    console.log('   "' + value + '" aparece en:');
    keys.forEach(key => console.log('      -', key));
    console.log('');
    totalDuplicates++;
  });
}

if (duplicatesEN.length > 0) {
  console.log('♻️  VALORES DUPLICADOS EN EN:');
  console.log('');
  duplicatesEN.forEach(([value, keys]) => {
    console.log('   "' + value + '" aparece en:');
    keys.forEach(key => console.log('      -', key));
    console.log('');
    totalDuplicates++;
  });
}

if (totalDuplicates === 0) {
  console.log('✅ No hay duplicados innecesarios');
  console.log('   Todos los valores son únicos');
  process.exit(0);
} else {
  console.log('⚠️  Duplicados detectados:', totalDuplicates);
  console.log('');
  console.log('📝 Acción sugerida:');
  console.log('   - Evaluar si se pueden consolidar en una clave compartida');
  console.log('   - O mantener separadas si el contexto lo requiere');
  console.log('   - Documentar la decisión en language-agent/RULES.md');
  process.exit(0); // No es error crítico, solo advertencia
}