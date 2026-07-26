import type { Timestamp } from 'firebase/firestore';

import type { Timestamp } from 'firebase/firestore';

export type FireTimestamp = Timestamp | Date | string;

export interface User {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'trainer' | 'client';
  hasActiveAlert: boolean;
  assignedTrainerId?: string;
  medicalProfile?: MedicalProfile;
<<<<<<< HEAD
  lastActivityAt?: Timestamp | null;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
=======
  lastActivityAt?: Timestamp | Date | null;
  createdAt?: Timestamp | Date | null;
  updatedAt?: Timestamp | Date | null;
>>>>>>> 4042d86ac520c28484786564a781e3d6e901af5a
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

export class AuthError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}
