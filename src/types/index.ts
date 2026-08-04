/**
 * Tipos globales de CampFit
 */

import type { FoodCategory } from '@/lib/shared/foodLibrary';
import type { ExclusionReason } from '@/lib/shared/exerciseLibrary';

export interface User {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'trainer' | 'client';
  hasActiveAlert: boolean;
  photoURL?: string;
  assignedTrainerId?: string;
  medicalProfile?: MedicalProfile;
  isBlocked?: boolean;
  blockedAt?: any;
  blockedReason?: string;
  blockedBy?: string;
  isDeleted?: boolean;
  deletedAt?: any;
  deletedBy?: string;
  lastActivityAt?: any;
  createdAt?: any;
  updatedAt?: any;
}

export interface DietaryRestrictions {
  glutenFree: boolean;
  lactoseFree: boolean;
  vegan: boolean;
  vegetarian: boolean;
  nutFree: boolean;
  shellfishFree: boolean;
  other: string[];
}

export interface IntoleranceEntry {
  substance: string;
  severity: 'mild' | 'moderate' | 'severe';
  symptoms: string;
}

export interface MedicalProfile {
  // Datos antropométricos
  height: number;
  initialWeight: number;
  birthDate: any;
  gender?: 'male' | 'female' | 'other';
  age?: number;
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

  // Historial médico
  allergies: string[];
  injuries: string[];
  conditions: string[];
  medications: string[];
  surgery: string;

  // Restricciones alimentarias e intolerancias
  dietaryRestrictions: DietaryRestrictions;
  intolerances: IntoleranceEntry[];

  // Metas y experiencia
  goals: string[];
  experience: 'beginner' | 'intermediate' | 'advanced';

  // Contacto de emergencia
  emergencyName: string;
  emergencyPhone: string;

  // Metadatos
  updatedAt?: any;

  // 🔒 CRÍTICO: Alimentos excluidos granularmente por el cliente.
  // Referencia al ID del alimento en foods_library.
  // NUNCA eliminar — se usa en checkDietConflicts() al asignar dietas.
  excludedFoods?: string[];            // Array de foodItem IDs

  // 🔒 CRÍTICO: Categorías de alimentos excluidas por el cliente.
  // Complementa (no reemplaza) los flags existentes en dietaryRestrictions.
  excludedFoodCategories?: FoodCategory[];
}

// ── Preferencias de ejercicios del cliente ───────────────────────────────────

/**
 * Solicitud de cambio de ejercicio iniciada por el cliente.
 * El trainer puede verla en el panel de clientes y marcarla como vista (acknowledged).
 *
 * 🖒 PRIVACIDAD: El estado 'acknowledged' es SOLO para uso interno del trainer.
 * NUNCA exponer este campo en la UI del cliente.
 */
export interface ExerciseRequest {
  exerciseId: string;
  exerciseName: string;    // Copia desnormalizada (sin lookup)
  exerciseNameEn?: string; // Para trazabilidad multilenguaje
  type: 'exclude' | 'un_exclude' | 'add_favorite' | 'remove_favorite';

  // Motivos de exclusión (opcional, solo si type === 'exclude')
  // 🖒 PRIVACIDAD: Los quickReasons sí los puede ver el trainer — son datos sensibles.
  // Manejo con el mismo cuidado que las notas médicas.
  quickReasons?: ExclusionReason[];
  customReason?: string;

  // 🖒 PRIVACIDAD: 'acknowledged' significa que el trainer lo vio.
  // El cliente NUNCA ve este campo en la UI.
  status: 'pending' | 'acknowledged';

  requestedAt: any;        // Firestore Timestamp
  acknowledgedAt?: any;    // Cuando el trainer marcó como visto
  chatMessageId?: string;  // Ref al mensaje de chat generado
}

/**
 * Preferencias de ejercicios del cliente.
 * Coleccion: `user_exercise_prefs/{userId}` — un documento por usuario.
 *
 * 🖒 ACCESO: Solo el propio cliente puede escribir sus preferencias.
 * El trainer (con el cliente asignado) puede leer pero NO escribir.
 * Admin puede leer y escribir.
 */
export interface UserExercisePreferences {
  userId: string;

  // ⭐ Rating 1–5 por ejercicio (exerciseId → rating)
  // 🕒 CRÍTICO: Fuente de verdad para favoritos y exclusiones.
  // Rating 4–5 = favorito sugerido al trainer. Rating 1 = candidato a excluir.
  // NUNCA cambiar el tipo de Record<string, 1|2|3|4|5> a Record<string, number>.
  ratings: Record<string, 1 | 2 | 3 | 4 | 5>;

  // Listas explícitas (pueden diferir del rating)
  // 🕒 CRÍTICO: Persisten incluso si el ejercicio se desactiva en exercises_library.
  // Las rutinas históricas pueden seguir referenciando ejercicios desactivados.
  favorites: string[];    // IDs marcados explícitamente como favorito
  excluded: string[];     // IDs explícitamente excluidos

  // Cola de solicitudes pendientes (el trainer debe revisar)
  // 🕒 CRÍTICO: NUNCA eliminar este array. Es el único historial de solicitudes.
  pendingRequests: ExerciseRequest[];

  updatedAt: any; // Firestore Timestamp
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
}

/**
 * Error de autenticación tipado.
 * Extiende Error para mantener compatibilidad con `instanceof Error`,
 * y añade `code` para identificar el error de Firebase (ej: 'auth/invalid-credential').
 *
 * @example
 * try {
 *   await authService.loginUser(email, password);
 * } catch (err) {
 *   if (err instanceof AuthError) {
 *     showToast(err.code); // 'auth/invalid-credential'
 *   }
 * }
 */
export class AuthError extends Error {
  /** Código de error de Firebase (ej: 'auth/invalid-credential') */
  code: string;

  constructor(code: string, message?: string) {
    super(message || code);
    this.name = 'AuthError';
    this.code = code;
  }
}
