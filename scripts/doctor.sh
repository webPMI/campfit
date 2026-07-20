#!/bin/bash
# ============================================================
# doctor.sh - Diagnóstico del proyecto CampFit
# ============================================================
# Analiza el estado del proyecto y detecta problemas comunes.
# Útil para agentes IA que necesitan entender rápidamente
# qué está mal y cómo arreglarlo.
#
# Uso:
#   bash scripts/doctor.sh
#   bash scripts/doctor.sh --fix     (intenta arreglar problemas)
#   bash scripts/doctor.sh --ci      (modo CI, exit code)
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

check() {
  local status=$1
  local message=$2
  local fix_hint=$3
  
  if [ "$status" = "pass" ]; then
    echo -e "  ${GREEN}✅ $message${NC}"
  elif [ "$status" = "warn" ]; then
    echo -e "  ${YELLOW}⚠️  $message${NC}"
    if [ -n "$fix_hint" ]; then
      echo -e "     ${YELLOW}→ $fix_hint${NC}"
    fi
    WARNINGS=$((WARNINGS + 1))
  else
    echo -e "  ${RED}❌ $message${NC}"
    if [ -n "$fix_hint" ]; then
      echo -e "     ${YELLOW}→ $fix_hint${NC}"
    fi
    ERRORS=$((ERRORS + 1))
  fi
}

echo -e "${CYAN}══════════════════════════════════════════════${NC}"
echo -e "${CYAN}  🏥 CampFit - Doctor${NC}"
echo -e "${CYAN}══════════════════════════════════════════════${NC}"
echo ""

# ─── 1. Node.js ─────────────────────────────────────────────
echo -e "${YELLOW}[1/8] Node.js Environment${NC}"
if command -v node &> /dev/null; then
  NODE_VERSION=$(node -v)
  NODE_MAJOR=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
  if [ "$NODE_MAJOR" -ge 22 ]; then
    check "pass" "Node $NODE_VERSION"
  else
    check "fail" "Node $NODE_VERSION (requiere >= 22)" "Instalar Node 22+: https://nodejs.org/"
  fi
else
  check "fail" "Node.js no instalado" "Instalar Node 22+: https://nodejs.org/"
fi

if command -v npm &> /dev/null; then
  check "pass" "npm $(npm -v)"
else
  check "fail" "npm no instalado" "Viene con Node.js"
fi
echo ""

# ─── 2. Dependencias ────────────────────────────────────────
echo -e "${YELLOW}[2/8] Dependencies${NC}"
if [ -d "node_modules" ]; then
  check "pass" "node_modules existe"
  
  # Verificar dependencias clave
  if [ -f "node_modules/astro/package.json" ]; then
    check "pass" "astro instalado"
  else
    check "fail" "astro no instalado" "Ejecuta: npm ci"
  fi
  
  if [ -f "node_modules/firebase/package.json" ]; then
    check "pass" "firebase instalado"
  else
    check "fail" "firebase no instalado" "Ejecuta: npm ci"
  fi
  
  if [ -f "node_modules/vitest/package.json" ]; then
    check "pass" "vitest instalado"
  else
    check "fail" "vitest no instalado" "Ejecuta: npm ci"
  fi
else
  check "fail" "node_modules no existe" "Ejecuta: npm ci"
fi
echo ""

# ─── 3. Git ─────────────────────────────────────────────────
echo -e "${YELLOW}[3/8] Git${NC}"
if command -v git &> /dev/null; then
  if git rev-parse --git-dir > /dev/null 2>&1; then
    check "pass" "Repositorio git válido"
    
    BRANCH=$(git rev-parse --abbrev-ref HEAD)
    check "pass" "Branch: $BRANCH"
    
    # Verificar cambios sin commit
    if [ -n "$(git status --porcelain)" ]; then
      check "warn" "Hay cambios sin commit" "Haz commit antes de continuar"
    fi
    
    # Verificar upstream
    if git remote -v | grep -q "origin"; then
      check "pass" "Remote origin configurado"
    else
      check "fail" "No hay remote origin" "Configura: git remote add origin <url>"
    fi
  else
    check "fail" "No es un repositorio git" "Ejecuta: git init"
  fi
