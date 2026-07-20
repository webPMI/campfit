#!/bin/bash
# ============================================================
# agent-lock.sh - Sistema de lock para multi-agente
# ============================================================
# Previene que dos agentes de IA modifiquen los mismos archivos
# simultáneamente.
#
# Uso:
#   bash scripts/agent-lock.sh acquire "feature-name"
#   bash scripts/agent-lock.sh release
#   bash scripts/agent-lock.sh check
#   bash scripts/agent-lock.sh status
# ============================================================

LOCK_DIR="scripts"
LOCK_FILE="$LOCK_DIR/.agent-lock"
LOCK_TIMEOUT=1800  # 30 minutos en segundos

mkdir -p "$LOCK_DIR"

case "${1:-help}" in
  acquire)
    # Verificar si ya existe lock
    if [ -f "$LOCK_FILE" ]; then
      LOCK_TIME=$(cat "$LOCK_FILE" | cut -d':' -f2)
      CURRENT_TIME=$(date +%s)
      ELAPSED=$((CURRENT_TIME - LOCK_TIME))

      if [ "$ELAPSED" -lt "$LOCK_TIMEOUT" ]; then
        LOCK_AGENT=$(cat "$LOCK_FILE" | cut -d':' -f1)
        LOCK_FEATURE=$(cat "$LOCK_FILE" | cut -d':' -f3-)
        echo "🔴 LOCKED por $LOCK_AGENT (hace ${ELAPSED}s) - Feature: $LOCK_FEATURE"
        exit 1
      else
        echo "⚠️  Lock stale detectado (${ELAPSED}s > ${LOCK_TIMEOUT}s). Liberando..."
        rm -f "$LOCK_FILE"
      fi
    fi

    # Crear lock
    AGENT="${2:-unknown}"
    FEATURE="${3:-unknown}"
    echo "${AGENT}:$(date +%s):${FEATURE}" > "$LOCK_FILE"
    echo "🟢 Lock adquirido para: $FEATURE"
    ;;

  release)
    if [ -f "$LOCK_FILE" ]; then
      rm -f "$LOCK_FILE"
      echo "🟢 Lock liberado"
    else
      echo "⚠️  No hay lock activo"
    fi
    ;;

  check)
    if [ -f "$LOCK_FILE" ]; then
      LOCK_AGENT=$(cat "$LOCK_FILE" | cut -d':' -f1)
      LOCK_FEATURE=$(cat "$LOCK_FILE" | cut -d':' -f3-)
      echo "🔴 LOCKED por $LOCK_AGENT - Feature: $LOCK_FEATURE"
      exit 1
    else
      echo "🟢 FREE"
      exit 0
    fi
    ;;

  status)
    if [ -f "$LOCK_FILE" ]; then
      LOCK_AGENT=$(cat "$LOCK_FILE" | cut -d':' -f1)
      LOCK_TIME=$(cat "$LOCK_FILE" | cut -d':' -f2)
      LOCK_FEATURE=$(cat "$LOCK_FILE" | cut -d':' -f3-)
      CURRENT_TIME=$(date +%s)
      ELAPSED=$((CURRENT_TIME - LOCK_TIME))
      REMAINING=$((LOCK_TIMEOUT - ELAPSED))
      echo "📋 Estado del Lock:"
      echo "  Agente:    $LOCK_AGENT"
      echo "  Feature:   $LOCK_FEATURE"
      echo "  Tiempo:    ${ELAPSED}s transcurridos / ${REMAINING}s restantes"
      echo "  Expira:    $((REMAINING > 0 ? REMAINING : 0))s"
    else
      echo "📋 Estado del Lock: 🟢 FREE (sin lock activo)"
    fi
    ;;

  help|*)
    echo "Uso: bash scripts/agent-lock.sh <comando> [args]"
    echo ""
    echo "Comandos:"
    echo "  acquire [agent] [feature]  - Adquirir lock"
    echo "  release                    - Liberar lock"
    echo "  check                      - Verificar lock (exit 1 si locked)"
    echo "  status                     - Mostrar estado detallado"
    echo "  help                       - Mostrar esta ayuda"
    ;;
esac
