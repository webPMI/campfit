import { collection, query, where, orderBy, limit, startAfter, onSnapshot, addDoc, serverTimestamp, type Timestamp } from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/shared/logger';

export interface Meal {
  id: string;
  name: 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'other';
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  order: number;
}

export interface Diet {
  id: string;
  clientId: string;
  trainerId: string;
  name: string;
  type: 'normal' | 'advanced';
  somatotype?: 'ectomorph' | 'mesomorph' | 'endomorph';
  totalCalories: number;
  meals: Meal[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Se suscribe a la dieta más reciente de un cliente.
 * Útil para la vista principal del cliente (solo necesita la última).
 */
export function subscribeToDiets(
  clientId: string,
  callback: (diets: Diet[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  if (!clientId) {
    callback([]);
    return () => { };
  }

  const q = query(
    collection(db, 'diets'),
    where('clientId', '==', clientId),
    orderBy('createdAt', 'desc'),
    limit(1)
  );

  let fallbackUnsub: Unsubscribe | null = null;

  const unsub = onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Diet)));
    },
    (error) => {
      logger.error('Diet', 'Error al suscribirse a dietas (intentando fallback sin orderBy):', error);
      if (onError) onError(error);
      callback([]);
      try {
        const fallbackQ = query(
          collection(db, 'diets'),
          where('clientId', '==', clientId)
        );
        fallbackUnsub = onSnapshot(
          fallbackQ,
          (snapshot) => {
            const diets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Diet));
            diets.sort((a, b) => {
              const tA = (a.createdAt as any)?.toMillis ? (a.createdAt as any).toMillis() : 0;
              const tB = (b.createdAt as any)?.toMillis ? (b.createdAt as any).toMillis() : 0;
              return tB - tA;
            });
            callback(diets.slice(0, 1));
          },
          () => { }
        );
      } catch (e) {
        // Safe fallback catch
      }
    }
  );

  return () => {
    unsub();
    fallbackUnsub?.();
  };
}

/**
 * Se suscribe a las dietas de un cliente (historial).
 * Útil para la vista de historial del cliente.
 */
export function subscribeToDietHistory(
  clientId: string,
  callback: (diets: Diet[]) => void,
  optionsOrOnError?: { limit?: number; startAfter?: any } | ((error: Error) => void),
  onError?: (error: Error) => void
): Unsubscribe {
  if (!clientId) {
    callback([]);
    return () => { };
  }

  let options: { limit?: number; startAfter?: any } | undefined;
  let errCb = onError;

  if (typeof optionsOrOnError === 'function') {
    errCb = optionsOrOnError;
  } else if (optionsOrOnError) {
    options = optionsOrOnError;
  }

  const constraints: any[] = [
    where('clientId', '==', clientId),
    orderBy('createdAt', 'desc'),
  ];

  if (options?.startAfter) {
    constraints.push(startAfter(options.startAfter));
  }

  if (options?.limit) {
    constraints.push(limit(Math.min(options.limit, 100)));
  } else {
    constraints.push(limit(100));
  }

  const q = query(collection(db, 'diets'), ...constraints);
  let fallbackUnsub: Unsubscribe | null = null;

  const unsub = onSnapshot(
    q,
    (snapshot) => {
      try {
        callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Diet)));
      } catch (err) {
        logger.error('Diet', 'Error procesando snapshot de historial de dietas:', err);
        if (errCb) errCb(err instanceof Error ? err : new Error(String(err)));
      }
    },
    (error) => {
      logger.error('Diet', 'Error al suscribirse a historial de dietas (fallback sin orderBy):', error);
      if (errCb) errCb(error);
      callback([]);
      try {
        const fallbackQ = query(collection(db, 'diets'), where('clientId', '==', clientId));
        fallbackUnsub = onSnapshot(
          fallbackQ,
          (snapshot) => {
            const diets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Diet));
            diets.sort((a, b) => {
              const tA = (a.createdAt as any)?.toMillis ? (a.createdAt as any).toMillis() : 0;
              const tB = (b.createdAt as any)?.toMillis ? (b.createdAt as any).toMillis() : 0;
              return tB - tA;
            });
            callback(diets);
          },
          () => { }
        );
      } catch (e) {
        // Safe fallback catch
      }
    }
  );

  return () => {
    unsub();
    fallbackUnsub?.();
  };
}

/**
 * Registra una comida como completada en progress_logs.
 * Permite llevar un seguimiento real de adherencia.
 * @returns ID del documento creado, o null si hay error de validación
 */
export async function registerMealComplete(
  clientId: string,
  dietId: string,
  mealId: string,
  mealName: string,
): Promise<{ id: string } | null> {
  if (!clientId || !dietId || !mealId) {
    logger.error('Diet', 'Faltan datos para registrar comida completada');
    return null;
  }

  try {
    const docRef = await addDoc(collection(db, 'progress_logs'), {
      clientId,
      dietId,
      mealId,
      type: 'meal',
      date: new Date(),
      value: {
        mealName,
        completed: true,
        completedAt: new Date().toISOString(),
      },
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id };
  } catch (error) {
    logger.error('Diet', 'Error al registrar comida completada:', error);
    throw error; // Propagar el error para que el caller pueda manejarlo
  }
}

/**
 * Obtiene las comidas completadas hoy para un cliente.
 * Se usa para calcular adherencia diaria.
 * Normaliza las fechas a UTC para evitar problemas de zona horaria.
 */
export function subscribeToTodayMeals(
  clientId: string,
  callback: (completedMealIds: string[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  if (!clientId) {
    callback([]);
    return () => { };
  }

  // Normalizar a UTC para evitar race conditions con zonas horarias
  const now = new Date();
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
  const todayEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

  const q = query(
    collection(db, 'progress_logs'),
    where('clientId', '==', clientId),
    where('type', '==', 'meal'),
    where('date', '>=', todayStart),
    where('date', '<=', todayEnd),
    orderBy('date', 'desc'),
    limit(50) // Limitar a 50 comidas por día (suficiente para cualquier dieta)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const completedIds = snapshot.docs
        .filter(doc => doc.data()?.value?.completed === true)
        .map(doc => doc.data()?.mealId)
        .filter(Boolean) as string[];
      callback(completedIds);
    },
    (error) => {
      logger.error('Diet', 'Error al suscribirse a comidas de hoy:', error);
      if (onError) onError(error);
      callback([]);
    }
  );
}
