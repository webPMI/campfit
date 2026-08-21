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
import { escapeHtml, getUserInitial, getRoleBadge } from '@/lib/shared/ui';
import { uploadAvatar } from '@/lib/storage/r2Service';

// ============================================================
// Tipos
// ============================================================

export interface ProfileData {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'trainer' | 'client';
  photoURL?: string;
  avatar_url?: string;
  user_bio?: string;
  notesForTrainer?: string;
  birthDate?: unknown;
  goals?: string[];
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
  photoURL?: string;
  avatar_url?: string;
  user_bio?: string;
  notesForTrainer?: string;
  birthDate?: unknown;
  goals?: string[];
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
      photoURL: data.photoURL || data.avatar_url || undefined,
      avatar_url: data.avatar_url || data.photoURL || undefined,
      user_bio: data.user_bio || data.bio || undefined,
      notesForTrainer: data.notesForTrainer || data.trainerNotes || undefined,
      birthDate: data.birthDate || data.medicalProfile?.birthDate || undefined,
      goals: Array.isArray(data.goals) ? data.goals : Array.isArray(data.medicalProfile?.goals) ? data.medicalProfile.goals : [],
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
 * Actualiza los datos del perfil (nombre, bio, metas, notas, etc.).
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
    if (data.photoURL !== undefined) {
      updatePayload.photoURL = data.photoURL;
      updatePayload.avatar_url = data.photoURL;
    }
    if (data.avatar_url !== undefined) {
      updatePayload.avatar_url = data.avatar_url;
      if (!data.photoURL) updatePayload.photoURL = data.avatar_url;
    }
    if (data.user_bio !== undefined) updatePayload.user_bio = data.user_bio;
    if (data.notesForTrainer !== undefined) updatePayload.notesForTrainer = data.notesForTrainer;
    if (data.birthDate !== undefined) updatePayload.birthDate = data.birthDate;
    if (data.goals !== undefined) updatePayload.goals = data.goals;
    if (data.medicalProfile !== undefined) updatePayload.medicalProfile = data.medicalProfile;

    await updateDoc(doc(db, 'users', uid), updatePayload);

    // Sincronizar reactivamente con authStore si es el usuario actual
    try {
      const { $user, setUser } = await import('@/stores/authStore');
      const currentUser = $user.get();
      if (currentUser && currentUser.uid === uid) {
        setUser({
          ...currentUser,
          ...(data.name !== undefined ? { name: data.name } : {}),
          ...(data.photoURL !== undefined ? { photoURL: data.photoURL, avatar_url: data.photoURL } : {}),
          ...(data.avatar_url !== undefined ? { avatar_url: data.avatar_url, photoURL: data.avatar_url } : {}),
          ...(data.user_bio !== undefined ? { user_bio: data.user_bio } : {}),
          ...(data.notesForTrainer !== undefined ? { notesForTrainer: data.notesForTrainer } : {}),
          ...(data.birthDate !== undefined ? { birthDate: data.birthDate } : {}),
          ...(data.goals !== undefined ? { goals: data.goals } : {}),
        });
      }
    } catch {
      // Ignore if in test or non-browser env
    }

    logger.info('Profile', `Perfil actualizado para ${uid}`);
    return { success: true, message: 'Perfil actualizado correctamente' };
  } catch (error) {
    logger.error('Profile', 'Error al actualizar perfil:', error);
    return { success: false, message: 'Error al actualizar el perfil' };
  }
}

/**
 * Sube una nueva imagen de avatar a Cloudflare R2 y actualiza el documento de usuario.
 * @param uid - ID del usuario
 * @param file - Archivo de imagen seleccionado
 * @returns Resultado con la URL pública de R2
 */
