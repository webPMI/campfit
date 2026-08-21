/**
 * Servicio de Preferencias de Ejercicios del Alumno (Favoritos, Ratings, Exclusiones) — CampFit
 * Permite al alumno explorar el catálogo, marcar sus ejercicios favoritos, calificar ejercicios y solicitar
 * la exclusión de aquellos que le causen molestias o no desee realizar.
 *
 * @module client/exercisePreferencesService
 */

import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp, type Unsubscribe } from 'firebase/firestore';
import { logger } from '@/lib/shared/logger';
import { sendMessage } from '@/lib/trainer/trainerChat';
import type { UserExercisePreferences } from '@/types';
import type { ExerciseItem, ExclusionReason } from '@/lib/shared/exerciseLibrary';

export interface ExercisePreferences {
  favorites: string[];
  excluded: string[];
}

const LOCAL_STORAGE_KEY_PREFIX = 'cf_exercise_pref_';

function getLocalKey(uid: string): string {
  return `${LOCAL_STORAGE_KEY_PREFIX}${uid}`;
}

export function getCachedExercisePreferences(uid: string): ExercisePreferences {
  try {
    const raw = localStorage.getItem(getLocalKey(uid));
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
        excluded: Array.isArray(parsed.excluded) ? parsed.excluded : [],
      };
    }
  } catch {
    /* ignore */
  }
  return { favorites: [], excluded: [] };
}

export function setCachedExercisePreferences(uid: string, prefs: ExercisePreferences): void {
  try {
    localStorage.setItem(getLocalKey(uid), JSON.stringify(prefs));
  } catch {
    /* ignore */
  }
}

function checkDocExists(snap: any): boolean {
  if (!snap) return false;
  if (typeof snap.exists === 'function') return snap.exists();
  return !!snap.exists;
}

function getDocData(snap: any): any {
  if (!snap) return {};
  if (typeof snap.data === 'function') return snap.data() || {};
  return snap.data || {};
}

/**
 * 🔒 CRÍTICO: Suscripción reactiva a las preferencias de ejercicios del usuario en Firestore.
 */
export function subscribeToUserExercisePreferences(
  userId: string,
  callback: (prefs: UserExercisePreferences | null) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  if (!userId) {
    callback(null);
    return () => {};
  }

  const docRef = doc(db, 'user_exercise_prefs', userId);
  return onSnapshot(
    docRef,
    (snap) => {
      if (checkDocExists(snap)) {
        const data = getDocData(snap) as UserExercisePreferences;
        callback({ ...data, userId });
        setCachedExercisePreferences(userId, {
          favorites: data.favorites || [],
          excluded: data.excluded || [],
        });
      } else {
        const defaultPrefs: UserExercisePreferences = {
          userId,
          ratings: {},
          favorites: [],
          excluded: [],
          pendingRequests: [],
          updatedAt: null as any,
        };
        callback(defaultPrefs);
      }
    },
    (err) => {
      logger.error('ExercisePreferences', 'Error en suscripción de preferencias:', err);
      if (onError) onError(err);
      callback(null);
    },
  );
}

/**
 * 🔒 CRÍTICO: Obtiene las preferencias del usuario de Firestore con fallback por defecto.
 */
export async function getUserExercisePreferences(userId: string): Promise<UserExercisePreferences> {
  const defaultPrefs: UserExercisePreferences = {
    userId,
    ratings: {},
    favorites: [],
    excluded: [],
    pendingRequests: [],
    updatedAt: null as any,
  };

  if (!userId) return defaultPrefs;

  try {
    const docRef = doc(db, 'user_exercise_prefs', userId);
    const snap = await getDoc(docRef);
    if (checkDocExists(snap)) {
      return { ...(getDocData(snap) as UserExercisePreferences), userId };
    }
  } catch (err) {
    logger.warn('ExercisePreferences', 'Error obteniendo preferencias de Firestore:', err);
  }

  return defaultPrefs;
}

/**
 * 🔒 CRÍTICO: Califica un ejercicio (1-5 estrellas).
 */
