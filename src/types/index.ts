/**
 * Tipos globales de CampFit
 */

import type { FoodCategory } from '@/lib/shared/foodLibrary';

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
