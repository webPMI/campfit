/**
 * Tests unitarios para logService.ts
 *
 * @module tests/unit/lib/shared/logService.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock de Firebase y logger
const mockSetDoc = vi.fn();
const mockDoc = vi.fn();
const mockWriteBatch = vi.fn();
const mockCollection = vi.fn();
const mockQuery = vi.fn();
const mockWhere = vi.fn();
const mockGetDocs = vi.fn();
const mockServerTimestamp = vi.fn();
const mockLoggerError = vi.fn();
const mockLoggerWarn = vi.fn();
const mockLoggerSubscribe = vi.fn();

vi.mock('@/lib/firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({
  setDoc: (...args) => mockSetDoc(...args),
  doc: (...args) => mockDoc(...args),
  writeBatch: () => mockWriteBatch(),
  collection: (...args) => mockCollection(...args),
  query: (...args) => mockQuery(...args),
  where: (...args) => mockWhere(...args),
  getDocs: (...args) => mockGetDocs(...args),
  serverTimestamp: () => mockServerTimestamp(),
}));
vi.mock('@/lib/shared/logger', () => ({
  logger: {
    error: (...args) => mockLoggerError(...args),
    warn: (...args) => mockLoggerWarn(...args),
    subscribe: (cb: (entry: { level: string }) => void) => {
      mockLoggerSubscribe(cb);
      return () => {};
    },
  },
}));

import { logService } from '@/lib/shared/logService';

describe('logService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSetDoc.mockResolvedValue(undefined);
    mockDoc.mockReturnValue({ id: 'test-id' });
    mockWriteBatch.mockReturnValue({
      delete: vi.fn(),
      commit: vi.fn().mockResolvedValue(undefined),
    });
    mockCollection.mockReturnValue({});
    mockQuery.mockReturnValue({});
    mockWhere.mockReturnValue({});
    mockGetDocs.mockResolvedValue({ empty: true, docs: [] });
    mockServerTimestamp.mockReturnValue(new Date());
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('log', () => {
    it('debería delegar a logger.error para nivel error', () => {
      logService.log('error', 'fallo', { activity: 'login' });
      expect(mockLoggerError).toHaveBeenCalledTimes(1);
    });

    it('debería delegar a logger.warn para nivel warn', () => {
      logService.log('warn', 'aviso', { activity: 'sync' });
      expect(mockLoggerWarn).toHaveBeenCalledTimes(1);
    });

    it('no debería hacer nada para niveles debug/info/success', () => {
      logService.log('debug', 'debug');
      logService.log('info', 'info');
      logService.log('success', 'ok');
      expect(mockLoggerError).not.toHaveBeenCalled();
      expect(mockLoggerWarn).not.toHaveBeenCalled();
    });
  });

  describe('error', () => {
    it('debería llamar a logger.error', async () => {
      await logService.error('Auth', 'Login failed', new Error('fail'));
      expect(mockLoggerError).toHaveBeenCalledTimes(1);
    });
  });

  describe('warn', () => {
    it('debería llamar a logger.warn', async () => {
      await logService.warn('Trainer', 'Cliente sin rutina');
      expect(mockLoggerWarn).toHaveBeenCalledTimes(1);
    });
  });
});
