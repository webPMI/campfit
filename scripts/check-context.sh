#!/bin/bash
# ============================================================
# check-context.sh - Verificador de contexto del proyecto
# ============================================================
# Muestra un resumen del estado actual del proyecto para que
# los agentes de IA puedan entender rápidamente en qué estado
# está todo.
#
# Uso:
#   bash scripts/check-context.sh
# ============================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}══════════════════════════════════════════════${NC}"
echo -e "${CYAN}  📊 CampFit - Context Check${NC}"
echo -e "${CYAN}══════════════════════════════════════════════${NC}"
echo ""

# ─── Git Status ─────────────────────────────────────────────
echo -e "${YELLOW}📦 Git Status:${NC}"
if git rev-parse --git-dir > /dev/null 2>&1; then
  BRANCH=$(git rev-parse --abbrev-ref HEAD)
  COMMITS=$(git rev-list --count HEAD 2>/dev/null || echo "0")
  LAST_COMMIT=$(git log -1 --format="%h %s" 2>/dev/null || echo "N/A")
  echo "  Branch:       $BRANCH"
  echo "  Commits:      $COMMITS"
  echo "  Last commit:  $LAST_COMMIT"

  # Verificar cambios sin commit
  if [ -n "$(git status --porcelain)" ]; then
    echo -e "  ${YELLOW}⚠️  Hay cambios sin commit${NC}"
  else
    echo -e "  ${GREEN}✅ Working directory clean${NC}"
  fi
else
  echo -e "  ${RED}❌ No es un repositorio git${NC}"
fi
echo ""

# ─── Lock Status ────────────────────────────────────────────
echo -e "${YELLOW}🔒 Lock Status:${NC}"
if [ -f "scripts/.agent-lock" ]; then
  LOCK_AGENT=$(cat scripts/.agent-lock | cut -d':' -f1)
  LOCK_TIME=$(cat scripts/.agent-lock | cut -d':' -f2)
  LOCK_FEATURE=$(cat scripts/.agent-lock | cut -d':' -f3-)
  CURRENT_TIME=$(date +%s)
  ELAPSED=$((CURRENT_TIME - LOCK_TIME))
  echo -e "  ${RED}🔴 LOCKED por $LOCK_AGENT (${ELAPSED}s) - $LOCK_FEATURE${NC}"
else
  echo -e "  ${GREEN}🟢 FREE${NC}"
fi
echo ""

# ─── Tests ──────────────────────────────────────────────────
echo -e "${YELLOW}🧪 Tests:${NC}"
TEST_FILES=$(find tests -name "*.test.ts" -o -name "*.spec.ts" 2>/dev/null | wc -l)
echo "  Test files:   $TEST_FILES"

if [ -f "tests/coverage/index.html" ]; then
  COVERAGE=$(grep -oP 'Statements.*?\K[\d.]+%' tests/coverage/index.html 2>/dev/null | head -1)
  echo "  Coverage:     ${COVERAGE:-N/A}"
fi
echo ""

# ─── Tarea Actual ───────────────────────────────────────────
echo -e "${YELLOW}📋 Tarea Actual:${NC}"
if [ -f "TASK.md" ]; then
  TASK=$(head -5 TASK.md | grep -v "^>" | grep -v "^$" | head -3)
  echo "  $TASK"
else
  echo "  No hay TASK.md"
fi
echo ""

# ─── TODO Summary ───────────────────────────────────────────
echo -e "${YELLOW}📝 TODO Summary:${NC}"
if [ -f "TODO.md" ]; then
  TOTAL=$(grep -c "\[ \]" TODO.md 2>/dev/null || echo "0")
  DONE=$(grep -c "\[x\]" TODO.md 2>/dev/null || echo "0")
  echo "  Pendientes:   $TOTAL"
  echo "  Completados:  $DONE"
fi
echo ""

# ─── Node / NPM ─────────────────────────────────────────────
echo -e "${YELLOW}⚙️  Entorno:${NC}"
echo "  Node:         $(node -v 2>/dev/null || echo 'N/A')"
echo "  NPM:          $(npm -v 2>/dev/null || echo 'N/A')"
echo ""

echo -e "${CYAN}══════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Context check completado${NC}"
echo -e "${CYAN}══════════════════════════════════════════════${NC}"
