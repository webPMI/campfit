/**
 * Módulo de servicio para la gestión del flujo de Onboarding del cliente.
 * Encapsula la estructura de datos del perfil inicial y la persistencia en Firestore.
 *
 * @module client/onboardingService
 */

import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { logger } from '@/lib/shared/logger';

/** Estructura de datos recopilados durante el onboarding */
export interface OnboardingData {
  birthdate?: string | null;
  height?: number | null;
  initialWeight?: number | null;
  experience?: string | null;
  goals?: string[] | null;
  conditions?: string | null;
  medications?: string | null;
  allergies?: string | null;
  injuries?: string | null;
  surgery?: string | null;
  emergencyName?: string | null;
  emergencyPhone?: string | null;
}

/**
 * Persiste los datos recopilados en el onboarding en el documento de usuario en Firestore.
 * Crea/actualiza el objeto `medicalProfile` y marca `onboardingCompleted: true`.
 *
 * @param uid - ID único del usuario autenticado en Firebase
 * @param data - Datos recopilados del formulario de onboarding
 * @returns Promesa que resuelve a `true` si se guardó con éxito o `false` en caso de error
 */
export async function saveOnboardingProfile(
  uid: string,
  data: OnboardingData
): Promise<boolean> {
  if (!uid) {
    logger.error('OnboardingService', 'Intento de guardado sin UID válido');
    return false;
  }

  const medicalProfile: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (data.birthdate) medicalProfile.birthDate = data.birthdate;
  if (data.height) medicalProfile.height = data.height;
  if (data.initialWeight) medicalProfile.initialWeight = data.initialWeight;
  if (data.experience) medicalProfile.experience = data.experience;
  if (data.goals && data.goals.length > 0) medicalProfile.goals = data.goals;
  if (data.conditions) medicalProfile.conditions = data.conditions;
  if (data.medications) medicalProfile.medications = data.medications;
  if (data.allergies) medicalProfile.allergies = data.allergies;
  if (data.injuries) medicalProfile.injuries = data.injuries;
  if (data.surgery) medicalProfile.surgery = data.surgery;
  if (data.emergencyName) medicalProfile.emergencyName = data.emergencyName;
  if (data.emergencyPhone) medicalProfile.emergencyPhone = data.emergencyPhone;

  try {
    await updateDoc(doc(db, 'users', uid), {
      medicalProfile,
      onboardingCompleted: true,
      updatedAt: serverTimestamp(),
    });
    const { clearUserCache } = await import('@/lib/shared/initPage');
    clearUserCache();
    logger.info('OnboardingService', `Perfil de onboarding completado para UID: ${uid}`);
    return true;
  } catch (err) {
    logger.error('OnboardingService', 'Error al guardar perfil de onboarding en Firestore:', err);
    return false;
  }
}

/**
 * Marca el onboarding como completado omitiendo la recolección de datos adicionales.
 *
 * @param uid - ID del usuario
 */
export async function skipOnboarding(uid: string): Promise<boolean> {
  if (!uid) return false;
  try {
    await updateDoc(doc(db, 'users', uid), {
      onboardingCompleted: true,
      updatedAt: serverTimestamp(),
    });
    const { clearUserCache } = await import('@/lib/shared/initPage');
    clearUserCache();
    logger.info('OnboardingService', `Onboarding omitido por el usuario UID: ${uid}`);
    return true;
  } catch (err) {
    logger.error('OnboardingService', 'Error al omitir onboarding:', err);
    return false;
  }
}
