/**
 * Servicio de Preferencias y Solicitudes de Ejercicios del Cliente.
 *
 * Administra la colección `user_exercise_prefs/{userId}`:
 * - Calificación 1-5 estrellas (ratings)
 * - Lista de favoritos (favorites)
 * - Lista de exclusiones (excluded)
 * - Cola de solicitudes de exclusión/cambio con notificación al entrenador
 *
 * @module client/exercisePreferencesService
 */

import { db } from '@/lib/firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { logger } from '@/lib/shared/logger';
import type {
  UserExercisePreferences,
  ExerciseRequest,
} from '@/types';
import type { ExclusionReason, ExerciseItem } from '@/lib/shared/exerciseLibrary';
import { getExerciseName } from '@/lib/shared/exerciseLibrary';
import { sendMessage } from '@/lib/trainer/trainerChat';

const COLLECTION_NAME = 'user_exercise_prefs';

/**
 * Suscripción reactiva a las preferencias de ejercicios de un usuario.
 */
export function subscribeToUserExercisePreferences(
  userId: string,
  callback: (prefs: UserExercisePreferences | null) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  if (!userId) {
    callback(null);
    return () => {};
  }

  const docRef = doc(db, COLLECTION_NAME, userId);

  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        callback({
          userId,
          ratings: data.ratings || {},
          favorites: data.favorites || [],
          excluded: data.excluded || [],
          pendingRequests: data.pendingRequests || [],
          updatedAt: data.updatedAt || null,
        } as UserExercisePreferences);
      } else {
        callback({
          userId,
          ratings: {},
          favorites: [],
          excluded: [],
          pendingRequests: [],
          updatedAt: null,
        });
      }
    },
    (err) => {
      logger.error('exercisePreferencesService', 'Error al suscribirse a preferencias de ejercicios:', err);
      onError?.(err);
      callback(null);
    }
  );
}

/**
 * Obtiene las preferencias de un usuario una sola vez.
 */
export async function getUserExercisePreferences(
  userId: string
): Promise<UserExercisePreferences> {
  if (!userId) {
    return { userId: '', ratings: {}, favorites: [], excluded: [], pendingRequests: [], updatedAt: null };
  }

  try {
    const snap = await getDoc(doc(db, COLLECTION_NAME, userId));
    if (snap.exists()) {
      const data = snap.data();
      return {
        userId,
        ratings: data.ratings || {},
        favorites: data.favorites || [],
        excluded: data.excluded || [],
        pendingRequests: data.pendingRequests || [],
        updatedAt: data.updatedAt || null,
      } as UserExercisePreferences;
    }
  } catch (err) {
    logger.error('exercisePreferencesService', 'Error obteniendo preferencias:', err);
  }

  return { userId, ratings: {}, favorites: [], excluded: [], pendingRequests: [], updatedAt: null };
}

/**
 * Califica un ejercicio (1 a 5 estrellas).
 */