else
  check "fail" "git no instalado" "Instalar git"
fi
echo ""

# ─── 4. Lock ────────────────────────────────────────────────
echo -e "${YELLOW}[4/8] Agent Lock${NC}"
if [ -f "scripts/.agent-lock" ]; then
  LOCK_AGENT=$(cat scripts/.agent-lock | cut -d':' -f1)
  LOCK_TIME=$(cat scripts/.agent-lock | cut -d':' -f2)
  LOCK_FEATURE=$(cat scripts/.agent-lock | cut -d':' -f3-)
  CURRENT_TIME=$(date +%s)
  ELAPSED=$((CURRENT_TIME - LOCK_TIME))
  LOCK_TIMEOUT=1800
  
  if [ "$ELAPSED" -lt "$LOCK_TIMEOUT" ]; then
    check "fail" "LOCKED por $LOCK_AGENT (${ELAPSED}s) - $LOCK_FEATURE" "Espera o fuerza: rm scripts/.agent-lock"
  else
    check "warn" "Lock stale (${ELAPSED}s) - $LOCK_FEATURE" "rm scripts/.agent-lock"
  fi
else
  check "pass" "Lock libre"
fi
echo ""

# ─── 5. Tests ───────────────────────────────────────────────
echo -e "${YELLOW}[5/8] Tests${NC}"
TEST_FILES=$(find tests -name "*.test.ts" -o -name "*.spec.ts" 2>/dev/null | wc -l)
if [ "$TEST_FILES" -gt 0 ]; then
  check "pass" "$TEST_FILES archivos de test encontrados"
  
  # Verificar tests unitarios
  UNIT_FILES=$(find tests/unit -name "*.test.ts" 2>/dev/null | wc -l)
  if [ "$UNIT_FILES" -gt 0 ]; then
    check "pass" "$UNIT_FILES tests unitarios"
  else
    check "warn" "No hay tests unitarios" "Crear tests en tests/unit/"
  fi
  
  # Verificar tests E2E
  E2E_FILES=$(find tests/e2e -name "*.spec.ts" -o -name "*.e2e.ts" 2>/dev/null | wc -l)
  if [ "$E2E_FILES" -gt 0 ]; then
    check "pass" "$E2E_FILES tests E2E"
  else
    check "warn" "No hay tests E2E" "Crear tests en tests/e2e/"
  fi
  
  # Verificar tests de integración
  INT_FILES=$(find tests/integration -name "*.test.ts" 2>/dev/null | wc -l)
  if [ "$INT_FILES" -gt 0 ]; then
    check "pass" "$INT_FILES tests de integración"
  else
    check "warn" "No hay tests de integración" "Crear tests en tests/integration/"
  fi
else
  check "fail" "No hay archivos de test" "Los tests deben estar en tests/"
fi
echo ""

# ─── 6. Archivos clave ──────────────────────────────────────
echo -e "${YELLOW}[6/8] Key Files${NC}"
KEY_FILES=(
  ".clinerules:Golden Rules"
  "AGENTS.md:Agent Instructions"
  "AGENTS_GUIDE.md:Agent Guide"
  "CONTEXT.md:Project Context"
  "TASK.md:Current Task"
  "TODO.md:Central TODO"
  "GIT_WORKFLOW.md:Git Workflow"
  ".mcp.json:MCP Config"
  ".env.example:Env Template"
  "vitest.config.ts:Vitest Config"
  "playwright.config.ts:Playwright Config"
  "astro.config.mjs:Astro Config"
)

for entry in "${KEY_FILES[@]}"; do
  FILE="${entry%%:*}"
  DESC="${entry#*:}"
  if [ -f "$FILE" ]; then
    check "pass" "$DESC ($FILE)"
  else
    check "warn" "Falta $DESC ($FILE)" "Crear archivo $FILE"
  fi
done
echo ""

# ─── 7. Scripts ─────────────────────────────────────────────
echo -e "${YELLOW}[7/8] Scripts${NC}"
SCRIPTS=(
  "scripts/agent-lock.sh:Sistema de lock"
  "scripts/validate.sh:Validación pre-commit"
  "scripts/check-context.sh:Verificador de contexto"
  "scripts/setup.sh:Setup inicial"
  "scripts/doctor.sh:Diagnóstico"
)

