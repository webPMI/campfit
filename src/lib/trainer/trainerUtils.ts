/**
 * Utilidades compartidas para el panel de entrenador.
 * Proporciona funciones de renderizado, datos en tiempo real y gestión
 * de clientes asignados, rutinas, dietas y chat.
 *
 * @module trainerUtils
 */

import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  getDoc,
  getDocs,
  deleteDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import { logger } from '@/lib/shared/logger';
import { ICONS, escapeHtml, formatDate, formatTime, getUserInitial, showToast, renderEmptyState, renderLoadingState, getRoleBadge } from '@/lib/shared/ui';
import { sendMessage as chatSendMessage, subscribeToUserMessages, subscribeToConversation as chatSubscribeToConversation, markAsRead as chatMarkAsRead } from '@/lib/shared/chat';

// ============================================================
// Tipos
// ============================================================

export interface TrainerClient {
  uid: string;
  name: string;
  email: string;
  role: 'client' | 'admin';

  assignedTrainerId?: string;
  hasActiveAlert?: boolean;
  medicalProfile?: {
    allergies?: string[];
    injuries?: string[];
    conditions?: string[];
    goals?: string[];
    experience?: string;
  };
  createdAt?: { toDate: () => Date } | null;
  updatedAt?: { toDate: () => Date } | null;
}

export interface TrainerWorkout {
  id: string;
  clientId: string;
  trainerId: string;
  name: string;
  difficulty: string;
  description: string;
  exercises: Exercise[];
  createdAt?: { toDate: () => Date } | null;
  updatedAt?: { toDate: () => Date } | null;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  restTime: string;
  videoUrl: string;
  description: string;
  order: number;
  dayOfWeek: number;
}

export interface TrainerDiet {
  id: string;
  clientId: string;
  trainerId: string;
  name: string;
  type: 'normal' | 'advanced';
  somatotype?: 'ectomorph' | 'mesomorph' | 'endomorph';
  totalCalories: number;
  meals: Meal[];
  createdAt?: { toDate: () => Date } | null;
  updatedAt?: { toDate: () => Date } | null;
}

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

export interface TrainerMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'alert';
  participants: string[];
  isRead: boolean;
  createdAt?: { toDate: () => Date } | null;
}

// ============================================================
// Auth guard
// ============================================================

export function requireAuth(callback: (user: FirebaseUser) => void): Unsubscribe {
  return onAuthStateChanged(auth, (user) => {
    if (!user) {
      logger.warn('Trainer', 'Usuario no autenticado, redirigiendo a login');
      window.location.href = '/login';
      return;
    }
    callback(user);
  });
}

// ============================================================
// Servicios de datos - Clientes
// ============================================================

export function subscribeToClients(
  trainerId: string,
  callback: (clients: TrainerClient[]) => void,
): Unsubscribe {
  // Obtener clientes asignados a este trainer
  // Nota: Solo clients, no admins, porque las reglas de seguridad
  // no permiten a trainers leer admins aunque estén asignados
  const q = query(
    collection(db, 'users'),
    where('assignedTrainerId', '==', trainerId),
    where('role', '==', 'client'),
    orderBy('createdAt', 'desc'),
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const clients = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          uid: doc.id,
          name: data.name || 'Sin nombre',
          email: data.email || '',
          role: 'client' as const,
          assignedTrainerId: data.assignedTrainerId,
          hasActiveAlert: data.hasActiveAlert ?? false,
          medicalProfile: data.medicalProfile,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        } as TrainerClient;
      });
      callback(clients);
    },
    (error) => {
      logger.error('Trainer', 'Error al suscribirse a clientes:', error);
      showToast({ message: 'Error al cargar clientes', type: 'error' });
    },
  );
}


