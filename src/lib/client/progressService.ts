import { collection, query, where, orderBy, limit, onSnapshot, addDoc, serverTimestamp, type Timestamp } from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/shared/logger';

export interface BodyMeasurements {
  chest?: number;
  waist?: number;
  hips?: number;
  leftArm?: number;
  rightArm?: number;
  leftThigh?: number;
  rightThigh?: number;
  calves?: number;
  notes?: string;
}

export interface BodyComposition {
  bodyFat?: number;
  muscleMass?: number;
  waterPercent?: number;
  visceralFat?: number;
  ffmi?: number;
  notes?: string;
}

export interface BioFeedback {
  sleepHours?: number;
  sleepQuality?: number;
  energyLevel?: number;
  stressLevel?: number;
  doms?: 'none' | 'mild' | 'moderate' | 'severe';
  waterLitres?: number;
  notes?: string;
}

export interface ProgressLog {
  id: string;
  clientId: string;
  type: 'workout' | 'meal' | 'weight' | 'photo' | 'checklist' | 'measurements' | 'body_composition' | 'biofeedback';
  date: Timestamp | Date;
  value: Record<string, unknown>;
  createdAt: Timestamp;
}

export function subscribeToProgress(
  clientId: string,
  type: 'weight' | 'photo' | 'checklist' | 'measurements' | 'body_composition' | 'biofeedback',
  callback: (logs: ProgressLog[]) => void,
  limitCount: number = 30,
  onError?: (error: Error) => void
): Unsubscribe {
  if (!clientId) {
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, 'progress_logs'),
    where('clientId', '==', clientId),
    where('type', '==', type),
    orderBy('date', 'desc'),
    limit(limitCount)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProgressLog)));
    },
    (error) => {
      logger.error('Progress', 'Error al suscribirse a progreso:', error);
      if (onError) onError(error);
      callback([]);
    }
  );
}

export function calculateFFMI(weightKg: number, bodyFatPercent: number, heightCm: number): { ffmi: number; leanMassKg: number; fatMassKg: number } | null {
  if (!weightKg || weightKg <= 0 || !heightCm || heightCm <= 0 || bodyFatPercent == null || bodyFatPercent < 0 || bodyFatPercent > 70) {
    return null;
  }
  const heightM = heightCm / 100;
  const fatMassKg = weightKg * (bodyFatPercent / 100);
  const leanMassKg = weightKg - fatMassKg;
  const rawFFMI = leanMassKg / (heightM * heightM);
  // Normalized FFMI for height standard (normalized to 1.80m)
  const normalizedFFMI = rawFFMI + 6.1 * (1.8 - heightM);
  return {
    ffmi: Math.round(normalizedFFMI * 10) / 10,
    leanMassKg: Math.round(leanMassKg * 10) / 10,
    fatMassKg: Math.round(fatMassKg * 10) / 10,
  };
}

export async function registerWeight(clientId: string, weight: number, notes?: string) {
  if (!clientId || weight == null || weight <= 0) {
    throw new Error('clientId y weight (positivo) son requeridos');
  }

  return addDoc(collection(db, 'progress_logs'), {
    clientId,
    type: 'weight',
    date: new Date(),
    value: { weight, notes: notes?.trim() || '' },
    createdAt: serverTimestamp(),
  });
}

/**
 * Registra una foto de evolución corporal subida (almacenada en Cloudflare R2 o previsualización).
 */
export async function registerProgressPhoto(
  clientId: string,
  photoUrl: string,
  angle: 'front' | 'side' | 'back',
  notes?: string
) {
  if (!clientId || !photoUrl) {
    throw new Error('clientId y photoUrl son requeridos');
  }

  return addDoc(collection(db, 'progress_logs'), {
    clientId,
    type: 'photo',
    date: new Date(),
    value: {
      photoUrl,
      angle,
      notes: notes?.trim() || '',
      storageProvider: 'cloudflare_r2',
    },
    createdAt: serverTimestamp(),
  });
}

/**
 * Registra el resultado del checklist diario de hábitos y estado de ánimo del cliente.
 */
export async function registerDailyChecklist(
  clientId: string,
  checklist: {
    waterMet: boolean;
    dietMet: boolean;
    workoutMet: boolean;
    sleepHours: number;
    stepsCount: number;
    mood: 'excellent' | 'good' | 'neutral' | 'tired';
    notes?: string;
  }
) {
  if (!clientId) {
    throw new Error('clientId es requerido');
  }

  return addDoc(collection(db, 'progress_logs'), {
    clientId,
    type: 'checklist',
    date: new Date(),
    value: checklist,
    createdAt: serverTimestamp(),
  });
}

/**
 * Elimina un registro o foto de evolución de Firestore.
 */
export async function deleteProgressLog(logId: string): Promise<boolean> {
  if (!logId) return false;
  try {
    const { doc, deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'progress_logs', logId));
    logger.info('Progress', `Log de progreso eliminado: ${logId}`);
    return true;
  } catch (error) {
    logger.error('Progress', `Error al eliminar log ${logId}:`, error);
    throw error;
  }
}

