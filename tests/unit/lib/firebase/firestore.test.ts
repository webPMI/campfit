/**
 * Tests unitarios para lib/firebase/firestore (wrapper de Firebase Firestore).
 * Verifica que las funciones se exportan correctamente.
 */

import { describe, it, expect } from 'vitest';
import { doc, setDoc, getDoc, serverTimestamp } from '../../../../src/lib/firebase/firestore';

describe('lib/firebase/firestore', () => {
  it('✅ should export doc', () => {
    expect(doc).toBeDefined();
    expect(typeof doc).toBe('function');
  });

  it('✅ should export setDoc', () => {
    expect(setDoc).toBeDefined();
    expect(typeof setDoc).toBe('function');
  });

  it('✅ should export getDoc', () => {
    expect(getDoc).toBeDefined();
    expect(typeof getDoc).toBe('function');
  });

  it('✅ should export serverTimestamp', () => {
    expect(serverTimestamp).toBeDefined();
    expect(typeof serverTimestamp).toBe('function');
  });
});