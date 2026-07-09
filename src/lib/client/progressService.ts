import { collection, query, where, orderBy, limit, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface ProgressLog {
  id: string;
  clientId: string;
  type: 'workout' | 'meal' | 'weight' | 'photo';
  date: any;
  value: any;
  createdAt: any;
}

export function subscribeToProgress(
  clientId: string,
  type: 'weight' | 'photo',
  callback: (logs: ProgressLog[]) => void,
  limitCount: number = 30
) {
  const q = query(
    collection(db, 'progress_logs'),
    where('clientId', '==', clientId),
    where('type', '==', type),
    orderBy('date', 'desc'),
    limit(limitCount)
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProgressLog)));
  });
}

export async function registerWeight(clientId: string, weight: number, notes?: string) {
  return addDoc(collection(db, 'progress_logs'), {
    clientId,
    type: 'weight',
    date: serverTimestamp(),
    value: { weight, notes: notes || '' },
    createdAt: serverTimestamp(),
  });
}