export async function uploadProfileAvatar(
  uid: string,
  file: File
): Promise<{ success: boolean; photoUrl?: string; message: string }> {
  try {
    const uploadResult = await uploadAvatar(file, uid);
    const photoUrl = uploadResult.url;

    await updateDoc(doc(db, 'users', uid), {
      photoURL: photoUrl,
      avatar_url: photoUrl,
      updatedAt: serverTimestamp(),
    });

    // Sincronizar reactivamente con authStore si es el usuario actual
    try {
      const { $user, setUser } = await import('@/stores/authStore');
      const currentUser = $user.get();
      if (currentUser && currentUser.uid === uid) {
        setUser({
          ...currentUser,
          photoURL: photoUrl,
          avatar_url: photoUrl,
        });
      }
    } catch {
      // Ignore if in test or non-browser env
    }

    logger.info('Profile', `Avatar actualizado en Cloudflare R2 para ${uid}: ${photoUrl}`);
    return {
      success: true,
      photoUrl: photoUrl,
      message: 'Foto de perfil actualizada correctamente en Cloudflare R2',
    };
  } catch (error) {
    logger.error('Profile', 'Error al subir avatar a Cloudflare R2:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error al subir la imagen de perfil a Cloudflare R2',
    };
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
 * Renderiza la vista de perfil como HTML.
 * @param profile - Datos del perfil
 * @returns HTML de la sección de perfil
 */
export function renderProfileView(profile: ProfileData): string {
  const badge = getRoleBadge(profile.role);
  const initial = getUserInitial(profile.name);
  const hasTrainer = !!profile.assignedTrainerName;
  const avatarHtml = profile.photoURL
    ? `<img src="${escapeHtml(profile.photoURL)}" alt="${escapeHtml(profile.name)}" class="h-20 w-20 shrink-0 rounded-full object-cover border-2 border-[var(--border-brand)] shadow-[var(--shadow-glow-sm)]" />`
    : `<div class="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--brand-hover)] to-[var(--brand)] text-3xl font-bold text-[var(--text-on-brand)] shadow-[var(--shadow-glow-sm)]">${initial}</div>`;

  return `
    <div class="flex items-center gap-5">
      ${avatarHtml}
      <div class="min-w-0">
        <h2 class="text-xl font-bold text-[var(--text-primary)] truncate">${escapeHtml(profile.name)}</h2>
        <p class="text-sm text-[var(--text-tertiary)] truncate">${escapeHtml(profile.email)}</p>
        <div class="mt-2 flex flex-wrap items-center gap-2">
          <span class="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.class}">${badge.label}</span>
          ${hasTrainer ? `<span class="text-xs text-[var(--text-tertiary)]">Trainer: ${escapeHtml(profile.assignedTrainerName!)}</span>` : ''}
          ${profile.hasActiveAlert ? '<span class="inline-flex items-center gap-1 text-xs text-[var(--danger)]"><span class="h-1.5 w-1.5 rounded-full bg-[var(--danger)] animate-pulse"></span> Alerta activa</span>' : ''}
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
    fields.push(`<div><span class="text-[var(--text-tertiary)]">Edad:</span> <span class="text-[var(--text-primary)] font-medium">${age} años</span></div>`);
  }
  if (mp.height) {
    fields.push(`<div><span class="text-[var(--text-tertiary)]">Altura:</span> <span class="text-[var(--text-primary)] font-medium">${mp.height} cm</span></div>`);
  }
  if (mp.initialWeight) {
    fields.push(`<div><span class="text-[var(--text-tertiary)]">Peso inicial:</span> <span class="text-[var(--text-primary)] font-medium">${mp.initialWeight} kg</span></div>`);
  }
  if (mp.experience) {
    fields.push(`<div><span class="text-[var(--text-tertiary)]">Experiencia:</span> <span class="text-[var(--text-primary)] font-medium capitalize">${mp.experience}</span></div>`);
  }
  if (mp.goals?.length) {
    fields.push(`<div class="col-span-2"><span class="text-[var(--text-tertiary)]">Objetivos:</span> <span class="text-[var(--text-primary)] font-medium">${mp.goals.join(', ')}</span></div>`);
  }

  if (fields.length === 0) return '';

  return `
    <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] p-4">
      <h4 class="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Información General</h4>
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
    amber: { border: 'border-[var(--warning)]', bg: 'bg-[var(--warning-dim)]', text: 'text-[var(--warning)]', tagBg: 'bg-[var(--warning-dim)]', tagText: 'text-[var(--warning)]', tagBorder: 'border-[var(--warning)]' },
    red: { border: 'border-[var(--danger)]', bg: 'bg-[var(--danger-dim)]', text: 'text-[var(--danger)]', tagBg: 'bg-[var(--danger-dim)]', tagText: 'text-[var(--danger)]', tagBorder: 'border-[var(--danger)]' },
    orange: { border: 'border-[var(--warning)]', bg: 'bg-[var(--warning-dim)]', text: 'text-[var(--warning)]', tagBg: 'bg-[var(--warning-dim)]', tagText: 'text-[var(--warning)]', tagBorder: 'border-[var(--warning)]' },
    emerald: { border: 'border-[var(--brand)]', bg: 'bg-[var(--brand-dim)]', text: 'text-[var(--brand)]', tagBg: 'bg-[var(--brand-dim)]', tagText: 'text-[var(--brand)]', tagBorder: 'border-[var(--border-brand)]' },
  };

  const c = colorMap[colorClass];

  return `
    <div class="rounded-xl border ${c.border} ${c.bg} p-4 border-opacity-30">
      <h4 class="text-xs font-semibold ${c.text} uppercase tracking-wider mb-2">${title}</h4>
      <div class="flex flex-wrap gap-1.5">
        ${items.map((item: string) => `<span class="rounded-full ${c.tagBg} px-2.5 py-0.5 text-xs ${c.tagText} border ${c.tagBorder} border-opacity-30">${escapeHtml(item)}</span>`).join('')}
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
      <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] p-6 text-center">
        <p class="text-[var(--text-tertiary)]">Perfil médico no completado</p>
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
      <div class="rounded-xl border border-[var(--border-brand)] bg-[var(--brand-dim)] p-4 text-center">
        <p class="text-sm text-[var(--brand)]">No hay alertas médicas registradas</p>
      </div>
    `);
  }

  return `<div class="space-y-3">${sections.join('')}</div>`;
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
        <svg class="h-5 w-5 animate-spin text-[var(--brand)]" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p class="text-sm text-[var(--text-tertiary)]">Cargando perfil...</p>
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
      <label for="${id}" class="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">${label}</label>
      <input
        id="${id}"
        type="${type}"
        value="${escapeHtml(value)}"
        ${placeholder ? `placeholder="${escapeHtml(placeholder)}"` : ''}
        class="w-full rounded-xl border border-[var(--border-default)] bg-[var(--surface-2)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none transition-all focus:border-[var(--brand)] focus:bg-[var(--surface-3)] focus:shadow-[0_0_0_3px_var(--brand-dim)]"
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
