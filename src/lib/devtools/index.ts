/**
 * Punto de entrada del sistema DevTools.
 * Carga el panel flotante con autocompletado contextual.
 *
 * Uso:
 *   En BaseLayout.astro:
 *     <script>
 *       import { initDevTools } from '@/lib/devtools';
 *       initDevTools();
 *     </script>
 *
 * @module devtools
 */

import { patchLogger } from './logStore';
import { initDevToolsPanel } from './panel';

/**
 * Inicializa el DevTools: panel flotante + captura de logs.
 */
export function initDevTools(): void {
  patchLogger();
  initDevToolsPanel();
}
