/**
 * Tests unitarios para funciones de validación.
 *
 * Las utilidades de validación son funciones puras → fáciles de testear.
 * Cubrir: casos válidos, inválidos, edge cases (null, undefined, empty).
 */

import { describe, it, expect } from 'vitest';

// ─── Importar funciones reales desde src/lib/validators.ts ───────────────────

import { isValidEmail, isValidPassword, isValidName } from '../../../src/lib/validators';


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
  });

  it('❌ should reject empty or whitespace-only names', () => {
    expect(isValidName('').valid).toBe(false);
    expect(isValidName('   ').valid).toBe(false);
  });

  it('❌ should reject names shorter than 2 characters', () => {
    expect(isValidName('A').valid).toBe(false);
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
