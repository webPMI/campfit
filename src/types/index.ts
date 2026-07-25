import type { Timestamp } from 'firebase/firestore';

export interface User {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'trainer' | 'client';
  hasActiveAlert: boolean;
  assignedTrainerId?: string;
  medicalProfile?: MedicalProfile;
  lastActivityAt?: Timestamp | Date | null;
  createdAt?: Timestamp | Date | null;
  updatedAt?: Timestamp | Date | null;
}

export interface MedicalProfile {
  allergies: string[];
  injuries: string[];
  conditions: string[];
  goals: string[];
  experience: 'beginner' | 'intermediate' | 'advanced';
  birthDate: Timestamp | Date | string | null;
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

export interface AuthError {
  code: string;
  message: string;
}
