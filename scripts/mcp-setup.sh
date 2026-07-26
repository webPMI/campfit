#!/bin/bash
# ============================================================
# mcp-setup.sh - Setup de servidores MCP para CampFit
# ============================================================
# Configura y verifica los servidores MCP necesarios para
# que los agentes de IA trabajen con Firebase, GitHub y
# el sistema de archivos.
#
# Uso:
#   bash scripts/mcp-setup.sh              # Verificar configuración
#   bash scripts/mcp-setup.sh --install    # Instalar servidores
#   bash scripts/mcp-setup.sh --check      # Solo verificar
#   bash scripts/mcp-setup.sh --env        # Generar .env template
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}══════════════════════════════════════════════${NC}"
echo -e "${CYAN}  🔌 CampFit - MCP Setup${NC}"
echo -e "${CYAN}══════════════════════════════════════════════${NC}"
echo ""

# ─── 1. Verificar .mcp.json ─────────────────────────────────
echo -e "${YELLOW}[1/4] Verificando configuración MCP...${NC}"
if [ -f ".mcp.json" ]; then
  echo -e "  ${GREEN}✅ .mcp.json existe${NC}"
  
  # Verificar que es JSON válido
  if command -v python &> /dev/null; then
    if python -c "import json; json.load(open('.mcp.json'))" 2>/dev/null; then
      echo -e "  ${GREEN}✅ .mcp.json es JSON válido${NC}"
    else
      echo -e "  ${RED}❌ .mcp.json no es JSON válido${NC}"
      exit 1
    fi
  fi
else
  echo -e "  ${RED}❌ .mcp.json no encontrado${NC}"
  echo "  Crea el archivo .mcp.json en la raíz del proyecto"
  exit 1
fi
echo ""

# ─── 2. Verificar variables de entorno ──────────────────────
echo -e "${YELLOW}[2/4] Verificando variables de entorno...${NC}"

MCP_VARS=(
  "FIREBASE_CLIENT_EMAIL:Firebase Client Email"
  "FIREBASE_PRIVATE_KEY:Firebase Private Key"
  "GITHUB_TOKEN:GitHub Token"
)

ALL_SET=true
for entry in "${MCP_VARS[@]}"; do
  VAR="${entry%%:*}"
  DESC="${entry#*:}"
  if [ -n "${!VAR}" ]; then
    echo -e "  ${GREEN}✅ $DESC configurada${NC}"
  else
    echo -e "  ${YELLOW}⚠️  $DESC no configurada${NC}"
    ALL_SET=false
  fi
done

if [ "$ALL_SET" = false ]; then
  echo ""
  echo -e "  ${YELLOW}Variables faltantes. Puedes:${NC}"
  echo "  1. Configurarlas en tu terminal:"
  echo "     export FIREBASE_CLIENT_EMAIL=\"tu-email@project.iam.gserviceaccount.com\""
  echo "     export FIREBASE_PRIVATE_KEY=\"-----BEGIN PRIVATE KEY-----\\n...\""
  echo "     export GITHUB_TOKEN=\"ghp_...\""
  echo ""
  echo "  2. O usar un archivo .env:"
  echo "     bash scripts/mcp-setup.sh --env"
  echo ""
  echo "  3. O configurarlas en el IDE (VS Code settings)"
fi
echo ""

# ─── 3. Verificar servidores instalados ─────────────────────
echo -e "${YELLOW}[3/4] Verificando servidores MCP...${NC}"

# Firebase MCP
if npx @firebase-mcp/server --version 2>/dev/null || npx @firebase-mcp/server --help 2>/dev/null; then
  echo -e "  ${GREEN}✅ @firebase-mcp/server disponible${NC}"
else
  echo -e "  ${YELLOW}⚠️  @firebase-mcp/server no instalado${NC}"
  if [ "${1:-}" = "--install" ]; then
    echo "  Instalando..."
    npm install -g @firebase-mcp/server 2>/dev/null || npm install @firebase-mcp/server 2>/dev/null
    echo -e "  ${GREEN}✅ Instalado${NC}"
  fi
fi

# GitHub MCP
if npx @github-mcp/server --version 2>/dev/null || npx @github-mcp/server --help 2>/dev/null; then
  echo -e "  ${GREEN}✅ @github-mcp/server disponible${NC}"
else
  echo -e "  ${YELLOW}⚠️  @github-mcp/server no instalado${NC}"
  if [ "${1:-}" = "--install" ]; then
    echo "  Instalando..."
    npm install -g @github-mcp/server 2>/dev/null || npm install @github-mcp/server 2>/dev/null
    echo -e "  ${GREEN}✅ Instalado${NC}"
  fi
fi

# Filesystem MCP
if npx @filesystem-mcp/server --version 2>/dev/null || npx @filesystem-mcp/server --help 2>/dev/null; then
  echo -e "  ${GREEN}✅ @filesystem-mcp/server disponible${NC}"
else
  echo -e "  ${YELLOW}⚠️  @filesystem-mcp/server no instalado${NC}"
  if [ "${1:-}" = "--install" ]; then
    echo "  Instalando..."
    npm install -g @filesystem-mcp/server 2>/dev/null || npm install @filesystem-mcp/server 2>/dev/null
    echo -e "  ${GREEN}✅ Instalado${NC}"
  fi
fi
echo ""

# ─── 4. Resumen ─────────────────────────────────────────────
echo -e "${YELLOW}[4/4] Resumen MCP${NC}"
echo "  Config file: .mcp.json"
echo "  Servidores configurados:"
echo "    - firebase-mcp: Firebase Auth + Firestore"
echo "    - github-mcp: GitHub API"
echo "    - filesystem-mcp: Sistema de archivos"
echo ""

echo -e "${CYAN}══════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ MCP Setup completado${NC}"
echo -e "${CYAN}══════════════════════════════════════════════${NC}"
echo ""
echo "📋 Para usar los servidores MCP:"
echo "  1. Asegúrate de tener las variables de entorno configuradas"
echo "  2. Los servidores se conectan automáticamente desde el IDE"
echo "  3. Verifica la conexión en los logs del IDE"
echo ""

# ─── Modo --env: generar .env template ──────────────────────
if [ "${1:-}" = "--env" ]; then
  echo -e "${CYAN}══════════════════════════════════════════════${NC}"
  echo -e "${CYAN}  📝 Generando .env template${NC}"
  echo -e "${CYAN}══════════════════════════════════════════════${NC}"
  echo ""
  
  if [ ! -f ".env" ]; then
    cat > .env << 'ENVEOF'
# CampFit - Variables de Entorno
# Copia este archivo como .env y completa los valores

# Firebase
FIREBASE_CLIENT_EMAIL=tu-email@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# GitHub
GITHUB_TOKEN=ghp_tu_token_aqui

# Firebase Público (para el frontend)
PUBLIC_FIREBASE_API_KEY=tu-api-key
PUBLIC_FIREBASE_AUTH_DOMAIN=tu-project.firebaseapp.com
PUBLIC_FIREBASE_PROJECT_ID=tu-project-id
PUBLIC_FIREBASE_STORAGE_BUCKET=tu-project.appspot.com
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
ENVEOF
    echo -e "  ${GREEN}✅ .env creado${NC}"
    echo "  Completa los valores en .env"
  else
    echo -e "  ${YELLOW}⚠️  .env ya existe${NC}"
  fi
fi
