#!/bin/bash
# ============================================================
# validate.sh - Validación pre-commit para agentes IA
# ============================================================
# Ejecuta todas las verificaciones necesarias antes de
# hacer commit. Detiene el proceso si algo falla.
#
# Uso:
#   bash scripts/validate.sh
#   bash scripts/validate.sh --quick  (solo type-check + tests)
# ============================================================

set -e  # Detener en cualquier error

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}══════════════════════════════════════════════${NC}"
echo -e "${CYAN}  🔍 CampFit - Validación Pre-Commit${NC}"
echo -e "${CYAN}══════════════════════════════════════════════${NC}"
echo ""

# ─── 1. Verificar lock ──────────────────────────────────────
echo -e "${YELLOW}[1/5] Verificando lock de agente...${NC}"
if [ -f "scripts/.agent-lock" ]; then
  LOCK_AGENT=$(cat scripts/.agent-lock | cut -d':' -f1)
  echo -e "${RED}❌ Lock activo por: $LOCK_AGENT${NC}"
  echo "   Libera el lock con: rm scripts/.agent-lock"
  exit 1
fi
echo -e "${GREEN}✅ Lock libre${NC}"
echo ""

# ─── 2. TypeScript Check ────────────────────────────────────
echo -e "${YELLOW}[2/5] TypeScript check (astro check)...${NC}"
if npx astro check 2>&1; then
  echo -e "${GREEN}✅ TypeScript check pasado${NC}"
else
  echo -e "${RED}❌ TypeScript check falló${NC}"
  exit 1
fi
echo ""

# ─── 3. Tests Unitarios ─────────────────────────────────────
echo -e "${YELLOW}[3/5] Tests unitarios (Vitest)...${NC}"
if npm test -- --run 2>&1; then
  echo -e "${GREEN}✅ Tests unitarios pasados${NC}"
else
  echo -e "${RED}❌ Tests unitarios fallaron${NC}"
  exit 1
fi
echo ""

# ─── 4. Lint ────────────────────────────────────────────────
echo -e "${YELLOW}[4/5] ESLint...${NC}"
if npm run lint 2>&1; then
  echo -e "${GREEN}✅ Lint pasado${NC}"
else
  echo -e "${RED}❌ Lint falló${NC}"
  exit 1
fi
echo ""

# ─── 5. Build ───────────────────────────────────────────────
echo -e "${YELLOW}[5/5] Build de producción...${NC}"
if npm run build 2>&1; then
  echo -e "${GREEN}✅ Build exitoso${NC}"
else
  echo -e "${RED}❌ Build falló${NC}"
  exit 1
fi
echo ""

# ─── Resumen ────────────────────────────────────────────────
echo -e "${CYAN}══════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ Validación completa - Listo para commit${NC}"
echo -e "${CYAN}══════════════════════════════════════════════${NC}"