/**
 * 🔒 CRÍTICO: Actualiza un registro de peso existente en Firestore.
 */
export async function updateWeightLog(
  logId: string,
  newWeight: number,
  newNotes?: string,
  newDate?: Date
): Promise<boolean> {
  if (!logId || newWeight == null || newWeight <= 0) {
    throw new Error('logId y newWeight válido son requeridos');
  }
  try {
    const { doc, updateDoc } = await import('firebase/firestore');
    const updateData: Record<string, unknown> = {
      'value.weight': newWeight,
      'value.notes': newNotes?.trim() || '',
      updatedAt: serverTimestamp(),
    };
    if (newDate) {
      updateData.date = newDate;
    }
    await updateDoc(doc(db, 'progress_logs', logId), updateData);
    logger.info('Progress', `Log de peso actualizado: ${logId}`);
    return true;
  } catch (error) {
    logger.error('Progress', `Error al actualizar log ${logId}:`, error);
    throw error;
  }
}

/**
 * 🔒 CRÍTICO: Registra perímetros antropométricos corporales.
 */
export async function registerMeasurements(
  clientId: string,
  measurements: BodyMeasurements,
  date: Date = new Date()
) {
  if (!clientId) throw new Error('clientId es requerido');

  return addDoc(collection(db, 'progress_logs'), {
    clientId,
    type: 'measurements',
    date,
    value: measurements,
    createdAt: serverTimestamp(),
  });
}

/**
 * 🔒 CRÍTICO: Actualiza un registro antropométrico existente.
 */
export async function updateMeasurementsLog(
  logId: string,
  measurements: BodyMeasurements,
  date?: Date
): Promise<boolean> {
  if (!logId) throw new Error('logId es requerido');
  try {
    const { doc, updateDoc } = await import('firebase/firestore');
    const updateData: Record<string, unknown> = {
      value: measurements,
      updatedAt: serverTimestamp(),
    };
    if (date) updateData.date = date;
    await updateDoc(doc(db, 'progress_logs', logId), updateData);
    logger.info('Progress', `Medidas antropométricas actualizadas: ${logId}`);
    return true;
  } catch (error) {
    logger.error('Progress', `Error al actualizar medidas ${logId}:`, error);
    throw error;
  }
}

/**
 * 🔒 CRÍTICO: Registra composición corporal y bioimpedancia (% Grasa, Masa Magra, FFMI).
 */
export async function registerBodyComposition(
  clientId: string,
  comp: BodyComposition,
  date: Date = new Date()
) {
  if (!clientId) throw new Error('clientId es requerido');

  return addDoc(collection(db, 'progress_logs'), {
    clientId,
    type: 'body_composition',
    date,
    value: comp,
    createdAt: serverTimestamp(),
  });
}

/**
 * 🔒 CRÍTICO: Actualiza un registro de composición corporal existente.
 */
export async function updateBodyCompositionLog(
  logId: string,
  comp: BodyComposition,
  date?: Date
): Promise<boolean> {
  if (!logId) throw new Error('logId es requerido');
  try {
    const { doc, updateDoc } = await import('firebase/firestore');
    const updateData: Record<string, unknown> = {
      value: comp,
      updatedAt: serverTimestamp(),
    };
    if (date) updateData.date = date;
    await updateDoc(doc(db, 'progress_logs', logId), updateData);
    logger.info('Progress', `Composición corporal actualizada: ${logId}`);
    return true;
  } catch (error) {
    logger.error('Progress', `Error al actualizar composición corporal ${logId}:`, error);
    throw error;
  }
}

/**
 * 🔒 CRÍTICO: Registra el bio-feedback diario del atleta (Sueño, Energía, Estrés, Agujetas).
 */
export async function registerBioFeedback(
  clientId: string,
  feedback: BioFeedback,
  date: Date = new Date()
) {
  if (!clientId) throw new Error('clientId es requerido');

  return addDoc(collection(db, 'progress_logs'), {
    clientId,
    type: 'biofeedback',
    date,
    value: feedback,
    createdAt: serverTimestamp(),
  });
}

/**
 * 🔒 CRÍTICO: Actualiza un registro de bio-feedback existente.
 */
export async function updateBioFeedbackLog(
  logId: string,
  feedback: BioFeedback,
  date?: Date
): Promise<boolean> {
  if (!logId) throw new Error('logId es requerido');
  try {
    const { doc, updateDoc } = await import('firebase/firestore');
    const updateData: Record<string, unknown> = {
      value: feedback,
      updatedAt: serverTimestamp(),
    };
    if (date) updateData.date = date;
    await updateDoc(doc(db, 'progress_logs', logId), updateData);
    logger.info('Progress', `Bio-feedback diario actualizado: ${logId}`);
    return true;
  } catch (error) {
    logger.error('Progress', `Error al actualizar bio-feedback ${logId}:`, error);
    throw error;
  }
}
