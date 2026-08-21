/**
 * Tests unitarios para exercisePreferencesService.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

const { firestoreInstance, mockFns } = vi.hoisted(() => {
  const firestoreInstance = {
    type: 'firestore',
    app: { name: '[DEFAULT]', options: {} },
    _initialized: true,
    _settings: {},
    _settingsFrozen: false,
    _terminated: false,
    _terminateTask: Promise.resolve(),
    _getSettings: vi.fn(() => ({ host: 'firestore.googleapis.com', ssl: true, ignoreUndefinedProperties: false })),
    _setSettings: vi.fn(),
    _setLanguageCode: vi.fn(),
    _getLanguageCode: vi.fn(() => 'es'),
    _getDatabaseId: vi.fn(() => '(default)'),
    _getAppCheckToken: vi.fn().mockResolvedValue(undefined),
    _getCredentials: vi.fn().mockResolvedValue(undefined),
    toJSON: vi.fn(() => ({})),
  };

  const mockFns = {
    collection: vi.fn(() => ({
      id: 'unknown',
      path: 'firestore/unknown',
      firestore: firestoreInstance,
      type: 'collection',
    })),
    doc: vi.fn((_db, col, id) => ({
      id,
      path: `${col}/${id}`,
      firestore: firestoreInstance,
      type: 'document',
    })),
    getDoc: vi.fn(),
    setDoc: vi.fn(),
    updateDoc: vi.fn(),
    onSnapshot: vi.fn(() => vi.fn()),
    serverTimestamp: vi.fn(() => ({ _methodName: 'serverTimestamp' })),
  };

  return { firestoreInstance, mockFns };
});

vi.mock('firebase/firestore', () => mockFns);
vi.mock('@/lib/firebase', () => ({ db: firestoreInstance }));
vi.mock('@/lib/shared/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));
vi.mock('@/lib/trainer/trainerChat', () => ({
  sendMessage: vi.fn().mockResolvedValue('msg-123'),
}));

import {
  subscribeToUserExercisePreferences,
  getUserExercisePreferences,
  rateExercise,
  toggleFavorite,
  requestExerciseExclusion,
  acknowledgeExerciseRequest,
} from '@/lib/client/exercisePreferencesService';
import type { ExerciseItem } from '@/lib/shared/exerciseLibrary';

describe('exercisePreferencesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('subscribeToUserExercisePreferences', () => {
    it('debe retornar unsubscribe vacío si no se pasa userId', () => {
      const callback = vi.fn();
      const unsub = subscribeToUserExercisePreferences('', callback);
      expect(callback).toHaveBeenCalledWith(null);
      expect(typeof unsub).toBe('function');
    });

    it('debe llamar a onSnapshot con el documento correcto', () => {
      const callback = vi.fn();
      subscribeToUserExercisePreferences('user-1', callback);
      expect(mockFns.doc).toHaveBeenCalledWith(firestoreInstance, 'user_exercise_prefs', 'user-1');
      expect(mockFns.onSnapshot).toHaveBeenCalled();
    });
  });

  describe('getUserExercisePreferences', () => {
    it('debe retornar objeto por defecto si el documento no existe', async () => {
      mockFns.getDoc.mockResolvedValueOnce({
        exists: () => false,
      });

      const res = await getUserExercisePreferences('user-1');
      expect(res.userId).toBe('user-1');
      expect(res.favorites).toEqual([]);
      expect(res.excluded).toEqual([]);
      expect(res.pendingRequests).toEqual([]);
    });

    it('debe retornar datos si el documento existe', async () => {
      mockFns.getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          ratings: { 'ex-1': 5 },
          favorites: ['ex-1'],
          excluded: [],
          pendingRequests: [],
        }),
      });

      const res = await getUserExercisePreferences('user-1');
      expect(res.ratings['ex-1']).toBe(5);
      expect(res.favorites).toEqual(['ex-1']);
    });
  });

  describe('rateExercise', () => {
    it('debe actualizar rating en documento existente', async () => {
      mockFns.getDoc.mockResolvedValueOnce({ exists: () => true });
      mockFns.updateDoc.mockResolvedValueOnce(undefined);

      const ok = await rateExercise('user-1', 'ex-1', 5);
      expect(ok).toBe(true);
      expect(mockFns.updateDoc).toHaveBeenCalled();
    });

    it('debe crear documento si no existe al calificar', async () => {
      mockFns.getDoc.mockResolvedValueOnce({ exists: () => false });
      mockFns.setDoc.mockResolvedValueOnce(undefined);

      const ok = await rateExercise('user-1', 'ex-1', 4);
      expect(ok).toBe(true);
      expect(mockFns.setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          userId: 'user-1',
          ratings: { 'ex-1': 4 },
          favorites: [],
        })
      );
    });
  });

  describe('toggleFavorite', () => {
    it('debe agregar a favoritos si no estaba', async () => {
      mockFns.getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ favorites: ['ex-1'] }),
      });
      mockFns.updateDoc.mockResolvedValueOnce(undefined);

      const ok = await toggleFavorite('user-1', 'ex-2');
      expect(ok).toBe(true);
      expect(mockFns.updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          favorites: ['ex-1', 'ex-2'],
        })
      );
    });

    it('debe remover de favoritos si ya estaba', async () => {
      mockFns.getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ favorites: ['ex-1', 'ex-2'] }),
      });
      mockFns.updateDoc.mockResolvedValueOnce(undefined);

      const ok = await toggleFavorite('user-1', 'ex-1');
      expect(ok).toBe(true);
      expect(mockFns.updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          favorites: ['ex-2'],
        })
      );
    });
  });

  describe('requestExerciseExclusion', () => {
    const mockExercise: ExerciseItem = {
      id: 'ex-1',
      translations: { es: 'Sentadilla con barra', en: 'Barbell Squat', ca: 'Sentadilla amb barra' },
      searchIndex: ['sentadilla'],
      muscleGroups: ['quadriceps', 'glutes'],
      category: 'strength',
      equipment: ['barbell'],
      difficulty: 'intermediate',
      defaultSets: 4,
      defaultReps: 10,
      defaultRestSeconds: 90,
      tags: ['pierna'],
      isActive: true,
      createdBy: 'system',
      createdAt: null,
      updatedAt: null,
    };

    it('debe registrar solicitud y enviar mensaje de chat al entrenador', async () => {
      mockFns.getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ favorites: ['ex-1'], excluded: [], pendingRequests: [] }),
      });
      mockFns.updateDoc.mockResolvedValueOnce(undefined);

      const ok = await requestExerciseExclusion(
        'user-1',
        'Juan Perez',
        'trainer-1',
        mockExercise,
        ['pain', 'injury'],
        'Dolor agudo en rodilla izquierda'
      );

      expect(ok).toBe(true);
      expect(mockFns.updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          excluded: ['ex-1'],
          favorites: [],
          pendingRequests: [
            expect.objectContaining({
              exerciseId: 'ex-1',
              type: 'exclude',
              status: 'pending',
              chatMessageId: 'msg-123',
            }),
          ],
        })
      );
    });
  });

  describe('acknowledgeExerciseRequest', () => {
    it('debe marcar una solicitud pendiente como acknowledged', async () => {
      mockFns.getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          pendingRequests: [
            {
              exerciseId: 'ex-1',
              exerciseName: 'Sentadilla',
              type: 'exclude',
              status: 'pending',
              requestedAt: null,
            },
          ],
        }),
      });
      mockFns.updateDoc.mockResolvedValueOnce(undefined);

      const ok = await acknowledgeExerciseRequest('user-1', 'ex-1');
      expect(ok).toBe(true);
      expect(mockFns.updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          pendingRequests: [
            expect.objectContaining({
              exerciseId: 'ex-1',
              status: 'acknowledged',
            }),
          ],
        })
      );
    });
  });
});
