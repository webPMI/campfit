#!/usr/bin/env bash
# =============================================================================
# agent-lock.sh — Sistema de bloqueo para agentes multi-agente CampFit
# =============================================================================
# 
# Uso:
#   bash scripts/agent-lock.sh acquire src/pages/login.astro    # Bloquear archivo
#   bash scripts/agent-lock.sh release src/pages/login.astro    # Liberar archivo
#   bash scripts/agent-lock.sh status                           # Ver todos los locks
#   bash scripts/agent-lock.sh check                            # Verificar si hay locks
#
# Los locks se almacenan en agents/.locks/ como archivos JSON
# con información del agente que bloqueó, timestamp y archivo.

set -euo pipefail

LOCKS_DIR="agents/.locks"
mkdir -p "$LOCKS_DIR"

# ─── Colores para output ───────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ─── Funciones Helper ───────────────────────────────────────────────────────

get_agent_name() {
  # Obtiene el nombre del agente desde la variable de entorno o git config
  echo "${AGENT_NAME:-unknown}"
}

lock_file_path() {
  local file="$1"
  # Normalizar el path del archivo para el nombre del lock
  local normalized="${file//\//_}"
  echo "$LOCKS_DIR/${normalized}.lock"
}

is_locked() {
  local file="$1"
  local lock_path
  lock_path=$(lock_file_path "$file")
  [[ -f "$lock_path" ]]
}

who_locked() {
  local file="$1"
  local lock_path
  lock_path=$(lock_file_path "$file")
  if [[ -f "$lock_path" ]]; then
    cat "$lock_path" | python3 -c "import sys,json; d=json.load(sys.stdin); print(f\"{d['agent']} (desde {d['timestamp']})\")" 2>/dev/null || echo "desconocido"
  else
    echo "ninguno"
  fi
}

# ─── Comandos ───────────────────────────────────────────────────────────────

cmd_acquire() {
  local file="$1"
  local lock_path
  lock_path=$(lock_file_path "$file")
  
  if is_locked "$file"; then
    echo -e "${RED}❌ ARCHIVO BLOQUEADO:${NC} $file"
    echo -e "   Bloqueado por: $(who_locked "$file")"
    return 1
  fi
  
  local agent
  agent=$(get_agent_name)
  local timestamp
  timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  
  echo "{\"agent\":\"$agent\",\"file\":\"$file\",\"timestamp\":\"$timestamp\"}" > "$lock_path"
  echo -e "${GREEN}✅ BLOQUEADO:${NC} $file → agente: ${CYAN}$agent${NC}"
  return 0
}

cmd_release() {
  local file="$1"
  local lock_path
  lock_path=$(lock_file_path "$file")
  
  if ! is_locked "$file"; then
    echo -e "${YELLOW}⚠️  No estaba bloqueado:${NC} $file"
    return 0
  fi
  
  rm -f "$lock_path"
  echo -e "${GREEN}✅ LIBERADO:${NC} $file"
  return 0
}

cmd_status() {
  echo "🔒 Estado de bloqueos:"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  local lock_files
  lock_files=$(find "$LOCKS_DIR" -name "*.lock" -type f 2>/dev/null || true)
  
  if [[ -z "$lock_files" ]]; then
    echo -e "${GREEN}  Sin bloqueos activos.${NC}"
  else
    while IFS= read -r lock_file; do
      local data
      data=$(cat "$lock_file" 2>/dev/null)
      local agent file timestamp
      agent=$(echo "$data" | python3 -c "import sys,json; print(json.load(sys.stdin)['agent'])" 2>/dev/null || echo "?")
      file=$(echo "$data" | python3 -c "import sys,json; print(json.load(sys.stdin)['file'])" 2>/dev/null || echo "?")
      timestamp=$(echo "$data" | python3 -c "import sys,json; print(json.load(sys.stdin)['timestamp'])" 2>/dev/null || echo "?")
      echo -e "  📁 ${CYAN}$file${NC}"
      echo -e "     🤖 $agent — ${YELLOW}$timestamp${NC}"
    done <<< "$lock_files"
  fi
  echo ""
}

cmd_check() {
  local lock_files
  lock_files=$(find "$LOCKS_DIR" -name "*.lock" -type f 2>/dev/null || true)
  
  if [[ -n "$lock_files" ]]; then
    echo -e "${RED}⚠️  Hay bloqueos activos:${NC}"
    cmd_status
    return 1
  else
    echo -e "${GREEN}✅ Sin bloqueos activos. Puedes proceder.${NC}"
    return 0
  fi
}

cmd_cleanup() {
  # Limpiar locks de agentes que ya no existen o tienen más de 1 hora
  local now
  now=$(date -u +%s)
  local cleaned=0
  
  local lock_files
  lock_files=$(find "$LOCKS_DIR" -name "*.lock" -type f 2>/dev/null || true)
  
  while IFS= read -r lock_file; do
    local lock_time
    lock_time=$(date -u -d "$(cat "$lock_file" | python3 -c "import sys,json; print(json.load(sys.stdin)['timestamp'])" 2>/dev/null || echo "1970-01-01T00:00:00Z")" +%s 2>/dev/null || echo 0)
    local age=$(( (now - lock_time) / 60 ))
    
    if [[ $age -gt 60 ]]; then
      rm -f "$lock_file"
      ((cleaned++))
    fi
  done <<< "$lock_files"
  
  if [[ $cleaned -gt 0 ]]; then
    echo -e "${GREEN}🧹 Limpiados $cleaned locks obsoletos (>1 hora).${NC}"
  else
    echo -e "${GREEN}✅ No hay locks obsoletos.${NC}"
  fi
}

# ─── Main ───────────────────────────────────────────────────────────────────

cmd="${1:-help}"
arg="${2:-}"

case "$cmd" in
  acquire|lock)
    if [[ -z "$arg" ]]; then
      echo -e "${RED}❌ Uso: agent-lock.sh acquire <archivo>${NC}"
      exit 1
    fi
    cmd_acquire "$arg"
    ;;
  
  release|unlock)
    if [[ -z "$arg" ]]; then
      echo -e "${RED}❌ Uso: agent-lock.sh release <archivo>${NC}"
      exit 1
    fi
    cmd_release "$arg"
    ;;
  
  status|list)
    cmd_status
    ;;
  
  check)
    cmd_check
    ;;
  
  cleanup)
    cmd_cleanup
    ;;
  
  help|*)
    echo "🔒 CampFit Agent Lock System"
    echo ""
    echo "Uso:"
    echo "  bash scripts/agent-lock.sh acquire <archivo>   # Bloquear archivo"
    echo "  bash scripts/agent-lock.sh release <archivo>   # Liberar archivo"
    echo "  bash scripts/agent-lock.sh status              # Ver todos los locks"
    echo "  bash scripts/agent-lock.sh check               # Verificar si hay locks"
    echo "  bash scripts/agent-lock.sh cleanup             # Limpiar locks obsoletos"
    echo ""
    echo "Configuración:"
    echo "  AGENT_NAME=frontend bash scripts/agent-lock.sh acquire ..."
    exit 0
    ;;
esac