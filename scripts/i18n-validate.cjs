#!/usr/bin/env node

/**
 * i18n-validate.js - Valida que todas las claves existan en ES y EN
 * Versión Node.js multiplataforma (funciona en Windows, Mac, Linux)
 */

const fs = require('fs');
const path = require('path');

const TRANSLATIONS_FILE = path.join(process.cwd(), 'src/i18n/translations.ts');

console.log('🔍 Validando traducciones...\n');

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

// Evaluar el objeto de traducciones de forma segura
const translations = eval('(' + translationsMatch[1] + ')');

const esKeys = new Set(Object.keys(translations.es || {}));
const enKeys = new Set(Object.keys(translations.en || {}));

// Encontrar claves faltantes
const missingInEN = [...esKeys].filter(key => !enKeys.has(key));
const missingInES = [...enKeys].filter(key => !esKeys.has(key));

// Estadísticas
const totalES = esKeys.size;
const totalEN = enKeys.size;
const synchronized = totalES - missingInEN.length;

// Output
console.log('📊 ESTADÍSTICAS:');
console.log('   Total claves ES:', totalES);
console.log('   Total claves EN:', totalEN);
console.log('   Claves sincronizadas:', synchronized, '/', totalES);
console.log('');

if (missingInEN.length > 0 || missingInES.length > 0) {
  console.log('❌ CLAVES FALTANTES:');
  
  if (missingInEN.length > 0) {
    console.log('\n   Faltantes en EN:');
    missingInEN.forEach(key => console.log('   -', key));
  }
  
  if (missingInES.length > 0) {
    console.log('\n   Faltantes en ES:');
    missingInES.forEach(key => console.log('   -', key));
  }
  
  console.log('\n❌ Validación fallida: Faltan', missingInEN.length + missingInES.length, 'claves');
  process.exit(1);
} else {
  console.log('✅ Validación exitosa: Todas las claves existen en ES y EN');
  process.exit(0);
}