/**
 * Tests unitarios para firestoreDebug.ts
 */

import { describe, it, expect, vi, beforeAll } from "vitest";

// Mock firebase
vi.mock("@/lib/firebase", () => ({
  auth: { currentUser: null },
  db: {},
}));

const mockGetDoc = vi.fn();
const mockDoc = vi.fn();
const mockCollection = vi.fn();
const mockQuery = vi.fn();
const mockGetDocs = vi.fn();
const mockWhere = vi.fn();
const mockOrderBy = vi.fn();
const mockLimit = vi.fn();
const mockOnSnapshot = vi.fn();

vi.mock("firebase/firestore", () => ({
  getDoc: mockGetDoc,
  doc: mockDoc,
  collection: mockCollection,
  query: mockQuery,
  getDocs: mockGetDocs,
  where: mockWhere,
  orderBy: mockOrderBy,
  limit: mockLimit,
  onSnapshot: mockOnSnapshot,
}));

let firestoreModule: any;

beforeAll(async () => {
  // Import once — module top-level auto-init runs here
  firestoreModule = await import("../../../../src/lib/debug/firestoreDebug");
});

describe("firestoreDebug", () => {
  it("exports initFirestoreDebug function", () => {
    expect(typeof firestoreModule.initFirestoreDebug).toBe("function");
  });

  it("exposes __openFirestoreDebug on window", () => {
    expect((window as any).__openFirestoreDebug).toBeDefined();
    expect(typeof (window as any).__openFirestoreDebug).toBe("function");
  });

  it("initFirestoreDebug does not add listener twice", () => {
    const addEventListenerSpy = vi.spyOn(document, "addEventListener");
    firestoreModule.initFirestoreDebug();
    expect(addEventListenerSpy).not.toHaveBeenCalled();
    addEventListenerSpy.mockRestore();
  });
});
