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

export interface MedicalProfile {
  allergies: string[];
  injuries: string[];
  conditions: string[];
  goals: string[];
  experience: 'beginner' | 'intermediate' | 'advanced';
  birthDate: any;
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
