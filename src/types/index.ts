/**
 * Tipos globales de CampFit
 */

export interface User {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'trainer' | 'client';
  hasActiveAlert: boolean;
  assignedTrainerId?: string;
  medicalProfile?: MedicalProfile;
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

export interface AuthError {
  code: string;
  message: string;
}
