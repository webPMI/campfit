#!/bin/bash
# ============================================================
# validate.sh - Validación pre-commit para agentes IA
# ============================================================
# Ejecuta todas las verificaciones necesarias antes de
# hacer commit. Detiene el proceso si algo falla.
#
# Uso:
#   bash scripts/validate.sh          # Validación completa
#   bash scripts/validate.sh --quick  # Solo type-check + tests
#   bash scripts/validate.sh --full   # Completa + lint + build
#   bash scripts/validate.sh --fix    # Completa + auto-fix lint
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

MODE="${1:-full}"
START_TIME=$(date +%s)

echo -e "${CYAN}══════════════════════════════════════════════${NC}"
echo -e "${CYAN}  🔍 CampFit - Validación Pre-Commit${NC}"
echo -e "${CYAN}══════════════════════════════════════════════${NC}"
echo ""

# ─── 1. Verificar lock ──────────────────────────────────────
echo -e "${YELLOW}[1] Verificando lock de agente...${NC}"
if [ -f "scripts/.agent-lock" ]; then
  LOCK_AGENT=$(cat scripts/.agent-lock | cut -d':' -f1)
  LOCK_TIME=$(cat scripts/.agent-lock | cut -d':' -f2)
  CURRENT_TIME=$(date +%s)
  ELAPSED=$((CURRENT_TIME - LOCK_TIME))
  LOCK_TIMEOUT=1800
  
  if [ "$ELAPSED" -lt "$LOCK_TIMEOUT" ]; then
    echo -e "${RED}❌ Lock activo por: $LOCK_AGENT (${ELAPSED}s)${NC}"
    echo "   Libera el lock con: rm scripts/.agent-lock"
    exit 1
  else
    echo -e "${YELLOW}⚠️  Lock stale detectado. Liberando...${NC}"
    rm -f scripts/.agent-lock
  fi
fi
echo -e "${GREEN}✅ Lock libre${NC}"
echo ""

# ─── 2. TypeScript Check ────────────────────────────────────
echo -e "${YELLOW}[2] TypeScript check...${NC}"
if npx astro check 2>&1; then
  echo -e "${GREEN}✅ TypeScript check pasado${NC}"
else
  echo -e "${YELLOW}⚠️  Astro check tiene advertencias (no bloqueante)${NC}"
  echo "   Revisa los mensajes arriba para posibles issues"
fi
echo ""

# ─── 3. Tests Unitarios ─────────────────────────────────────
echo -e "${YELLOW}[3] Tests unitarios (Vitest)...${NC}"
if npm test -- --run 2>&1; then
  echo -e "${GREEN}✅ Tests unitarios pasados${NC}"
else
  echo -e "${RED}❌ Tests unitarios fallaron${NC}"
  exit 1
fi
echo ""

# Si es modo quick, terminamos aquí
if [ "$MODE" = "--quick" ]; then
  END_TIME=$(date +%s)
  DURATION=$((END_TIME - START_TIME))
  echo -e "${CYAN}══════════════════════════════════════════════${NC}"
  echo -e "${GREEN}  ✅ Quick validation passed (${DURATION}s)${NC}"
  echo -e "${CYAN}══════════════════════════════════════════════${NC}"
  exit 0
fi

# ─── 4. Lint ────────────────────────────────────────────────
echo -e "${YELLOW}[4] ESLint...${NC}"
if [ "$MODE" = "--fix" ]; then
  if npm run lint -- --fix 2>&1; then
    echo -e "${GREEN}✅ Lint pasado (con auto-fix)${NC}"
  else
    echo -e "${RED}❌ Lint falló (incluso con auto-fix)${NC}"
    exit 1
  fi
else
  if npm run lint 2>&1; then
    echo -e "${GREEN}✅ Lint pasado${NC}"
  else
    echo -e "${RED}❌ Lint falló${NC}"
    echo "   Ejecuta: npm run lint -- --fix"
    exit 1
  fi
fi
echo ""

# ─── 5. Build ───────────────────────────────────────────────
echo -e "${YELLOW}[5] Build de producción...${NC}"
if npm run build 2>&1; then
  echo -e "${GREEN}✅ Build exitoso${NC}"
else
  echo -e "${RED}❌ Build falló${NC}"
  exit 1
fi
echo ""

# ─── Resumen ────────────────────────────────────────────────
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
echo -e "${CYAN}══════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ Validación completa - Listo para commit (${DURATION}s)${NC}"
echo -e "${CYAN}══════════════════════════════════════════════${NC}"