export async function rateExercise(
  userId: string,
  exerciseId: string,
  rating: number,
): Promise<boolean> {
  try {
    if (rating < 1 || rating > 5) return false;
    const docRef = doc(db, 'user_exercise_prefs', userId);
    const snap = await getDoc(docRef);

    if (checkDocExists(snap)) {
      const data = getDocData(snap);
      const currentRatings = data.ratings || {};
      await updateDoc(docRef, {
        ratings: { ...currentRatings, [exerciseId]: rating },
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(docRef, {
        userId,
        ratings: { [exerciseId]: rating },
        favorites: [],
        excluded: [],
        updatedAt: serverTimestamp(),
      });
    }
    return true;
  } catch (err) {
    logger.error('ExercisePreferences', 'Error calificando ejercicio:', err);
    return false;
  }
}

/**
 * 🔒 CRÍTICO: Alterna el estado de Favorito (⭐) de un ejercicio.
 */
export async function toggleFavorite(
  userId: string,
  exerciseId: string,
  currentFavorites?: string[],
): Promise<boolean> {
  try {
    const docRef = doc(db, 'user_exercise_prefs', userId);
    let favs: string[] = currentFavorites ? [...currentFavorites] : [];
    let docExists = !!currentFavorites;

    if (!currentFavorites) {
      const snap = await getDoc(docRef);
      docExists = checkDocExists(snap);
      if (docExists) {
        favs = getDocData(snap).favorites || [];
      }
    }

    const isFav = favs.includes(exerciseId);
    const newFavorites = isFav
      ? favs.filter((id) => id !== exerciseId)
      : [...favs, exerciseId];

    if (docExists) {
      await updateDoc(docRef, {
        favorites: newFavorites,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(docRef, {
        userId,
        favorites: newFavorites,
        excluded: [],
        ratings: {},
        updatedAt: serverTimestamp(),
      });
    }
    return true;
  } catch (err) {
    logger.error('ExercisePreferences', 'Error alternando favorito:', err);
    return false;
  }
}

/**
 * 🔒 CRÍTICO: Solicita la exclusión de un ejercicio notificando opcionalmente al entrenador.
 */
export async function requestExerciseExclusion(
  userId: string,
  clientName: string,
  trainerId: string | undefined,
  exercise: ExerciseItem,
  reasons: ExclusionReason[],
  notes: string = '',
): Promise<boolean> {
  try {
    const docRef = doc(db, 'user_exercise_prefs', userId);
    const snap = await getDoc(docRef);
    const data = checkDocExists(snap) ? getDocData(snap) : { favorites: [], excluded: [], pendingRequests: [] };

    let chatMsgId: string | undefined;
    if (trainerId) {
      const reasonLabels = reasons.join(', ');
      const msg = `🚫 Solicitud de exclusión para "${exercise.translations?.es || exercise.id}". Alumno: ${clientName || 'Cliente'}. Motivo: ${reasonLabels}. ${notes ? `Notas: ${notes}` : ''}`;
      const sent = await sendMessage(userId, trainerId, msg, 'alert').catch(() => null);
      if (sent) chatMsgId = sent;
    }

    const newRequest = {
      exerciseId: exercise.id,
      exerciseName: exercise.translations?.es || exercise.id,
      reasons,
      notes,
      type: 'exclude',
      status: 'pending',
      requestedAt: serverTimestamp(),
      ...(chatMsgId ? { chatMessageId: chatMsgId } : {}),
    };

    const currentExcluded = data.excluded || [];
    const currentFavorites = data.favorites || [];
    const currentPending = data.pendingRequests || [];

    const newExcluded = currentExcluded.includes(exercise.id) ? currentExcluded : [...currentExcluded, exercise.id];
    const newFavorites = currentFavorites.filter((id: string) => id !== exercise.id);
    const newPending = [...currentPending, newRequest];

    if (checkDocExists(snap)) {
      await updateDoc(docRef, {
        excluded: newExcluded,
        favorites: newFavorites,
        pendingRequests: newPending,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(docRef, {
        userId,
        excluded: newExcluded,
        favorites: newFavorites,
        pendingRequests: newPending,
        updatedAt: serverTimestamp(),
      });
    }

    return true;
  } catch (err) {
    logger.error('ExercisePreferences', 'Error solicitando exclusión:', err);
    return false;
  }
}

/**
 * 🔒 CRÍTICO: Confirma o gestiona una solicitud de exclusión por parte del entrenador.
 */
export async function acknowledgeExerciseRequest(
  userId: string,
  exerciseId: string,
  status: string = 'acknowledged',
): Promise<boolean> {
  try {
    const docRef = doc(db, 'user_exercise_prefs', userId);
    const snap = await getDoc(docRef);
    if (!checkDocExists(snap)) return false;

    const data = getDocData(snap);
    const currentPending = data.pendingRequests || [];

    const updatedPending = currentPending.map((req: any) => {
      if (req.exerciseId === exerciseId) {
        return { ...req, status };
      }
      return req;
    });

    await updateDoc(docRef, {
      pendingRequests: updatedPending,
      updatedAt: serverTimestamp(),
    });

    return true;
  } catch (err) {
    logger.error('ExercisePreferences', 'Error confirmando solicitud de exclusión:', err);
    return false;
  }
}

// Helpers adicionales para el explorador autónomo
export async function loadExercisePreferences(uid: string): Promise<ExercisePreferences> {
  const prefs = await getUserExercisePreferences(uid);
  return {
    favorites: prefs.favorites || [],
    excluded: prefs.excluded || [],
  };
}

export async function toggleFavoriteExercise(
  uid: string,
  exerciseId: string,
): Promise<{ favorites: string[]; excluded: string[]; isFavorite: boolean }> {
  const current = await getUserExercisePreferences(uid);
  const wasFav = (current.favorites || []).includes(exerciseId);
  await toggleFavorite(uid, exerciseId, current.favorites || []);
  const newFavs = wasFav ? (current.favorites || []).filter((id) => id !== exerciseId) : [...(current.favorites || []), exerciseId];
  return { favorites: newFavs, excluded: current.excluded || [], isFavorite: !wasFav };
}

export async function toggleExcludeExercise(
  uid: string,
  exerciseId: string,
): Promise<{ favorites: string[]; excluded: string[]; isExcluded: boolean }> {
  const current = await getUserExercisePreferences(uid);
  const wasExcluded = (current.excluded || []).includes(exerciseId);
  const docRef = doc(db, 'user_exercise_prefs', uid);

  let newExcluded = [...(current.excluded || [])];
  if (wasExcluded) {
    newExcluded = newExcluded.filter((id) => id !== exerciseId);
  } else {
    newExcluded.push(exerciseId);
  }

  await setDoc(
    docRef,
    {
      userId: uid,
      excluded: newExcluded,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  return { favorites: current.favorites || [], excluded: newExcluded, isExcluded: !wasExcluded };
}
