/**
 * Tests unitarios para funciones de validación.
 *
 * Las utilidades de validación son funciones puras → fáciles de testear.
 * Cubrir: casos válidos, inválidos, edge cases (null, undefined, empty).
 */

import { describe, it, expect } from 'vitest';

// ─── Utilidades de ejemplo ───────────────────────────────────────────────────
// NOTA: Reemplazar con imports reales cuando existan en src/lib/validators.ts

/**
 * Valida si un email tiene formato correcto.
 */
function isValidEmail(email: string | null | undefined): boolean {
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
function isValidPassword(password: string | null | undefined): { valid: boolean; errors: string[] } {
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
function isValidName(name: string | null | undefined): { valid: boolean; error: string | null } {
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

// ─── Tests: isValidEmail ─────────────────────────────────────────────────────

describe('isValidEmail', () => {
  it('✅ should accept valid email', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('test.user+tag@domain.co')).toBe(true);
    expect(isValidEmail('a@b.cd')).toBe(true);
  });

  it('❌ should reject invalid email', () => {
    expect(isValidEmail('not-an-email')).toBe(false);
    expect(isValidEmail('@domain.com')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
    expect(isValidEmail('user@.com')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });

  it('⚠️ should handle null and undefined', () => {
    expect(isValidEmail(null)).toBe(false);
    expect(isValidEmail(undefined)).toBe(false);
  });
});

// ─── Tests: isValidPassword ──────────────────────────────────────────────────

describe('isValidPassword', () => {
  it('✅ should accept valid password', () => {
    const result = isValidPassword('Password1');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('✅ should accept complex password', () => {
    const result = isValidPassword('MyStr0ng!Pass');
    expect(result.valid).toBe(true);
  });

  it('❌ should reject short password', () => {
    const result = isValidPassword('Ab1');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Debe tener al menos 8 caracteres');
  });

  it('❌ should reject password without uppercase', () => {
    const result = isValidPassword('password1');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Debe contener al menos una mayúscula');
  });

  it('❌ should reject password without lowercase', () => {
    const result = isValidPassword('PASSWORD1');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Debe contener al menos una minúscula');
  });

  it('❌ should reject password without number', () => {
    const result = isValidPassword('Password');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Debe contener al menos un número');
  });

  it('⚠️ should accumulate multiple errors', () => {
    const result = isValidPassword('abc');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });

  it('⚠️ should handle null and undefined', () => {
    expect(isValidPassword(null).valid).toBe(false);
    expect(isValidPassword(undefined).valid).toBe(false);
    expect(isValidPassword(null).errors).toContain('La contraseña es requerida');
  });
});

// ─── Tests: isValidName ──────────────────────────────────────────────────────

describe('isValidName', () => {
  it('✅ should accept valid names', () => {
    expect(isValidName('Juan').valid).toBe(true);
    expect(isValidName('María José').valid).toBe(true);
    expect(isValidName('Jean-Pierre').valid).toBe(true);
    expect(isValidName('A').valid).toBe(false); // muy corto
  });

  it('❌ should reject empty or whitespace-only names', () => {
    expect(isValidName('').valid).toBe(false);
    expect(isValidName('   ').valid).toBe(false);
  });

  it('❌ should reject names with invalid characters', () => {
    expect(isValidName('User123').valid).toBe(false);
    expect(isValidName('user@name').valid).toBe(false);
    expect(isValidName('<script>').valid).toBe(false);
  });

  it('❌ should reject names exceeding 50 characters', () => {
    const longName = 'A'.repeat(51);
    expect(isValidName(longName).valid).toBe(false);
  });

  it('⚠️ should handle null and undefined', () => {
    expect(isValidName(null).valid).toBe(false);
    expect(isValidName(undefined).valid).toBe(false);
  });
});
