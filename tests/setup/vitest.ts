/**
 * Setup global para tests unitarios con Vitest.
 * Se ejecuta antes de cada archivo de test.
 *
 * Incluye:
 * - Mocks globales de Firebase (Auth, Firestore, Storage)
 * - Variables de entorno mock para import.meta.env
 *
 * NOTA: No usamos React, por lo que no incluimos jsdom ni Testing Library.
 * Los tests de servicios, stores y utilidades se ejecutan en entorno node.
 */

// ─── Mocks globales de Firebase ──────────────────────────────────────────────
// Estos mocks evitan que los tests intenten conectar con Firebase real.
// Se aplican a nivel global para que cualquier import de firebase los use.

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
  getApp: vi.fn(() => ({})),
  getApps: vi.fn(() => []),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn((_auth, callback) => {
    callback(null);
    return vi.fn();
  }),
  sendPasswordResetEmail: vi.fn(),
  confirmPasswordReset: vi.fn(),
  GoogleAuthProvider: vi.fn(() => ({})),
  signInWithPopup: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn(() => ({})),
  doc: vi.fn(() => ({})),
  addDoc: vi.fn((_col, data) => Promise.resolve({ id: 'mock-doc-id', ...data })),
  setDoc: vi.fn(() => Promise.resolve()),
  updateDoc: vi.fn(() => Promise.resolve()),
  deleteDoc: vi.fn(() => Promise.resolve()),
  getDoc: vi.fn(() =>
    Promise.resolve({
      exists: () => true,
      data: () => ({ id: 'mock-doc-id' }),
      id: 'mock-doc-id',
    }),
  ),
  getDocs: vi.fn(() =>
    Promise.resolve({
      docs: [],
      empty: true,
      size: 0,
    }),
  ),
  query: vi.fn(() => ({})),
  where: vi.fn(() => ({})),
  orderBy: vi.fn(() => ({})),
  limit: vi.fn(() => ({})),
  onSnapshot: vi.fn((_ref, callback) => {
    callback({ docs: [], empty: true, size: 0 });
    return vi.fn();
  }),
  serverTimestamp: vi.fn(() => new Date('2024-01-01T00:00:00.000Z')),
  Timestamp: {
    fromDate: vi.fn((date: Date) => ({ seconds: Math.floor(date.getTime() / 1000), nanoseconds: 0 })),
    now: vi.fn(() => ({ seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 })),
  },
}));

vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(() => ({})),
  ref: vi.fn(() => ({})),
  uploadBytes: vi.fn(() => Promise.resolve({ ref: {}, metadata: {} })),
  getDownloadURL: vi.fn(() => Promise.resolve('https://mock-storage.url/file.png')),
  deleteObject: vi.fn(() => Promise.resolve()),
}));
