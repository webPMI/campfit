/**
 * Servicio de perfil de usuario reutilizable para todos los roles.
 * Proporciona operaciones CRUD de perfil, cambio de contraseña y gestión de sesión.
 *
 * @module profileService
 */

import { auth, db } from '@/lib/firebase';
import { updatePassword, sendPasswordResetEmail, type User as FirebaseUser } from 'firebase/auth';
import {
  doc,
  updateDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { logger } from '@/lib/shared/logger';
import { escapeHtml, showToast as uiShowToast } from '@/lib/shared/ui';

// ============================================================
// Tipos
// ============================================================

export interface ProfileData {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'trainer' | 'client';
  hasActiveAlert?: boolean;
  assignedTrainerId?: string;
  assignedTrainerName?: string;
  medicalProfile?: MedicalProfileData;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface MedicalProfileData {
  height?: number;
  initialWeight?: number;
  birthDate?: unknown;
  experience?: 'beginner' | 'intermediate' | 'advanced';
  goals?: string[];
  allergies?: string[];
  injuries?: string[];
  conditions?: string[];
  medications?: string[];
  emergencyName?: string;
  emergencyPhone?: string;
  [key: string]: unknown;
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  medicalProfile?: MedicalProfileData;
}

export interface ProfileActionResult {
  success: boolean;
  message: string;
}

// ============================================================
// Funciones del servicio
// ============================================================

/**
 * Carga el perfil completo del usuario desde Firestore.
 * @param uid - ID del usuario
 * @returns Datos del perfil o null si no existe
 */
export async function loadProfile(uid: string): Promise<ProfileData | null> {
  try {
    const docSnap = await getDoc(doc(db, 'users', uid));
    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    const profile: ProfileData = {
      uid: docSnap.id,
      name: data.name || 'Sin nombre',
      email: data.email || '',
      role: data.role || 'client',
      hasActiveAlert: data.hasActiveAlert ?? false,
      assignedTrainerId: data.assignedTrainerId,
      medicalProfile: data.medicalProfile,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };

    // Resolver nombre del trainer asignado si existe
    if (data.assignedTrainerId) {
      try {
        const trainerSnap = await getDoc(doc(db, 'users', data.assignedTrainerId));
        if (trainerSnap.exists()) {
          profile.assignedTrainerName = trainerSnap.data().name || data.assignedTrainerId;
        }
      } catch {
        profile.assignedTrainerName = data.assignedTrainerId;
      }
    }

    return profile;
  } catch (error) {
    logger.error('Profile', 'Error al cargar perfil:', error);
    return null;
  }
}

/**
 * Actualiza los datos básicos del perfil (nombre, email).
 * @param uid - ID del usuario
 * @param data - Datos a actualizar
 * @returns Resultado de la operación
 */
export async function updateProfile(uid: string, data: UpdateProfilePayload): Promise<ProfileActionResult> {
  try {
    const updatePayload: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };

    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.email !== undefined) updatePayload.email = data.email;
    if (data.medicalProfile !== undefined) updatePayload.medicalProfile = data.medicalProfile;

    await updateDoc(doc(db, 'users', uid), updatePayload);
    logger.info('Profile', `Perfil actualizado para ${uid}`);
    return { success: true, message: 'Perfil actualizado correctamente' };
  } catch (error) {
    logger.error('Profile', 'Error al actualizar perfil:', error);
    return { success: false, message: 'Error al actualizar el perfil' };
  }
}

/**
 * Envía un email de recuperación de contraseña.
 * @param email - Email del usuario
 * @returns Resultado de la operación
 */
export async function sendPasswordReset(email: string): Promise<ProfileActionResult> {
  try {
    await sendPasswordResetEmail(auth, email);
    logger.info('Profile', `Email de recuperación enviado a ${email}`);
    return { success: true, message: `Email de recuperación enviado a ${email}` };
  } catch (error) {
    logger.error('Profile', 'Error al enviar email de recuperación:', error);
    return { success: false, message: 'Error al enviar el email de recuperación' };
  }
}

/**
 * Cambia la contraseña del usuario autenticado (requiere sesión reciente).
 * @param user - Usuario de Firebase autenticado
 * @param newPassword - Nueva contraseña
 * @returns Resultado de la operación
 */
export async function changePassword(
  user: FirebaseUser,
  newPassword: string,
): Promise<ProfileActionResult> {
  try {
    await updatePassword(user, newPassword);
    logger.info('Profile', 'Contraseña cambiada exitosamente');
    return { success: true, message: 'Contraseña cambiada correctamente' };
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err.code === 'auth/requires-recent-login') {
      return {
        success: false,
        message: 'Debes volver a iniciar sesión para cambiar la contraseña',
      };
    }
    if (err.code === 'auth/weak-password') {
      return {
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres',
      };
    }
    logger.error('Profile', 'Error al cambiar contraseña:', error);
    return { success: false, message: 'Error al cambiar la contraseña' };
  }
}