export async function getClientProfile(clientId: string): Promise<TrainerClient | null> {
  try {
    const docSnap = await getDoc(doc(db, 'users', clientId));
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        uid: docSnap.id,
        name: data.name || 'Sin nombre',
        email: data.email || '',
        role: data.role as 'client' | 'admin',
        assignedTrainerId: data.assignedTrainerId,
        hasActiveAlert: data.hasActiveAlert ?? false,
        medicalProfile: data.medicalProfile,
        createdAt: data.createdAt,
      } as TrainerClient;
    }
    return null;
  } catch (error) {
    logger.error('Trainer', 'Error al cargar perfil del cliente:', error);
    return null;
  }
}


// ============================================================
// Servicios de datos - Rutinas
// ============================================================

export function subscribeToWorkoutsByTrainer(
  trainerId: string,
  callback: (workouts: TrainerWorkout[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'workouts'),
    where('trainerId', '==', trainerId),
    orderBy('createdAt', 'desc'),
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const workouts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TrainerWorkout[];
      callback(workouts);
    },
    (error) => {
      logger.error('Trainer', 'Error al suscribirse a rutinas:', error);
      showToast({ message: 'Error al cargar rutinas', type: 'error' });
    },
  );
}

export function subscribeToWorkoutsByClient(
  clientId: string,
  callback: (workouts: TrainerWorkout[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'workouts'),
    where('clientId', '==', clientId),
    orderBy('createdAt', 'desc'),
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const workouts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TrainerWorkout[];
      callback(workouts);
    },
    (error) => {
      logger.error('Trainer', 'Error al suscribirse a rutinas del cliente:', error);
    },
  );
}