export async function rateExercise(
  userId: string,
  exerciseId: string,
  rating: 1 | 2 | 3 | 4 | 5
): Promise<boolean> {
  if (!userId || !exerciseId) return false;

  try {
    const docRef = doc(db, COLLECTION_NAME, userId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      await updateDoc(docRef, {
        [`ratings.${exerciseId}`]: rating,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(docRef, {
        userId,
        ratings: { [exerciseId]: rating },
        favorites: rating >= 4 ? [exerciseId] : [],
        excluded: [],
        pendingRequests: [],
        updatedAt: serverTimestamp(),
      });
    }
    return true;
  } catch (err) {
    logger.error('exercisePreferencesService', 'Error guardando calificación:', err);
    return false;
  }
}

/**
 * Alterna el estado de favorito de un ejercicio.
 */
export async function toggleFavorite(
  userId: string,
  exerciseId: string
): Promise<boolean> {
  if (!userId || !exerciseId) return false;

  try {
    const current = await getUserExercisePreferences(userId);
    const isFav = current.favorites.includes(exerciseId);
    const newFavorites = isFav
      ? current.favorites.filter((id) => id !== exerciseId)
      : [...current.favorites, exerciseId];

    const docRef = doc(db, COLLECTION_NAME, userId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      await updateDoc(docRef, {
        favorites: newFavorites,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(docRef, {
        userId,
        ratings: {},
        favorites: newFavorites,
        excluded: [],
        pendingRequests: [],
        updatedAt: serverTimestamp(),
      });
    }
    return true;
  } catch (err) {
    logger.error('exercisePreferencesService', 'Error alternando favorito:', err);
    return false;
  }
}

/**
 * Solicita la exclusión de un ejercicio con motivos y envía un mensaje de alerta/notificación al entrenador si existe.
 */
export async function requestExerciseExclusion(
  userId: string,
  clientName: string,
  trainerId: string | undefined,
  exercise: ExerciseItem,
  quickReasons: ExclusionReason[] = [],
  customReason = ''
): Promise<boolean> {
  if (!userId || !exercise) return false;

  try {
    const exerciseNameEs = getExerciseName(exercise, 'es');
    const exerciseNameEn = getExerciseName(exercise, 'en');

    const newRequest: ExerciseRequest = {
      exerciseId: exercise.id,
      exerciseName: exerciseNameEs,
      exerciseNameEn,
      type: 'exclude',
      quickReasons,
      customReason: customReason.trim(),
      status: 'pending',
      requestedAt: serverTimestamp(),
    };

    // 1. Si hay entrenador asignado, generar un mensaje en el chat
    if (trainerId) {
      const reasonTexts = quickReasons.join(', ');
      const content = `🚫 [Solicitud de Exclusión] ${clientName} ha solicitado excluir el ejercicio "${exerciseNameEs}". Motivos: ${reasonTexts || 'No especificado'}${customReason ? ` (${customReason})` : ''}.`;
      try {
        const msgId = await sendMessage(userId, trainerId, content, 'alert');
        if (msgId) {
          newRequest.chatMessageId = msgId;
        }
      } catch (chatErr) {
        logger.error('exercisePreferencesService', 'Error enviando mensaje de chat para exclusión:', chatErr);
      }
    }

    // 2. Guardar en user_exercise_prefs
    const current = await getUserExercisePreferences(userId);
    const newExcluded = current.excluded.includes(exercise.id)
      ? current.excluded
      : [...current.excluded, exercise.id];

    // Quitar de favoritos si estaba
    const newFavorites = current.favorites.filter((id) => id !== exercise.id);

    const docRef = doc(db, COLLECTION_NAME, userId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      await updateDoc(docRef, {
        excluded: newExcluded,
        favorites: newFavorites,
        pendingRequests: [...current.pendingRequests, newRequest],
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(docRef, {
        userId,
        ratings: {},
        favorites: newFavorites,
        excluded: newExcluded,
        pendingRequests: [newRequest],
        updatedAt: serverTimestamp(),
      });
    }

    return true;
  } catch (err) {
    logger.error('exercisePreferencesService', 'Error solicitando exclusión:', err);
    return false;
  }
}

/**
 * Marca una solicitud de ejercicio como confirmada/vista por el entrenador.
 */
export async function acknowledgeExerciseRequest(
  userId: string,
  exerciseId: string
): Promise<boolean> {
  if (!userId || !exerciseId) return false;

  try {
    const current = await getUserExercisePreferences(userId);
    const updatedRequests = current.pendingRequests.map((req) => {
      if (req.exerciseId === exerciseId && req.status === 'pending') {
        return {
          ...req,
          status: 'acknowledged' as const,
          acknowledgedAt: serverTimestamp(),
        };
      }
      return req;
    });

    const docRef = doc(db, COLLECTION_NAME, userId);
    await updateDoc(docRef, {
      pendingRequests: updatedRequests,
      updatedAt: serverTimestamp(),
    });

    return true;
  } catch (err) {
    logger.error('exercisePreferencesService', 'Error confirmando solicitud de ejercicio:', err);
    return false;
  }
}
