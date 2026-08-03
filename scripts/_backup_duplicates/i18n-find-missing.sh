#!/bin/bash

# i18n-find-missing.sh - Busca textos hardcodeados que deberían usar t()
# Parte del Language Agent system de CampFit

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🔍 Buscando textos hardcodeados..."
echo ""

# Patrones a buscar (textos en español/inglés que NO están en atributos técnicos)
# Exclusiones:
# - Códigos y IDs técnicos
# - Variables y placeholders {name}, {count}, etc.
# - URLs y rutas
# - Logs de consola
# - Atributos HTML técnicos (type, autocomplete, etc.)
# - Nombres propios (CampFit, Google, Firebase)

# Contador de hallazgos
FOUND=0

# Buscar en archivos .astro
echo "📂 Buscando en archivos .astro..."
while IFS= read -r file; do
  # Buscar texto hardcodeado (entre etiquetas HTML o en contenido)
  # Excluir líneas que ya usan t() o importan traducciones
  matches=$(grep -n ">[A-Za-z][A-Za-z0-9\s.,!?¿¡()'-]{3,}<" "$file" 2>/dev/null | grep -v "t(" | grep -v "// " | head -20 || true)
  
  if [ -n "$matches" ]; then
    echo "$matches" | while IFS= read -r match; do
      line=$(echo "$match" | cut -d: -f1)
      text=$(echo "$match" | sed 's/^[0-9]*:[^>]*>//;s/<[^>]*>$//')
      
      # Filtrar textos que no son UI
      if [[ ! "$text" =~ ^(console|debug|log|Debug|Log) ]] && \
         [[ ! "$text" =~ ^(https?://|/|#) ]] && \
         [[ ! "$text" =~ ^[0-9]+$ ]] && \
         [[ ! "$text" =~ ^\{.*\}$ ]] && \
         [[ ${#text} -gt 2 ]]; then
        echo "⚠️  $file:$line"
        echo "   \"$text\""
        echo ""
        FOUND=$((FOUND + 1))
      fi
    done
  fi
done < <(find "$PROJECT_ROOT/src" -name "*.astro" -type f)

# Buscar en archivos .ts (scripts JS)
echo "📂 Buscando en archivos .ts..."
while IFS= read -r file; do
  # Buscar strings literales que parecen mensajes al usuario
  # Excluir imports, console.log, y código técnico
  matches=$(grep -n "['\"][A-Za-z][A-Za-z0-9\s.,!?¿¡()'-]{3,}['\"]" "$file" 2>/dev/null | \
            grep -v "import " | \
            grep -v "console\." | \
            grep -v "// " | \
            grep -v "t(" | \
            grep -v "logger\." | \
            head -20 || true)
  
  if [ -n "$matches" ]; then
    echo "$matches" | while IFS= read -r match; do
      line=$(echo "$match" | cut -d: -f1)
      text=$(echo "$match" | sed "s/^[0-9]*:[^'\"]*['\"]//;s/['\"][^'\"]*$//")
      
      # Filtrar textos que no son UI
      if [[ ! "$text" =~ ^(console|debug|log|Debug|Log) ]] && \
         [[ ! "$text" =~ ^(https?://|/|#) ]] && \
         [[ ! "$text" =~ ^[0-9]+$ ]] && \
         [[ ! "$text" =~ ^\{.*\}$ ]] && \
         [[ ${#text} -gt 2 ]]; then
        echo "⚠️  $file:$line"
        echo "   \"$text\""
        echo ""
        FOUND=$((FOUND + 1))
      fi
    done
  fi
done < <(find "$PROJECT_ROOT/src" -name "*.ts" -type f | grep -v ".test.ts" | grep -v "node_modules")

# Resumen
echo "════════════════════════════════════════"
if [ $FOUND -eq 0 ]; then
  echo "✅ No se encontraron textos hardcodeados"
  echo ""
  echo "💡 Tip: Si encuentras falsos positivos, añade exclusiones en este script"
  exit 0
else
  echo "⚠️  Textos hardcodeados detectados: $FOUND"
  echo ""
  echo "📝 Acción requerida:"
  echo "   1. Añadir traducción en src/i18n/translations.ts"
  echo "   2. Reemplazar texto hardcodeado con {t('clave')} o t('clave')"
  echo "   3. Ejecutar npm run i18n:validate para verificar"
  exit 1
fi