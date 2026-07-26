/**
 * Servicio de chat unificado para toda la aplicación.
 * Proporciona suscripción a mensajes, envío y marcado como leído.
 * Reemplaza las implementaciones duplicadas en client/chatService.ts,
 * adminUtils.ts y trainerUtils.ts.
 *
 * @module shared/chat
 */

import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc, getDocs, serverTimestamp, limit, startAfter } from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/shared/logger';

// ============================================================
// Tipos
// ============================================================

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  participants: string[];
  content: string;
  type: 'text' | 'alert';
  isRead: boolean;
  createdAt: any;
}

// ============================================================
// Suscripciones
// ============================================================

/**
 * Se suscribe a todos los mensajes de un usuario (para lista de conversaciones).
 * @param userId - ID del usuario
 * @param callback - Función que recibe los mensajes
 * @param onError - Callback opcional de error
 * @returns Función para cancelar la suscripción
 */
export function subscribeToUserMessages(
  userId: string,
  callback: (messages: ChatMessage[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  if (!userId) {
    callback([]);
    return () => { };
  }

  const q = query(
    collection(db, 'messages'),
    where('participants', 'array-contains', userId),
    orderBy('createdAt', 'desc'),
    limit(50),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatMessage[];
      callback(messages);
    },
    (error) => {
      logger.error('Chat', 'Error al suscribirse a mensajes:', error);
      if (onError) onError(error);
      callback([]);
    },
  );
}

/**
 * Se suscribe a la conversación entre dos usuarios.
 * @param userId1 - Primer usuario
 * @param userId2 - Segundo usuario
 * @param callback - Función que recibe los mensajes filtrados
 * @param options - Opciones de paginación
 * @param options.limit - Número máximo de mensajes (default: 50, max: 100)
 * @param options.startAfter - Documento desde el cual empezar (para paginación)
 * @param onError - Callback opcional de error
 * @returns Función para cancelar la suscripción
 */
export function subscribeToConversation(
  userId1: string,
  userId2: string,
  callback: (messages: ChatMessage[]) => void,
  options?: { limit?: number; startAfter?: any },
  onError?: (error: Error) => void,
): Unsubscribe {
  if (!userId1 || !userId2) {
    callback([]);
    return () => { };
  }

  const limitCount = Math.min(options?.limit || 50, 100);

  const constraints: any[] = [
    where('participants', 'array-contains', userId1),
    orderBy('createdAt', 'asc'),
  ];

  if (options?.startAfter) {
    constraints.push(startAfter(options.startAfter));
  }

  constraints.push(limit(limitCount));

  const q = query(collection(db, 'messages'), ...constraints);

  return onSnapshot(
    q,
    (snapshot) => {
      const allMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatMessage[];

      // Filtrar solo mensajes entre estos dos participantes
      const filtered = allMessages.filter(
        (m) =>
          m.participants.includes(userId1) && m.participants.includes(userId2),
      );
      callback(filtered);
    },
    (error) => {
      logger.error('Chat', 'Error al suscribirse a conversación:', error);
      if (onError) onError(error);
      callback([]);
    },
  );
}

// ============================================================
// Acciones
// ============================================================

/**
 * Envía un mensaje entre dos usuarios.
 * @param senderId - ID del remitente
 * @param receiverId - ID del destinatario
 * @param content - Contenido del mensaje
 * @param type - Tipo de mensaje (text o alert)
 * @returns ID del mensaje creado o null si hay error
 */
export async function sendMessage(
  senderId: string,
  receiverId: string,
  content: string,
  type: 'text' | 'alert' = 'text',
): Promise<string | null> {
  if (!senderId || !receiverId || !content?.trim()) {
    logger.error('Chat', 'senderId, receiverId y content son requeridos');
    return null;
  }

  try {
    const participants = [senderId, receiverId].sort();
    const docRef = await addDoc(collection(db, 'messages'), {
      senderId,
      receiverId,
      participants,
      content: content.trim(),
      type,
      isRead: false,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    logger.error('Chat', 'Error al enviar mensaje:', error);
    return null;
  }
}

/**
 * Marca un mensaje como leído.
 * @param messageId - ID del mensaje
 */
export async function markAsRead(messageId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'messages', messageId), { isRead: true });
  } catch (error) {
    logger.error('Chat', 'Error al marcar mensaje como leído:', error);
  }
}

/**
 * Marca como leídos todos los mensajes recibidos de un remitente específico.
 * @param receiverId - ID del destinatario (usuario actual)
 * @param senderId - ID del remitente
 */
export async function markAllAsRead(receiverId: string, senderId: string): Promise<void> {
  if (!receiverId || !senderId) return;
  try {
    const q = query(
      collection(db, 'messages'),
      where('senderId', '==', senderId),
      where('receiverId', '==', receiverId),
      where('isRead', '==', false),
    );
    const snap = await getDocs(q);
    const promises = snap.docs.map((docSnap) => updateDoc(doc(db, 'messages', docSnap.id), { isRead: true }));
    await Promise.all(promises);
  } catch (error) {
    logger.error('Chat', 'Error al marcar mensajes como leídos:', error);
  }
}