export async function createWorkout(data: Omit<TrainerWorkout, 'id'>): Promise<string | null> {
  try {
    const docRef = await addDoc(collection(db, 'workouts'), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    logger.info('Trainer', `Rutina creada: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    logger.error('Trainer', 'Error al crear rutina:', error);
    showToast({ message: 'Error al crear la rutina', type: 'error' });
    return null;
  }
}

export async function updateWorkout(id: string, data: Partial<TrainerWorkout>): Promise<boolean> {
  try {
    await updateDoc(doc(db, 'workouts', id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    logger.error('Trainer', 'Error al actualizar rutina:', error);
    showToast({ message: 'Error al actualizar la rutina', type: 'error' });
    return false;
  }
}

export async function deleteWorkout(id: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'workouts', id));
    return true;
  } catch (error) {
    logger.error('Trainer', 'Error al eliminar rutina:', error);
    showToast({ message: 'Error al eliminar la rutina', type: 'error' });
    return false;
  }
}

// ============================================================
// Servicios de datos - Dietas
// ============================================================

export function subscribeToDietsByTrainer(
  trainerId: string,
  callback: (diets: TrainerDiet[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'diets'),
    where('trainerId', '==', trainerId),
    orderBy('createdAt', 'desc'),
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const diets = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TrainerDiet[];
      callback(diets);
    },
    (error) => {
      logger.error('Trainer', 'Error al suscribirse a dietas:', error);
      showToast({ message: 'Error al cargar dietas', type: 'error' });
    },
  );
}

export function subscribeToDietsByClient(
  clientId: string,
  callback: (diets: TrainerDiet[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'diets'),
    where('clientId', '==', clientId),
    orderBy('createdAt', 'desc'),
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const diets = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TrainerDiet[];
      callback(diets);
    },
    (error) => {
      logger.error('Trainer', 'Error al suscribirse a dietas del cliente:', error);
    },
  );
}

export async function createDiet(data: Omit<TrainerDiet, 'id'>): Promise<string | null> {
  try {
    const docRef = await addDoc(collection(db, 'diets'), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    logger.info('Trainer', `Dieta creada: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    logger.error('Trainer', 'Error al crear dieta:', error);
    showToast({ message: 'Error al crear la dieta', type: 'error' });
    return null;
  }
}

export async function updateDiet(id: string, data: Partial<TrainerDiet>): Promise<boolean> {
  try {
    await updateDoc(doc(db, 'diets', id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    logger.error('Trainer', 'Error al actualizar dieta:', error);
    showToast({ message: 'Error al actualizar la dieta', type: 'error' });
    return false;
  }
}

export async function deleteDiet(id: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'diets', id));
    return true;
  } catch (error) {
    logger.error('Trainer', 'Error al eliminar dieta:', error);
    showToast({ message: 'Error al eliminar la dieta', type: 'error' });
    return false;
  }
}

// ============================================================
// Servicios de datos - Chat (delegados a shared/chat)
// ============================================================

/**
 * Se suscribe a las conversaciones del trainer.
 * @deprecated Usar subscribeToUserMessages de '@/lib/shared/chat'
 */
export function subscribeToConversations(
  trainerId: string,
  callback: (messages: TrainerMessage[]) => void,
): Unsubscribe {
  return subscribeToUserMessages(trainerId, (messages) => {
    callback(messages as TrainerMessage[]);
  });
}

/**
 * Se suscribe a la conversación entre dos usuarios.
 * @deprecated Usar subscribeToConversation de '@/lib/shared/chat'
 */
export function subscribeToConversation(
  userId1: string,
  userId2: string,
  callback: (messages: TrainerMessage[]) => void,
): Unsubscribe {
  return chatSubscribeToConversation(userId1, userId2, (messages) => {
    callback(messages as TrainerMessage[]);
  });
}

/**
 * Envía un mensaje de chat.
 * @deprecated Usar sendMessage de '@/lib/shared/chat'
 */
export async function sendMessage(
  senderId: string,
  receiverId: string,
  content: string,
  type: 'normal' | 'alert' | 'text' = 'normal',
): Promise<boolean> {
  const mappedType = type === 'normal' ? 'text' : type as 'text' | 'alert';
  const result = await chatSendMessage(senderId, receiverId, content, mappedType);
  if (!result) {
    showToast({ message: 'Error al enviar el mensaje', type: 'error' });
  }
  return result !== null;
}

/**
 * Marca un mensaje como leído.
 * @deprecated Usar markAsRead de '@/lib/shared/chat'
 */
export async function markAsRead(messageId: string): Promise<void> {
  return chatMarkAsRead(messageId);
}

// ============================================================
// Servicios de datos - Progreso
// ============================================================

export interface ProgressLog {
  id: string;
  clientId: string;
  date: { toDate: () => Date } | null;
  weight?: number;
  calories?: number;
  rpe?: number;
  notes?: string;
  createdAt?: { toDate: () => Date } | null;
}

export function subscribeToClientProgress(
  clientId: string,
  callback: (logs: ProgressLog[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'progress_logs'),
    where('clientId', '==', clientId),
    orderBy('date', 'desc'),
    limit(30),
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const logs: ProgressLog[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          clientId: data.clientId || '',
          date: data.date || null,
          weight: data.weight,
          calories: data.calories,
          rpe: data.rpe,
          notes: data.notes,
          createdAt: data.createdAt,
        } as ProgressLog;
      });
      callback(logs);
    },
    (error) => {
      logger.error('Trainer', 'Error al suscribirse a progreso:', error);
    },
  );
}

// ============================================================
// Renderizado de componentes HTML
// ============================================================

export function renderClientCard(client: TrainerClient, onclick?: string): string {
  const name = client.name || 'Sin nombre';
  const email = client.email || '';
  const hasAlert = client.hasActiveAlert;
  const initial = getUserInitial(name);
  const isAdmin = client.role === 'admin';
  const avatarBg = isAdmin ? 'bg-purple-500/10 text-purple-400' : 'bg-emerald-500/10 text-emerald-400';

  return `
    <div class="rounded-xl border border-zinc-800/40 bg-zinc-900/40 p-4 backdrop-blur-sm transition-all hover:border-zinc-700/60 ${onclick ? 'cursor-pointer hover:bg-zinc-800/40' : ''}"
         ${onclick ? `onclick="${onclick}"` : ''}>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3 min-w-0">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-medium ${avatarBg}">
            ${initial}
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <p class="text-sm font-medium text-zinc-200 truncate">${escapeHtml(name)}</p>
              ${hasAlert ? '<span class="h-2 w-2 rounded-full bg-red-500 animate-pulse" title="Alerta activa"></span>' : ''}
              ${isAdmin ? '<span class="rounded-full bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-medium text-purple-400 border border-purple-500/20">Admin</span>' : ''}
            </div>
            <p class="text-xs text-zinc-500 truncate">${escapeHtml(email)}</p>
          </div>
        </div>
        <svg class="h-4 w-4 text-zinc-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </div>
    </div>
  `;
}


