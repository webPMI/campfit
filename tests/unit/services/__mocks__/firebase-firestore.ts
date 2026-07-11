/**
 * Mock manual para firebase/firestore.
 * Este archivo es cargado por vi.mock('firebase/firestore', { spy: true })
 * o por vi.mock('firebase/firestore', () => import('./__mocks__/firebase-firestore'))
 */

import { vi } from 'vitest';

export const getFirestore = vi.fn(() => ({}));
export const collection = vi.fn(() => ({ id: 'users', path: 'users' }));
export const doc = vi.fn(() => ({ id: 'mock-doc-ref', path: 'users/mock-doc-ref' }));
export const getDocs = vi.fn();
export const getDoc = vi.fn();
export const updateDoc = vi.fn();
export const deleteDoc = vi.fn();
export const query = vi.fn(() => ({}));
export const where = vi.fn(() => ({}));
export const orderBy = vi.fn(() => ({}));
export const limit = vi.fn(() => ({}));
export const serverTimestamp = vi.fn(() => new Date('2024-01-01'));
export const addDoc = vi.fn();
export const setDoc = vi.fn();
export const onSnapshot = vi.fn();
