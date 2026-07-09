import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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

export interface Workout {
  id: string;
  clientId: string;
  trainerId: string;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'custom';
  description: string;
  exercises: Exercise[];
  createdAt: any;
  updatedAt: any;
}

export function subscribeToWorkouts(
  clientId: string,
  callback: (workouts: Workout[]) => void
) {
  const q = query(
    collection(db, 'workouts'),
    where('clientId', '==', clientId),
    orderBy('createdAt', 'desc'),
    limit(1)
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workout)));
  });
}
