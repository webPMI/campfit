/**
 * Módulo de servicio para la gestión del flujo de Onboarding del cliente.
 * Usa Firebase Client SDK respetando Security Rules.
 *
 * @module client/onboardingService
 */

import { db } from '@/lib/firebase';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { logger } from '@/lib/shared/logger';

export interface OnboardingData {
  name?: string | null;
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
  dietaryRestrictions?: string[] | null;
  otherDietary?: string | null;
  excludedFoodIds?: string[] | null;
}

/**
 * Guarda el perfil médico en Firestore.
 */
export async function saveOnboardingProfile(
  uid: string,
  data: OnboardingData,
): Promise<boolean> {
  if (!uid) {
    logger.error('OnboardingService', 'Intento de guardado sin UID válido');
    return false;
  }

  const medicalProfile: Record<string, unknown> = {};
  if (data.birthdate) medicalProfile.birthDate = data.birthdate;
  if (data.height) medicalProfile.height = data.height;
  if (data.initialWeight) medicalProfile.initialWeight = data.initialWeight;
  if (data.experience) medicalProfile.experience = data.experience;
  if (data.goals?.length) medicalProfile.goals = data.goals;
  if (data.conditions) medicalProfile.conditions = data.conditions;
  if (data.medications) medicalProfile.medications = data.medications;
  if (data.allergies) medicalProfile.allergies = data.allergies;
  if (data.injuries) medicalProfile.injuries = data.injuries;
  if (data.surgery) medicalProfile.surgery = data.surgery;
  if (data.emergencyName) medicalProfile.emergencyName = data.emergencyName;
  if (data.emergencyPhone) medicalProfile.emergencyPhone = data.emergencyPhone;
  if (data.dietaryRestrictions?.length) medicalProfile.dietaryRestrictions = data.dietaryRestrictions;
  if (data.otherDietary) medicalProfile.otherDietary = data.otherDietary;
  if (data.excludedFoodIds?.length) medicalProfile.excludedFoodIds = data.excludedFoodIds;

  // 🔒 CRÍTICO: El nombre se guarda en el documento principal del usuario, no solo en medicalProfile
  // Esto asegura que los usuarios aparezcan con su nombre real en el panel de administración
  // 🔒 CRÍTICO: updatedAt solo a nivel principal, no dentro de medicalProfile
  const userData: Record<string, unknown> = { medicalProfile, onboardingCompleted: true, updatedAt: serverTimestamp() };
  if (data.name) userData.name = data.name;

  try {
    const userRef = doc(db, 'users', uid);
    const { auth } = await import('@/lib/firebase');
    const authUser = auth.currentUser;
    logger.info('OnboardingService', `🔍 UID:${uid.slice(0,8)} authUID:${authUser?.uid.slice(0,8)} match:${authUser?.uid === uid}`);

    // Paso 1: setDoc (allow create)
    try {
      await setDoc(userRef, {
        name: data.name || 'Nuevo Usuario',
        email: '',
        role: 'client',
        photoURL: '',
        hasActiveAlert: false,
        ...userData,
        createdAt: serverTimestamp(),
      });
      logger.info('OnboardingService', '✅ setDoc exitoso');
      await clearCache();
      return true;
    } catch (err1: unknown) {
      const code1 = (err1 as { code?: string }).code || '';
      const msg1 = (err1 as { message?: string }).message || String(err1).slice(0, 120);
      logger.warn('OnboardingService', `❌ setDoc → ${code1}:${msg1}`);

      // Paso 2: updateDoc (allow update)
      try {
        await updateDoc(userRef, userData);
        logger.info('OnboardingService', '✅ updateDoc exitoso');
        await clearCache();
        return true;
      } catch (err2: unknown) {
        const code2 = (err2 as { code?: string }).code || '';
        const msg2 = (err2 as { message?: string }).message || String(err2).slice(0, 120);
        logger.error('OnboardingService', `❌ updateDoc → ${code2}:${msg2}`);
        logger.error('OnboardingService', `📊 create(${code1}) + update(${code2}) ambos fallaron`);
        return false;
      }
    }
  } catch (err) {
    logger.error('OnboardingService', `🔥 ${String(err)}`, err);
    return false;
  }
}

export async function skipOnboarding(uid: string): Promise<boolean> {
  if (!uid) return false;
  try {
    const userRef = doc(db, 'users', uid);
    try {
      await setDoc(userRef, {
        name: 'Nuevo Usuario', email: '', role: 'client', photoURL: '',
        hasActiveAlert: false, onboardingCompleted: true,
        createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
      });
    } catch (err1: unknown) {
      const code1 = (err1 as { code?: string }).code || '';
      if (code1.includes('already-exists')) {
        await updateDoc(userRef, { onboardingCompleted: true, updatedAt: serverTimestamp() });
      } else {
        logger.error('OnboardingService', `❌ skip setDoc: ${code1}`);
        return false;
      }
    }
    await clearCache();
    return true;
  } catch (err) {
    logger.error('OnboardingService', 'skip error:', err);
    return false;
  }
}

async function clearCache(): Promise<void> {
  const { clearUserCache } = await import('@/lib/shared/initPage');
  clearUserCache();
}