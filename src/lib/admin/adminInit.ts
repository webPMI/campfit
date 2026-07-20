/**
 * Funciones de inicialización global para el panel de administración.
 *
 * @module adminInit
 */

/**
 * Inicializa acciones globales (compatible con trainerUtils.initGlobalActions).
 */
export function initGlobalActions(adminId: string): void {
  (window as unknown as Record<string, unknown>).__adminId = adminId;
}

/**
 * Inicializa acciones específicas del admin.
 */
export function initAdminActions(adminId: string): void {
  (window as unknown as Record<string, unknown>).__adminId = adminId;
}
