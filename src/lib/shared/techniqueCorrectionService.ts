/**
 * Servicio de Corrección de Técnica y Vídeo Feedback bidireccional
 * Conecta clientes y entrenadores a través de Cloudflare R2 y Firestore.
 *
 * @module techniqueCorrectionService
 */

import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { uploadFileToR2, validateMediaFile } from '@/lib/storage/r2Service';
import { logger } from '@/lib/shared/logger';

export interface ExerciseCorrection {
  id: string;
  clientId: string;
  clientName: string;
  trainerId: string;
  workoutId: string;
  workoutName: string;
  exerciseId: string;
  exerciseName: string;
  videoUrl: string;
  clientNotes?: string;
  trainerFeedback?: string;
  status: 'pending' | 'reviewed';
  createdAt?: unknown;
  reviewedAt?: unknown;
  storageProvider?: 'cloudflare_r2' | 'local_preview';
}

export interface SubmitTechniquePayload {
  clientId: string;
  clientName: string;
  trainerId: string;
  workoutId: string;
  workoutName: string;
  exerciseId: string;
  exerciseName: string;
  file: File;
  notes?: string;
}

/**
 * Sube un vídeo de ejecución técnica a Cloudflare R2 y crea una solicitud de corrección.
 */
export async function submitTechniqueVideo(
  payload: SubmitTechniquePayload
): Promise<ExerciseCorrection> {
  const { clientId, clientName, trainerId, workoutId, workoutName, exerciseId, exerciseName, file, notes } = payload;

  const validation = validateMediaFile(file, 100);
  if (!validation.valid) {
    throw new Error(validation.message || 'El formato del vídeo no es válido o supera el límite.');
  }

  console.log('🎥 [TechniqueCorrection] Procesando subida de vídeo de técnica:', {
    alumno: clientName,
    ejercicio: exerciseName,
    archivo: file.name,
    tamaño: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
  });

  // 1. Subir archivo
  const timestamp = Date.now();
  const ext = file.name.split('.').pop() || 'mp4';
  const objectKey = `technique-feedback/${clientId}/${exerciseId}_${timestamp}.${ext}`;

  const uploadResult = await uploadFileToR2(file, {
    folder: 'chat',
    entityId: clientId,
    key: objectKey,
  });

  console.log('📁 [TechniqueCorrection] URL obtenida:', uploadResult.url);

  // 2. Guardar en Firestore `exercise_corrections`
  const correctionData = {
    clientId,
    clientName: clientName || 'Alumno',
    trainerId,
    workoutId,
    workoutName: workoutName || 'Rutina',
    exerciseId,
    exerciseName: exerciseName || 'Ejercicio',
    videoUrl: uploadResult.url,
    clientNotes: notes || '',
    trainerFeedback: '',
    status: 'pending' as const,
    storageProvider: (uploadResult.provider === 'cloudflare_r2' ? 'cloudflare_r2' : 'local_preview') as 'cloudflare_r2' | 'local_preview',
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, 'exercise_corrections'), correctionData);
  const docId = docRef?.id || `corr-${timestamp}`;
  console.log('💾 [TechniqueCorrection] Documento Firestore creado:', docId);
  logger.info('TechniqueCorrection', `Solicitud de corrección enviada: ${docId} para ${exerciseName}`);

  return {
    id: docId,
    ...correctionData,
  };
}

/**
 * Suscribe al entrenador a todas las solicitudes de corrección de técnica recibidas.
 */
export function subscribeToCorrectionsByTrainer(
  trainerId: string,
  callback: (corrections: ExerciseCorrection[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'exercise_corrections'),
    where('trainerId', '==', trainerId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: ExerciseCorrection[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ExerciseCorrection, 'id'>),
      }));
      callback(list);
    },
    (err) => {
      logger.error('TechniqueCorrection', 'Error al suscribirse a correcciones de entrenador:', err);
    }
  );
}

/**
 * Suscribe al cliente a sus solicitudes de corrección enviadas para ver el feedback del coach.
 */
export function subscribeToCorrectionsByClient(
  clientId: string,
  callback: (corrections: ExerciseCorrection[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'exercise_corrections'),
    where('clientId', '==', clientId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: ExerciseCorrection[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ExerciseCorrection, 'id'>),
      }));
      callback(list);
    },
    (err) => {
      logger.error('TechniqueCorrection', 'Error al suscribirse a correcciones de cliente:', err);
    }
  );
}

/**
 * El entrenador responde y guarda el feedback técnico.
 */
export async function reviewTechniqueCorrection(
  correctionId: string,
  trainerFeedback: string
): Promise<void> {
  if (!correctionId) throw new Error('ID de corrección requerido');

  await updateDoc(doc(db, 'exercise_corrections', correctionId), {
    trainerFeedback: trainerFeedback.trim(),
    status: 'reviewed',
    reviewedAt: serverTimestamp(),
  });

  logger.info('TechniqueCorrection', `Corrección ${correctionId} revisada con éxito`);
}

/**
 * Elimina una corrección de técnica.
 */
export async function deleteTechniqueCorrection(correctionId: string): Promise<void> {
  if (!correctionId) throw new Error('ID de corrección requerido');
  await deleteDoc(doc(db, 'exercise_corrections', correctionId));
  logger.info('TechniqueCorrection', `Corrección ${correctionId} eliminada`);
}
