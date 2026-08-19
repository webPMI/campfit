/**
 * Servicio para la gestión de propuestas de personalización de dietas y rutinas.
 * Permite a los alumnos proponer horarios, ejercicios y comidas, y a los entrenadores
 * revisarlas, asesorar y aprobarlas.
 *
 * @module shared/planProposalService
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/shared/logger';
import type {
  PlanProposal,
  PlanProposalType,
  PlanProposalStatus,
  PlanProposalSchedule,
} from '@/types';

export type {
  PlanProposal,
  PlanProposalType,
  PlanProposalStatus,
  PlanProposalSchedule,
};

export interface CreateProposalPayload {
  clientId: string;
  clientName?: string;
  trainerId: string;
  type: PlanProposalType;
  clientNotes?: string;
  proposedSchedule: PlanProposalSchedule;
  proposedData: Record<string, unknown>;
  originalPlanId?: string;
}

/**
 * Crea una nueva propuesta de plan personalizada enviada por el alumno.
 */
export async function createPlanProposal(payload: CreateProposalPayload): Promise<string | null> {
  if (!payload.clientId || !payload.trainerId) {
    logger.error('PlanProposalService', 'clientId y trainerId son requeridos para crear una propuesta');
    return null;
  }

  try {
    const docRef = await addDoc(collection(db, 'plan_proposals'), {
      ...payload,
      status: 'pending_review' as PlanProposalStatus,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    logger.info('PlanProposalService', `Propuesta creada: ${docRef.id} por cliente ${payload.clientId}`);
    return docRef.id;
  } catch (error) {
    logger.error('PlanProposalService', 'Error al crear propuesta de plan:', error);
    return null;
  }
}

/**
 * Escucha las propuestas asignadas a un entrenador.
 */
export function subscribeToTrainerProposals(
  trainerId: string,
  callback: (proposals: PlanProposal[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  if (!trainerId) {
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, 'plan_proposals'),
    where('trainerId', '==', trainerId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const proposals = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as PlanProposal));
      callback(proposals);
    },
    (error) => {
      logger.error('PlanProposalService', 'Error al escuchar propuestas del entrenador:', error);
      if (onError) onError(error);
      callback([]);
    }
  );
}

/**
 * Escucha las propuestas creadas por un alumno (cliente).
 */
export function subscribeToClientProposals(
  clientId: string,
  callback: (proposals: PlanProposal[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  if (!clientId) {
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, 'plan_proposals'),
    where('clientId', '==', clientId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const proposals = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as PlanProposal));
      callback(proposals);
    },
    (error) => {
      logger.error('PlanProposalService', 'Error al escuchar propuestas del cliente:', error);
      if (onError) onError(error);
      callback([]);
    }
  );
}

/**
 * Aprueba una propuesta de personalización y aplica los cambios a la rutina o dieta activa.
 */
export async function approvePlanProposal(
  proposalId: string,
  trainerId: string,
  feedback?: string,
  overriddenData?: Record<string, unknown>
): Promise<boolean> {
  if (!proposalId || !trainerId) return false;

  try {
    const proposalRef = doc(db, 'plan_proposals', proposalId);
    const proposalSnap = await getDoc(proposalRef);

    if (!proposalSnap.exists()) {
      logger.error('PlanProposalService', `Propuesta ${proposalId} no encontrada`);
      return false;
    }

    const proposal = proposalSnap.data() as PlanProposal;
    const finalData = overriddenData || proposal.proposedData || {};

    // 1. Aplicar a la colección correspondiente (workouts o diets)
    if (proposal.type === 'workout') {
      if (proposal.originalPlanId) {
        const workoutRef = doc(db, 'workouts', proposal.originalPlanId);
        await updateDoc(workoutRef, {
          ...finalData,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, 'workouts'), {
          ...finalData,
          clientId: proposal.clientId,
          trainerId: trainerId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } else if (proposal.type === 'diet') {
      if (proposal.originalPlanId) {
        const dietRef = doc(db, 'diets', proposal.originalPlanId);
        await updateDoc(dietRef, {
          ...finalData,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, 'diets'), {
          ...finalData,
          clientId: proposal.clientId,
          trainerId: trainerId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    }

    // 2. Marcar propuesta como aprobada
    await updateDoc(proposalRef, {
      status: 'approved' as PlanProposalStatus,
      trainerFeedback: feedback || 'Propuesta aprobada por tu entrenador.',
      reviewedAt: serverTimestamp(),
      reviewedBy: trainerId,
      updatedAt: serverTimestamp(),
    });

    logger.info('PlanProposalService', `Propuesta ${proposalId} aprobada por entrenador ${trainerId}`);
    return true;
  } catch (error) {
    logger.error('PlanProposalService', `Error al aprobar propuesta ${proposalId}:`, error);
    return false;
  }
}

/**
 * Solicita cambios o envía feedback asesorando al alumno sobre su propuesta.
 */
export async function requestChangesOnProposal(
  proposalId: string,
  trainerId: string,
  feedback: string
): Promise<boolean> {
  if (!proposalId || !feedback) return false;

  try {
    const proposalRef = doc(db, 'plan_proposals', proposalId);
    await updateDoc(proposalRef, {
      status: 'changes_requested' as PlanProposalStatus,
      trainerFeedback: feedback,
      reviewedAt: serverTimestamp(),
      reviewedBy: trainerId,
      updatedAt: serverTimestamp(),
    });

    logger.info('PlanProposalService', `Cambios solicitados en propuesta ${proposalId}`);
    return true;
  } catch (error) {
    logger.error('PlanProposalService', `Error al solicitar cambios en propuesta ${proposalId}:`, error);
    return false;
  }
}
