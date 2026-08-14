/**
 * Servicios de datos para chat/mensajería del entrenador.
 *
 * @module trainerChat
 */

import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { logger } from '@/lib/shared/logger';
import { showToast } from '@/lib/shared/ui';
import type { TrainerMessage } from './types';

/**
 * Se suscribe a las conversaciones de un usuario (participante).
 */
export function subscribeToConversations(
  userId: string,
  callback: (messages: TrainerMessage[]) => void,
): Unsubscribe {
  // 🔒 CRÍTICO: array-contains + orderBy filtran conversaciones donde el usuario es participante.
  // Sin array-contains, el usuario vería TODOS los mensajes del sistema.
  const q = query(
    collection(db, 'messages'),
    where('participants', 'array-contains', userId),
    orderBy('createdAt', 'desc'),
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TrainerMessage[];
      callback(messages);
    },
    (error) => {
      logger.error('Trainer', 'Error al suscribirse a conversaciones:', error);
    },
  );
}

/**
 * Se suscribe a los mensajes de una conversación específica (entre dos usuarios).
 */
export function subscribeToConversation(
  userId1: string,
  userId2: string,
  callback: (messages: TrainerMessage[]) => void,
): Unsubscribe {
  // 🔒 CRÍTICO: orderBy('createdAt', 'asc') ordena mensajes cronológicamente (más antiguo primero).
  // Sin esto, los mensajes aparecerían en orden inverso y el chat sería confuso.
  const q = query(
    collection(db, 'messages'),
    where('participants', 'array-contains', userId1),
    orderBy('createdAt', 'asc'),
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const allMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TrainerMessage[];
      const messages = allMessages.filter((m) => m.participants?.includes(userId2));
      callback(messages);
    },
    (error) => {
      logger.error('Trainer', 'Error al suscribirse a conversación:', error);
    },
  );
}

/**
 * Envía un mensaje.
 */
export async function sendMessage(
  senderId: string,
  receiverId: string,
  content: string,
  type: 'text' | 'alert' | 'media' = 'text',
  mediaUrl?: string,
  mediaType?: 'image' | 'video',
): Promise<string | null> {
  try {
    const participants = [senderId, receiverId].sort();
    const payload: Record<string, any> = {
      senderId,
      receiverId,
      content,
      type,
      participants,
      isRead: false,
      createdAt: serverTimestamp(),
    };
    if (mediaUrl) {
      payload.mediaUrl = mediaUrl;
      payload.mediaType = mediaType || 'image';
    }
    const docRef = await addDoc(collection(db, 'messages'), payload);
    return docRef.id;
  } catch (error) {
    logger.error('Trainer', 'Error al enviar mensaje:', error);
    showToast({ message: 'Error al enviar el mensaje', type: 'error' });
    return null;
  }
}

/**
 * Marca un mensaje como leído.
 */
export async function markAsRead(messageId: string): Promise<boolean> {
  try {
    await updateDoc(doc(db, 'messages', messageId), {
      isRead: true,
    });
    return true;
  } catch (error) {
    logger.error('Trainer', 'Error al marcar mensaje como leído:', error);
    return false;
  }
}
