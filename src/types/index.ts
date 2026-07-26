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

export interface MedicalProfile {
  allergies: string[];
  injuries: string[];
  conditions: string[];
  goals: string[];
  experience: 'beginner' | 'intermediate' | 'advanced';
<<<<<<< HEAD
  birthDate?: FireTimestamp;
=======
  birthDate: Timestamp | Date | string | null;
>>>>>>> 4042d86ac520c28484786564a781e3d6e901af5a
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