export function renderWorkoutCard(workout: TrainerWorkout): string {
  return `
    <div class="rounded-xl border border-zinc-800/40 bg-zinc-900/40 p-4 backdrop-blur-sm transition-all hover:border-zinc-700/60">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-zinc-200">${escapeHtml(workout.name)}</p>
          <p class="text-xs text-zinc-500">${workout.exercises?.length || 0} ejercicios · ${workout.difficulty || 'custom'}</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-400 border border-blue-500/20">${workout.exercises?.length || 0} ej.</span>
        </div>
      </div>
      <div class="mt-2 text-xs text-zinc-600">${workout.description ? escapeHtml(workout.description.substring(0, 80)) + (workout.description.length > 80 ? '...' : '') : ''}</div>
    </div>
  `;
}

export function renderDietCard(diet: TrainerDiet): string {
  return `
    <div class="rounded-xl border border-zinc-800/40 bg-zinc-900/40 p-4 backdrop-blur-sm transition-all hover:border-zinc-700/60">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-zinc-200">${escapeHtml(diet.name)}</p>
          <p class="text-xs text-zinc-500">${diet.meals?.length || 0} comidas · ${diet.totalCalories || 0} kcal</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="rounded-full bg-orange-500/10 px-2 py-0.5 text-xs font-medium text-orange-400 border border-orange-500/20">${diet.totalCalories || 0} kcal</span>
        </div>
      </div>
      <div class="mt-2 text-xs text-zinc-600">Tipo: ${diet.type || 'normal'}</div>
    </div>
  `;
}

export function renderMessageBubble(
  message: TrainerMessage,
  isOwn: boolean,
  showSenderName: string,
  isFirstOfBlock: boolean,
): string {
  const align = isOwn ? 'ml-auto' : 'mr-auto';
  const bg = isOwn
    ? 'bg-emerald-500/20 border-emerald-500/20'
    : 'bg-zinc-800/60 border-zinc-700/40';
  const rounded = isOwn
    ? 'rounded-2xl rounded-br-sm'
    : 'rounded-2xl rounded-bl-sm';
  const time = formatTime(message.createdAt);

  const alertBadge =
    message.type === 'alert'
      ? `<div class="mt-1 flex items-center gap-1 text-xs text-red-400">
           <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
             <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
           </svg>
           Llamado de atención
         </div>`
      : '';

  return `
    <div class="max-w-[80%] ${align}">
      ${isFirstOfBlock && !isOwn ? `<p class="mb-1 text-xs text-zinc-500">${escapeHtml(showSenderName)}</p>` : ''}
      <div class="border px-4 py-2.5 ${bg} ${rounded}">
        <p class="text-sm text-zinc-200">${escapeHtml(message.content)}</p>
        ${alertBadge}
        <p class="mt-1 text-right text-[10px] text-zinc-500">${time}</p>
      </div>
    </div>
  `;
}

// ============================================================
// Re-export desde shared/ui
// ============================================================

export { ICONS, escapeHtml, formatDate, formatTime, getUserInitial, showToast, renderEmptyState, renderLoadingState, getRoleBadge };

// ============================================================
// Auth helpers
// ============================================================

/**
 * Cierra la sesión del usuario actual.
 */
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
    window.location.href = '/login';
  } catch (error) {
    logger.error('Trainer', 'Error al cerrar sesión:', error);
    showToast({ message: 'Error al cerrar sesión', type: 'error' });
  }
}

// ============================================================
// Inicialización global
// ============================================================

export function initGlobalActions(trainerId: string): void {
  (window as unknown as Record<string, unknown>).__trainerId = trainerId;
}
