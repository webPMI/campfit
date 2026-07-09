import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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

export interface Diet {
  id: string;
  clientId: string;
  trainerId: string;
  name: string;
  type: 'normal' | 'advanced';
  somatotype: 'ectomorph' | 'mesomorph' | 'endomorph';
  totalCalories: number;
  meals: Meal[];
  createdAt: any;
  updatedAt: any;
}

export function subscribeToDiets(
  clientId: string,
  callback: (diets: Diet[]) => void
) {
  const q = query(
    collection(db, 'diets'),
    where('clientId', '==', clientId),
    orderBy('createdAt', 'desc'),
    limit(1)
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Diet)));
  });
}
