/**
 * Tipos globales de CampFit
 */

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
  lastActivityAt?: Timestamp | null;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface MedicalProfile {
  allergies: string[];
  injuries: string[];
  conditions: string[];
  goals: string[];
  experience: 'beginner' | 'intermediate' | 'advanced';
  birthDate?: FireTimestamp;
  height: number;
  initialWeight: number;
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
