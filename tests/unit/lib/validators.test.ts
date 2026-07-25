/**
 * Tests unitarios para validators.ts
 */

import { describe, it, expect } from "vitest";
import { isValidEmail, isValidPassword, isValidName } from "../../../src/lib/validators";

describe("isValidEmail", () => {
  it("returns false for null/undefined/empty", () => {
    expect(isValidEmail(null)).toBe(false);
    expect(isValidEmail(undefined)).toBe(false);
    expect(isValidEmail("")).toBe(false);
  });

  it("returns false for invalid emails", () => {
    expect(isValidEmail("plain")).toBe(false);
    expect(isValidEmail("@domain.com")).toBe(false);
    expect(isValidEmail("user@")).toBe(false);
    expect(isValidEmail("user@.com")).toBe(false);
  });

  it("returns true for valid emails", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("a.b@c.co")).toBe(true);
    expect(isValidEmail("test+tag@domain.org")).toBe(true);
  });
});

describe("isValidPassword", () => {
  it("returns invalid for null/undefined/empty", () => {
    expect(isValidPassword(null).valid).toBe(false);
    expect(isValidPassword(undefined).valid).toBe(false);
    expect(isValidPassword("").valid).toBe(false);
  });

  it("returns errors for short password", () => {
    const r = isValidPassword("Ab1");
    expect(r.valid).toBe(false);
    expect(r.errors).toContain("Debe tener al menos 8 caracteres");
  });

  it("returns error when missing uppercase", () => {
    const r = isValidPassword("abcdef12");
    expect(r.valid).toBe(false);
    expect(r.errors[0]).toContain("mayúscu");
  });

  it("returns multiple errors when several rules fail", () => {
    const r = isValidPassword("short1");
    expect(r.errors.length).toBeGreaterThan(1);
  });

  it("returns valid for a strong password", () => {
    const r = isValidPassword("StrongPass1");
    expect(r.valid).toBe(true);
    expect(r.errors).toHaveLength(0);
  });
});

describe("isValidName", () => {
  it("returns invalid for null/undefined/empty", () => {
    expect(isValidName(null).valid).toBe(false);
    expect(isValidName(undefined).valid).toBe(false);
    expect(isValidName("").valid).toBe(false);
  });

  it("returns invalid for too short name", () => {
    const r = isValidName("A");
    expect(r.valid).toBe(false);
    expect(r.error).toBe("El nombre debe tener al menos 2 caracteres");
  });

  it("returns invalid for too long name", () => {
    const r = isValidName("A".repeat(51));
    expect(r.valid).toBe(false);
    expect(r.error).toContain("no puede exceder");
  });

  it("returns invalid for name with special chars", () => {
    const r = isValidName("User@123");
    expect(r.valid).toBe(false);
    expect(r.error).toBe("El nombre contiene caracteres no válidos");
  });

  it("accepts valid names with spanish chars", () => {
    expect(isValidName("María José").valid).toBe(true);
    expect(isValidName("José Álvarez").valid).toBe(true);
    expect(isValidName("Ana").valid).toBe(true);
  });
});
