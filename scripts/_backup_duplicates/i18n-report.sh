#!/bin/bash

# i18n-report.sh - Genera reporte completo del estado de i18n
# Parte del Language Agent system de CampFit

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TRANSLATIONS_FILE="$PROJECT_ROOT/src/i18n/translations.ts"

echo "📊 GENERANDO REPORTE i18n"
echo "════════════════════════════════════════"
echo ""

# Verificar que el archivo existe
if [ ! -f "$TRANSLATIONS_FILE" ]; then
  echo "❌ Error: No se encontró $TRANSLATIONS_FILE"
  exit 1
fi

# Ejecutar análisis con Node.js
node -e "
const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/i18n/translations.ts');
const content = fs.readFileSync(filePath, 'utf8');

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
console.log('=== REPORTE i18n: translations.ts ===');
console.log('');
console.log('📦 Total claves ES:', esKeys.length);
console.log('📦 Total claves EN:', enKeys.length);
console.log('✅ Claves sincronizadas:', synchronized, '/', esKeys.length);
console.log('');

// Claves faltantes
if (missingInEN.length > 0 || missingInES.length > 0) {
  console.log('=== CLAVES FALTANTES ===');
  
  if (missingInEN.length > 0) {
    console.log('');
    console.log('❌ EN:', missingInEN.length, 'clave(s) faltante(s)');
    missingInEN.forEach(key => console.log('   -', key));
  }
  
  if (missingInES.length > 0) {
    console.log('');
    console.log('❌ ES:', missingInES.length, 'clave(s) faltante(s)');
    missingInES.forEach(key => console.log('   -', key));
  }
  
  console.log('');
} else {
  console.log('=== CLAVES FALTANTES ===');
  console.log('✅ No hay claves faltantes');
  console.log('');
}

// Textos hardcodeados (búsqueda básica)
console.log('=== TEXTOS HARDCODEADOS ===');
const { execSync } = require('child_process');
try {
  const astroFiles = execSync('find src -name \"*.astro\" -type f', { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const tsFiles = execSync('find src -name \"*.ts\" -type f | grep -v \".test.ts\"', { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  
  let hardcodedCount = 0;
  
  // Buscar en .astro (patrón simple)
  astroFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        // Buscar texto entre >text< que no usa t()
        const matches = line.match(/>[A-Za-z][A-Za-z0-9\s.,!?¿¡()'-]{3,}</g);
        if (matches && !line.includes('t(') && !line.includes('// ')) {
          const text = matches[0].slice(1, -1);
          if (text.length > 2 && !text.match(/^(console|debug|log|https?:\/\/|\/|#|[0-9]+|\{.*\})/)) {
            if (hardcodedCount === 0) console.log('');
            console.log('⚠️  ' + file + ':' + (idx + 1) + ' - \"' + text + '\"');
            hardcodedCount++;
          }
        }
      });
    } catch (e) {
      // Ignorar errores de lectura
    }
  });
  
  if (hardcodedCount === 0) {
    console.log('✅ No se encontraron textos hardcodeados');
  } else {
    console.log('');
    console.log('⚠️  Textos hardcodeados detectados:', hardcodedCount);
  }
} catch (e) {
  console.log('⚠️  No se pudo analizar hardcodeados (requiere bash)');
}
console.log('');

// Duplicados
console.log('=== VALORES DUPLICADOS ===');
let totalDuplicates = 0;

if (duplicatesES.length > 0) {
  console.log('');
  console.log('♻️  ES:', duplicatesES.length, 'valor(es) duplicado(s)');
  duplicatesES.forEach(([value, keys]) => {
    console.log('   \"' + value + '\" en:', keys.slice(0, 3).join(', ') + (keys.length > 3 ? '...' : ''));
    totalDuplicates++;
  });
}

if (duplicatesEN.length > 0) {
  console.log('');
  console.log('♻️  EN:', duplicatesEN.length, 'valor(es) duplicado(s)');
  duplicatesEN.forEach(([value, keys]) => {
    console.log('   \"' + value + '\" en:', keys.slice(0, 3).join(', ') + (keys.length > 3 ? '...' : ''));
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
console.log('📊 Textos hardcodeados:', hardcodedCount || 0);
console.log('📊 Duplicados:', totalDuplicates, 'grupo(s)');
console.log('');

// Resumen de salud
const issues = missingInEN.length + missingInES.length + (hardcodedCount || 0);
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
"