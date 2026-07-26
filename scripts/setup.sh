#!/bin/bash
# ============================================================
# setup.sh - Setup inicial para nuevos agentes IA
# ============================================================
# Prepara el entorno de trabajo para un agente de IA.
# Debe ejecutarse al comenzar a trabajar en el proyecto.
#
# Uso:
#   bash scripts/setup.sh
#   bash scripts/setup.sh --quick   (solo verificar, no instalar)
#   bash scripts/setup.sh --full    (instalar dependencias + setup completo)
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}══════════════════════════════════════════════${NC}"
echo -e "${CYAN}  🚀 CampFit - Agent Setup${NC}"
echo -e "${CYAN}══════════════════════════════════════════════${NC}"
echo ""

# ─── 1. Verificar Node.js ───────────────────────────────────
echo -e "${YELLOW}[1/6] Verificando Node.js...${NC}"
if command -v node &> /dev/null; then
  NODE_VERSION=$(node -v)
  echo -e "  Node: ${GREEN}$NODE_VERSION${NC}"
  
  # Verificar versión mínima
  NODE_MAJOR=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
  if [ "$NODE_MAJOR" -lt 22 ]; then
    echo -e "  ${RED}❌ Se requiere Node >= 22.12.0 (tienes $NODE_VERSION)${NC}"
    exit 1
  fi
else
  echo -e "  ${RED}❌ Node.js no encontrado${NC}"
  echo "  Instalar: https://nodejs.org/ (v22+)"
  exit 1
fi
echo ""

# ─── 2. Verificar npm ───────────────────────────────────────
echo -e "${YELLOW}[2/6] Verificando npm...${NC}"
if command -v npm &> /dev/null; then
  NPM_VERSION=$(npm -v)
  echo -e "  npm: ${GREEN}$NPM_VERSION${NC}"
else
  echo -e "  ${RED}❌ npm no encontrado${NC}"
  exit 1
fi
echo ""

# ─── 3. Verificar dependencias ──────────────────────────────
echo -e "${YELLOW}[3/6] Verificando dependencias...${NC}"
if [ -d "node_modules" ]; then
  echo -e "  ${GREEN}✅ node_modules existe${NC}"
  
  # Verificar que las dependencias principales están instaladas
  if [ -f "node_modules/.package-lock.json" ] || [ -f "node_modules/astro/package.json" ]; then
    echo -e "  ${GREEN}✅ Dependencias parecen completas${NC}"
  else
    echo -e "  ${YELLOW}⚠️  Dependencias pueden estar incompletas${NC}"
    if [ "${1:-}" = "--full" ]; then
      echo "  Instalando..."
      npm ci
    fi
  fi
else
  echo -e "  ${YELLOW}⚠️  node_modules no encontrado${NC}"
  if [ "${1:-}" = "--full" ]; then
    echo "  Instalando dependencias..."
    npm ci
  else
    echo -e "  ${YELLOW}  Usa --full para instalar automáticamente${NC}"
    echo "  O ejecuta: npm ci"
  fi
fi
echo ""

# ─── 4. Verificar lock ──────────────────────────────────────
echo -e "${YELLOW}[4/6] Verificando lock de agente...${NC}"
if [ -f "scripts/.agent-lock" ]; then
  LOCK_AGENT=$(cat scripts/.agent-lock | cut -d':' -f1)
  LOCK_TIME=$(cat scripts/.agent-lock | cut -d':' -f2)
  LOCK_FEATURE=$(cat scripts/.agent-lock | cut -d':' -f3-)
  CURRENT_TIME=$(date +%s)
  ELAPSED=$((CURRENT_TIME - LOCK_TIME))
  LOCK_TIMEOUT=1800
  
  if [ "$ELAPSED" -lt "$LOCK_TIMEOUT" ]; then
    echo -e "  ${RED}🔴 LOCKED por $LOCK_AGENT (${ELAPSED}s) - $LOCK_FEATURE${NC}"
    echo "  Espera a que termine o libera con: rm scripts/.agent-lock"
    exit 1
  else
    echo -e "  ${YELLOW}⚠️  Lock stale detectado (${ELAPSED}s). Liberando...${NC}"
    rm -f scripts/.agent-lock
    echo -e "  ${GREEN}✅ Lock liberado${NC}"
  fi
else
  echo -e "  ${GREEN}🟢 FREE${NC}"
fi
echo ""

# ─── 5. Verificar git ───────────────────────────────────────
echo -e "${YELLOW}[5/6] Verificando git...${NC}"
if command -v git &> /dev/null; then
  if git rev-parse --git-dir > /dev/null 2>&1; then
    BRANCH=$(git rev-parse --abbrev-ref HEAD)
    echo -e "  Branch: ${GREEN}$BRANCH${NC}"
    
    # Verificar si hay cambios sin commit
    if [ -n "$(git status --porcelain)" ]; then
      echo -e "  ${YELLOW}⚠️  Hay cambios sin commit${NC}"
    fi
    
    # Hacer pull si --full
    if [ "${1:-}" = "--full" ]; then
      echo "  Haciendo pull..."
      git pull origin master --allow-unrelated-histories --no-edit
    fi
  else
    echo -e "  ${RED}❌ No es un repositorio git${NC}"
  fi
else
  echo -e "  ${RED}❌ git no encontrado${NC}"
fi
echo ""

# ─── 6. Resumen ─────────────────────────────────────────────
echo -e "${YELLOW}[6/6] Resumen del proyecto...${NC}"
echo "  Proyecto: CampFit 2.0"
echo "  Stack: Astro 7 + Tailwind 4 + Firestore + Nanostores"
echo "  Tests: $(find tests -name '*.test.ts' -o -name '*.spec.ts' 2>/dev/null | wc -l) archivos"
echo ""

echo -e "${CYAN}══════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ Setup completado${NC}"
echo -e "${CYAN}══════════════════════════════════════════════${NC}"
echo ""
echo "📋 Próximos pasos recomendados:"
echo "  1. Leer CONTEXT.md - Contexto del proyecto"
echo "  2. Leer TASK.md - Tarea actual"
echo "  3. Leer .clinerules - Golden Rules"
echo "  4. bash scripts/agent-lock.sh acquire \"agent-name\" \"feature\""
echo "  5. Implementar cambios"
echo "  6. bash scripts/validate.sh"
echo "  7. git add -A && git commit -m \"tipo: descripción\""
echo "  8. git push origin master"
echo "  9. bash scripts/agent-lock.sh release"
echo ""
