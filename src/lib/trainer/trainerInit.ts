/**
 * Funciones de inicialización global para el panel de entrenador.
 *
 * @module trainerInit
 */

/**
 * Inicializa acciones globales del entrenador.
 */
export function initGlobalActions(trainerId: string): void {
  (window as unknown as Record<string, unknown>).__trainerId = trainerId;
}
