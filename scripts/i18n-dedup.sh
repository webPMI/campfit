#!/bin/bash

# i18n-dedup.sh - Encuentra claves duplicadas o valores repetidos
# Parte del Language Agent system de CampFit

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TRANSLATIONS_FILE="$PROJECT_ROOT/src/i18n/translations.ts"

echo "🔍 Buscando valores duplicados..."
echo ""

# Verificar que el archivo existe
if [ ! -f "$TRANSLATIONS_FILE" ]; then
  echo "❌ Error: No se encontró $TRANSLATIONS_FILE"
  exit 1
fi

# Analizar duplicados usando Node.js
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
    console.log('   \"' + value + '\" aparece en:');
    keys.forEach(key => console.log('      -', key));
    console.log('');
    totalDuplicates++;
  });
}

if (duplicatesEN.length > 0) {
  console.log('♻️  VALORES DUPLICADOS EN EN:');
  console.log('');
  duplicatesEN.forEach(([value, keys]) => {
    console.log('   \"' + value + '\" aparece en:');
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
"