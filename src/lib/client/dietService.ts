import { collection, query, where, orderBy, limit, onSnapshot, addDoc, serverTimestamp, type Timestamp } from 'firebase/firestore';
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
    return () => {};
  }

  const q = query(
    collection(db, 'diets'),
    where('clientId', '==', clientId),
    orderBy('createdAt', 'desc'),
    limit(1)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Diet)));
    },
    (error) => {
      logger.error('Diet', 'Error al suscribirse a dietas:', error);
      if (onError) onError(error);
      callback([]);
    }
  );
}

/**
 * Se suscribe a TODAS las dietas de un cliente (historial completo).
 * Útil para la vista de historial del cliente.
 */
export function subscribeToDietHistory(
  clientId: string,
  callback: (diets: Diet[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  if (!clientId) {
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, 'diets'),
    where('clientId', '==', clientId),
    orderBy('createdAt', 'desc'),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Diet)));
    },
    (error) => {
      logger.error('Diet', 'Error al suscribirse a historial de dietas:', error);
      if (onError) onError(error);
      callback([]);
    }
  );
}

/**
 * Registra una comida como completada en progress_logs.
 * Esto permite llevar un seguimiento real de adherencia.
 * @returns ID del documento creado, o null si hay error de validación
 * @throws Error si hay un error de Firestore (para que el caller pueda manejarlo)
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
    return () => {};
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
