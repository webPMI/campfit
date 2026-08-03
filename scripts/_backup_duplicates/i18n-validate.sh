#!/bin/bash

# i18n-validate.sh - Valida que todas las claves existan en ES y EN
# Parte del Language Agent system de CampFit

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TRANSLATIONS_FILE="$PROJECT_ROOT/src/i18n/translations.ts"

echo "🔍 Validando traducciones..."
echo ""

# Verificar que el archivo existe
if [ ! -f "$TRANSLATIONS_FILE" ]; then
  echo "❌ Error: No se encontró $TRANSLATIONS_FILE"
  exit 1
fi

# Extraer claves de ES y EN usando Node.js
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
    console.log('');
    console.log('   Faltantes en EN:');
    missingInEN.forEach(key => console.log('   -', key));
  }
  
  if (missingInES.length > 0) {
    console.log('');
    console.log('   Faltantes en ES:');
    missingInES.forEach(key => console.log('   -', key));
  }
  
  console.log('');
  console.log('❌ Validación fallida: Faltan', missingInEN.length + missingInES.length, 'claves');
  process.exit(1);
} else {
  console.log('✅ Validación exitosa: Todas las claves existen en ES y EN');
  process.exit(0);
}
"