#!/bin/bash

# i18n-sync.sh - Sincroniza client.ts con translations.ts
# Parte del Language Agent system de CampFit

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TRANSLATIONS_FILE="$PROJECT_ROOT/src/i18n/translations.ts"
CLIENT_FILE="$PROJECT_ROOT/src/i18n/client.ts"

echo "🔄 Sincronizando client.ts con translations.ts..."
echo ""

# Verificar que el archivo de traducciones existe
if [ ! -f "$TRANSLATIONS_FILE" ]; then
  echo "❌ Error: No se encontró $TRANSLATIONS_FILE"
  exit 1
fi

# Crear backup de client.ts
if [ -f "$CLIENT_FILE" ]; then
  cp "$CLIENT_FILE" "$CLIENT_FILE.backup"
  echo "📦 Backup creado: $CLIENT_FILE.backup"
fi

# Sincronizar usando Node.js
node -e "
const fs = require('fs');
const path = require('path');

const translationsPath = path.join(process.cwd(), 'src/i18n/translations.ts');
const clientPath = path.join(process.cwd(), 'src/i18n/client.ts');

// Leer translations.ts
const translationsContent = fs.readFileSync(translationsPath, 'utf8');

// Extraer el objeto translations
const translationsMatch = translationsContent.match(/export const translations[^=]*=\s*({[\s\S]*?});/);
if (!translationsMatch) {
  console.error('❌ Error: No se pudo extraer el objeto translations');
  process.exit(1);
}

// Evaluar el objeto de traducciones
const translations = eval('(' + translationsMatch[1] + ')');

// Leer client.ts existente
let clientContent = '';
if (fs.existsSync(clientPath)) {
  clientContent = fs.readFileSync(clientPath, 'utf8');
}

// Generar nuevo client.ts
const newClientContent = \`import { type Language } from './types';
import { translations } from './translations';

const STORAGE_KEY = 'campfit_lang';

/**
 * Obtiene el idioma almacenado en localStorage.
 * @returns Idioma detectado ('es' por defecto)
 */
export function getStoredLanguage(): Language {
  if (typeof window === 'undefined') return 'es';
  return (localStorage.getItem(STORAGE_KEY) as Language) || 'es';
}

/**
 * Guarda el idioma en localStorage y actualiza el atributo lang del HTML.
 * @param lang - Idioma a guardar
 */
export function setStoredLanguage(lang: Language): void {
  localStorage.setItem(STORAGE_KEY, lang);
  document.documentElement.lang = lang;
}

/**
 * Alterna entre español e inglés.
 * @returns Nuevo idioma
 */
export function toggleLanguage(): Language {
  const current = getStoredLanguage();
  const next = current === 'es' ? 'en' : 'es';
  setStoredLanguage(next);
  return next;
}

/**
 * Función de traducción para client-side.
 * Usa el idioma almacenado en localStorage.
 * @param key - Clave de traducción
 * @returns Texto traducido o la key si no existe
 */
export function t(key: string): string {
  const lang = getStoredLanguage();
  return translations[lang]?.[key] || translations['es']?.[key] || key;
}
\`;

// Escribir nuevo client.ts
fs.writeFileSync(clientPath, newClientContent);

// Estadísticas
const totalES = Object.keys(translations.es || {}).length;
const totalEN = Object.keys(translations.en || {}).length;

console.log('✅ Sincronización completada');
console.log('');
console.log('📊 Estadísticas:');
console.log('   Total claves ES:', totalES);
console.log('   Total claves EN:', totalEN);
console.log('   client.ts actualizado para usar translations.ts directamente');
console.log('');
console.log('💡 Ahora client.ts importa desde translations.ts');
console.log('   No hay duplicación de traducciones');
"

# Eliminar backup si todo salió bien
rm -f "$CLIENT_FILE.backup"

echo ""
echo "✅ Sincronización completada exitosamente"