for entry in "${SCRIPTS[@]}"; do
  FILE="${entry%%:*}"
  DESC="${entry#*:}"
  if [ -f "$FILE" ]; then
    if [ -x "$FILE" ]; then
      check "pass" "$DESC ($FILE)"
    else
      check "warn" "$DESC ($FILE) no ejecutable" "chmod +x $FILE"
    fi
  else
    check "warn" "Falta $DESC ($FILE)" "Crear script $FILE"
  fi
done
echo ""

# ─── 8. console.error en producción ─────────────────────────
echo -e "${YELLOW}[8/8] Production Code Quality${NC}"

# Buscar console.error en archivos src/ (excluyendo tests)
CONSOLE_ERRORS=$(grep -rn "console\.error" src/ --include="*.ts" --include="*.astro" 2>/dev/null | grep -v "node_modules" | grep -v "\.test\." | wc -l)
if [ "$CONSOLE_ERRORS" -gt 0 ]; then
  check "warn" "$CONSOLE_ERRORS console.error() en producción" "Reemplazar con logger: src/lib/shared/logger.ts"
else
  check "pass" "Sin console.error en producción"
fi

# Buscar any en servicios cliente
ANY_COUNT=$(grep -rn ": any" src/lib/client/ --include="*.ts" 2>/dev/null | wc -l)
if [ "$ANY_COUNT" -gt 0 ]; then
  check "warn" "$ANY_COUNT usos de 'any' en servicios cliente" "Reemplazar con tipos concretos"
else
  check "pass" "Sin 'any' en servicios cliente"
fi

# Buscar window.__* 
WINDOW_FUNCTIONS=$(grep -rn "window\.__" src/ --include="*.ts" --include="*.astro" 2>/dev/null | grep -v "node_modules" | wc -l)
if [ "$WINDOW_FUNCTIONS" -gt 0 ]; then
  check "warn" "$WINDOW_FUNCTIONS funciones window.__*" "Migrar a event delegation con data-*"
else
  check "pass" "Sin window.__*"
fi

# Buscar confirm()
CONFIRM_COUNT=$(grep -rn "confirm(" src/ --include="*.ts" --include="*.astro" 2>/dev/null | grep -v "node_modules" | wc -l)
if [ "$CONFIRM_COUNT" -gt 0 ]; then
  check "warn" "$CONFIRM_COUNT confirm() en producción" "Reemplazar con ConfirmModal"
else
  check "pass" "Sin confirm()"
fi

# Verificar archivos > 300 líneas
echo ""
echo -e "${YELLOW}  Archivos grandes (>300 líneas):${NC}"
LARGE_FILES=$(find src -name "*.ts" -o -name "*.astro" | while read f; do
  lines=$(wc -l < "$f")
  if [ "$lines" -gt 300 ]; then
    echo "    ${YELLOW}⚠️  $f ($lines líneas)${NC}"
  fi
done)
if [ -n "$LARGE_FILES" ]; then
  echo "$LARGE_FILES"
else
  echo -e "    ${GREEN}✅ Todos los archivos < 300 líneas${NC}"
fi

echo ""
echo -e "${CYAN}══════════════════════════════════════════════${NC}"
echo -e "${CYAN}  📊 Resumen${NC}"
echo -e "${CYAN}══════════════════════════════════════════════${NC}"
echo ""

if [ "$ERRORS" -eq 0 ] && [ "$WARNINGS" -eq 0 ]; then
  echo -e "${GREEN}  ✅ Todo en orden - No se detectaron problemas${NC}"
elif [ "$ERRORS" -eq 0 ]; then
  echo -e "${YELLOW}  ⚠️  $WARNINGS advertencias encontradas${NC}"
  echo -e "  ${GREEN}  Sin errores críticos${NC}"
else
  echo -e "${RED}  ❌ $ERRORS errores encontrados${NC}"
  echo -e "  ${YELLOW}  ⚠️  $WARNINGS advertencias${NC}"
fi

echo ""

# Modo CI: exit con código de error si hay errores
if [ "${1:-}" = "--ci" ]; then
  exit $ERRORS
fi
