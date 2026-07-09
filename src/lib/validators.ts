/**
 * Utilidades de validación para formularios.
 * Funciones puras → fáciles de testear.
 */

/**
 * Valida si un email tiene formato correcto.
 */
export function isValidEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Valida si una contraseña cumple los requisitos mínimos:
 * - Mínimo 8 caracteres
 * - Al menos 1 mayúscula
 * - Al menos 1 minúscula
 * - Al menos 1 número
 */
export function isValidPassword(
  password: string | null | undefined,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!password) {
    return { valid: false, errors: ['La contraseña es requerida'] };
  }

  if (password.length < 8) {
    errors.push('Debe tener al menos 8 caracteres');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Debe contener al menos una mayúscula');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Debe contener al menos una minúscula');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Debe contener al menos un número');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Valida si un nombre de usuario es válido.
 * - Entre 2 y 50 caracteres
 * - Solo letras, espacios, guiones y apóstrofes
 */
export function isValidName(
  name: string | null | undefined,
): { valid: boolean; error: string | null } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'El nombre es requerido' };
  }
  if (name.trim().length < 2) {
    return { valid: false, error: 'El nombre debe tener al menos 2 caracteres' };
  }
  if (name.trim().length > 50) {
    return { valid: false, error: 'El nombre no puede exceder 50 caracteres' };
  }
  if (!/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s'-]+$/.test(name.trim())) {
    return { valid: false, error: 'El nombre contiene caracteres no válidos' };
  }
  return { valid: true, error: null };
}
