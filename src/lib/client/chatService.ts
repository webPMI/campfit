import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  participants: string[];
  content: string;
  type: 'text' | 'alert';
  isRead: boolean;
  createdAt: any;
}

export function subscribeToMessages(
  userId: string,
  callback: (messages: Message[]) => void
) {
  const chatQuery = query(
    collection(db, 'messages'),
    where('participants', 'array-contains', userId),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(chatQuery, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)));
  });
}

export async function sendMessage(
  senderId: string,
  receiverId: string,
  content: string
) {
  return addDoc(collection(db, 'messages'), {
    senderId,
    receiverId,
    participants: [senderId, receiverId],
    content,
    type: 'text',
    isRead: false,
    createdAt: serverTimestamp(),
  });
}
