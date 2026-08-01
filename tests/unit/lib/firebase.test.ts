/**
 * Tests unitarios para firebase.ts
 */

import { describe, it, expect, vi, beforeAll } from "vitest";

const mockInitializeApp = vi.fn(() => ({ name: "[DEFAULT]" }));
const mockGetAuth = vi.fn(() => ({ currentUser: null }));
const mockGetFirestore = vi.fn(() => ({}));
const mockSetPersistence = vi.fn(() => Promise.resolve());
const mockBrowserLocalPersistence = "local";

vi.mock("firebase/app", () => ({ initializeApp: mockInitializeApp, getApp: vi.fn(), getApps: vi.fn(() => []) }));
vi.mock("firebase/auth", () => ({ getAuth: mockGetAuth, setPersistence: mockSetPersistence, browserLocalPersistence: mockBrowserLocalPersistence }));
vi.mock("firebase/firestore", () => ({ getFirestore: mockGetFirestore }));

let firebaseModule: any;

beforeAll(async () => {
  // The module top-level code runs once, including setPersistence
  firebaseModule = await import("../../../src/lib/firebase");
});

describe("src/lib/firebase", () => {
  it("should init Firebase with env config", () => {
    expect(mockInitializeApp).toHaveBeenCalledTimes(1);
    const config = (mockInitializeApp.mock.calls as any)[0]?.[0];
    expect(config?.apiKey).toBe("test-key");
    expect(config?.projectId).toBe("test-project");
  });

  it("should export auth, db, and default", () => {
    expect(firebaseModule.auth).toBeDefined();
    expect(firebaseModule.db).toBeDefined();
    expect(firebaseModule.default).toBeDefined();
    expect(mockGetAuth).toHaveBeenCalled();
    expect(mockGetFirestore).toHaveBeenCalled();
  });

  it("should set persistence to browserLocalPersistence", () => {
    expect(mockSetPersistence).toHaveBeenCalledTimes(1);
    expect(mockSetPersistence).toHaveBeenCalledWith(firebaseModule.auth, mockBrowserLocalPersistence);
  });
});