/**
 * Obtiene la inicial del nombre para el avatar.
 * @param name - Nombre del usuario
 * @returns Inicial en mayúscula
 * @deprecated Usar getUserInitial de '@/lib/shared/ui'
 */
export function getProfileInitial(name: string): string {
  return (name || '?').charAt(0).toUpperCase();
}

/**
 * Obtiene la clase de color del badge según el rol.
 * @param role - Rol del usuario
 * @returns Clases CSS
 * @deprecated Usar getRoleBadge de '@/lib/shared/ui'
 */
export function getRoleBadgeClass(role: string): { label: string; class: string } {
  switch (role) {
    case 'admin':
      return { label: 'Admin', class: 'bg-purple-500/10 text-purple-400 border border-purple-500/20' };
    case 'trainer':
      return { label: 'Trainer', class: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' };
    case 'client':
      return { label: 'Client', class: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' };
    default:
      return { label: role, class: 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20' };
  }
}

/**
 * Renderiza la vista de perfil como HTML.
 * @param profile - Datos del perfil
 * @returns HTML de la sección de perfil
 */
export function renderProfileView(profile: ProfileData): string {
  const badge = getRoleBadgeClass(profile.role);
  const initial = getProfileInitial(profile.name);
  const hasTrainer = !!profile.assignedTrainerName;

  return `
    <div class="flex items-center gap-5">
      <div class="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-3xl font-bold text-white shadow-lg shadow-emerald-500/20">
        ${initial}
      </div>
      <div class="min-w-0">
        <h2 class="text-xl font-bold text-zinc-100 truncate">${escapeHtml(profile.name)}</h2>
        <p class="text-sm text-zinc-500 truncate">${escapeHtml(profile.email)}</p>
        <div class="mt-2 flex flex-wrap items-center gap-2">
          <span class="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.class}">${badge.label}</span>
          ${hasTrainer ? `<span class="text-xs text-zinc-500">Trainer: ${escapeHtml(profile.assignedTrainerName!)}</span>` : ''}
          ${profile.hasActiveAlert ? '<span class="inline-flex items-center gap-1 text-xs text-red-400"><span class="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span> Alerta activa</span>' : ''}
        </div>
      </div>
    </div>
  `;
}

/**
 * Renderiza la sección de información general del perfil médico.
 * @param mp - Datos del perfil médico
 * @returns HTML
 */
export function renderMedicalGeneralInfo(mp: MedicalProfileData): string {
  const fields: string[] = [];

  if (mp.birthDate) {
    const age = calculateAge(mp.birthDate);
    fields.push(`<div><span class="text-zinc-500">Edad:</span> <span class="text-zinc-200">${age} años</span></div>`);
  }
  if (mp.height) {
    fields.push(`<div><span class="text-zinc-500">Altura:</span> <span class="text-zinc-200">${mp.height} cm</span></div>`);
  }
  if (mp.initialWeight) {
    fields.push(`<div><span class="text-zinc-500">Peso inicial:</span> <span class="text-zinc-200">${mp.initialWeight} kg</span></div>`);
  }
  if (mp.experience) {
    fields.push(`<div><span class="text-zinc-500">Experiencia:</span> <span class="text-zinc-200 capitalize">${mp.experience}</span></div>`);
  }
  if (mp.goals?.length) {
    fields.push(`<div class="col-span-2"><span class="text-zinc-500">Objetivos:</span> <span class="text-zinc-200">${mp.goals.join(', ')}</span></div>`);
  }

  if (fields.length === 0) return '';

  return `
    <div class="rounded-xl border border-zinc-800/40 bg-zinc-800/30 p-4">
      <h4 class="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Información General</h4>
      <div class="grid grid-cols-2 gap-2 text-sm">
        ${fields.join('')}
      </div>
    </div>
  `;
}

/**
 * Renderiza una sección de tags médicos (alergias, lesiones, etc.).
 * @param title - Título de la sección
 * @param items - Array de strings
 * @param colorClass - Clase de color (amber, red, orange, etc.)
 * @returns HTML
 */
export function renderMedicalTagSection(
  title: string,
  items: string[] | undefined,
  colorClass: 'amber' | 'red' | 'orange' | 'emerald',
): string {
  if (!items?.length) return '';

  const colorMap = {
    amber: { border: 'amber-900/30', bg: 'amber-500/5', text: 'amber-400', tagBg: 'amber-500/10', tagText: 'amber-300', tagBorder: 'amber-500/20' },
    red: { border: 'red-900/30', bg: 'red-500/5', text: 'red-400', tagBg: 'red-500/10', tagText: 'red-300', tagBorder: 'red-500/20' },
    orange: { border: 'orange-900/30', bg: 'orange-500/5', text: 'orange-400', tagBg: 'orange-500/10', tagText: 'orange-300', tagBorder: 'orange-500/20' },
    emerald: { border: 'emerald-900/30', bg: 'emerald-500/5', text: 'emerald-400', tagBg: 'emerald-500/10', tagText: 'emerald-300', tagBorder: 'emerald-500/20' },
  };

  const c = colorMap[colorClass];

  return `
    <div class="rounded-xl border border-${c.border} bg-${c.bg} p-4">
      <h4 class="text-xs font-semibold text-${c.text} uppercase tracking-wider mb-2">${title}</h4>
      <div class="flex flex-wrap gap-1.5">
        ${items.map((item: string) => `<span class="rounded-full bg-${c.tagBg} px-2.5 py-0.5 text-xs text-${c.tagText} border border-${c.tagBorder}">${escapeHtml(item)}</span>`).join('')}
      </div>
    </div>
  `;
}

/**
 * Renderiza el perfil médico completo.
 * @param mp - Datos del perfil médico
 * @returns HTML
 */
export function renderMedicalProfile(mp: MedicalProfileData): string {
  if (!mp || Object.keys(mp).length === 0) {
    return `
      <div class="rounded-xl border border-zinc-800/40 bg-zinc-800/30 p-6 text-center">
        <p class="text-zinc-500">Perfil médico no completado</p>
      </div>
    `;
  }

  const sections = [
    renderMedicalGeneralInfo(mp),
    renderMedicalTagSection('Alergias', mp.allergies as string[], 'amber'),
    renderMedicalTagSection('Lesiones', mp.injuries as string[], 'red'),
    renderMedicalTagSection('Condiciones Médicas', mp.conditions as string[], 'orange'),
  ];

  const hasMedicalTags = mp.allergies?.length || mp.injuries?.length || mp.conditions?.length;

  if (!hasMedicalTags && !mp.birthDate && !mp.height && !mp.initialWeight) {
    sections.push(`
      <div class="rounded-xl border border-emerald-900/30 bg-emerald-500/5 p-4 text-center">
        <p class="text-sm text-emerald-400">No hay alertas médicas registradas</p>
      </div>
    `);
  }

  return `<div class="space-y-3">${sections.join('')}</div>`;
}

/**
 * Renderiza el toast de notificación.
 * @deprecated Usar showToast de '@/lib/shared/ui'
 */
export function showToast(
  message: string,
  type: 'success' | 'error' | 'info',
  id: string = 'profile-toast',
  duration: number = 3000,
): void {
  uiShowToast({ message, type, duration });
}

/**
 * Renderiza el estado de carga.
 * @returns HTML
 * @deprecated Usar renderLoadingState de '@/lib/shared/ui'
 */
export function renderProfileLoadingState(): string {
  return `
    <div class="flex items-center justify-center py-12">
      <div class="flex items-center gap-3">
        <svg class="h-5 w-5 animate-spin text-emerald-400" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p class="text-sm text-zinc-500">Cargando perfil...</p>
      </div>
    </div>
  `;
}

/**
 * Renderiza un campo de formulario reutilizable.
 * @param id - ID del campo
 * @param label - Etiqueta
 * @param value - Valor actual
 * @param type - Tipo de input
 * @param placeholder - Placeholder opcional
 * @returns HTML
 */
export function renderFormField(
  id: string,
  label: string,
  value: string,
  type: string = 'text',
  placeholder?: string,
): string {
  return `
    <div>
      <label for="${id}" class="block text-xs font-medium text-zinc-400 mb-1.5">${label}</label>
      <input
        id="${id}"
        type="${type}"
        value="${escapeHtml(value)}"
        ${placeholder ? `placeholder="${escapeHtml(placeholder)}"` : ''}
        class="w-full rounded-xl border border-zinc-700/50 bg-zinc-800/80 px-3.5 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 backdrop-blur-sm transition-all focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
      />
    </div>
  `;
}

// ============================================================
// Utilidades internas
// ============================================================

function calculateAge(birthDate: unknown): number {
  if (!birthDate) return 0;
  try {
    const date = typeof birthDate === 'object' && birthDate !== null && 'toDate' in birthDate
      ? (birthDate as { toDate: () => Date }).toDate()
      : new Date(birthDate as string);
    const diff = Date.now() - date.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  } catch {
    return 0;
  }
}
