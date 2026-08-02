/**
 * Servicio de chat unificado para toda la aplicación.
 * Proporciona suscripción a mensajes, envío y marcado como leído.
 * Reemplaza las implementaciones duplicadas en client/chatService.ts,
 * adminUtils.ts y trainerUtils.ts.
 *
 * @module shared/chat
 */

import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc, getDoc, serverTimestamp, limit, getDocs } from 'firebase/firestore';
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

export interface ChatContact {
  uid: string;
  name: string;
  email: string;
  role: 'client' | 'trainer' | 'admin';
  assignedTrainerId?: string;
  hasActiveAlert?: boolean;
}

// ============================================================
// Suscripciones y Contactos
// ============================================================

/**
 * Se suscribe a la lista de contactos disponibles según el rol del usuario conectado.
 * @param currentUserId - UID del usuario actual
 * @param currentUserRole - Rol del usuario ('client' | 'trainer' | 'admin')
 * @param callback - Función que recibe la lista de contactos
 * @returns Función de cancelación de suscripción
 */
export function subscribeToChatContacts(
  currentUserId: string,
  currentUserRole: 'client' | 'trainer' | 'admin',
  callback: (contacts: ChatContact[]) => void,
): Unsubscribe {
  if (!currentUserId) {
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, 'users'),
    orderBy('createdAt', 'desc'),
    limit(100),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const allUsers = snapshot.docs
        .map((docSnap) => {
          const data = docSnap.data();
          return {
            uid: docSnap.id,
            name: data.name || data.email || 'Usuario',
            email: data.email || '',
            role: (data.role as 'client' | 'trainer' | 'admin') || 'client',
            assignedTrainerId: data.assignedTrainerId,
            hasActiveAlert: data.hasActiveAlert ?? false,
          } as ChatContact;
        })
        .filter((user) => user.uid !== currentUserId);

      if (currentUserRole === 'trainer') {
        const filtered = allUsers.filter(
          (u) =>
            u.role === 'admin' ||
            u.role === 'trainer' ||
            (u.role === 'client' && u.assignedTrainerId === currentUserId),
        );
        callback(filtered);
      } else if (currentUserRole === 'client') {
        const filtered = allUsers.filter(
          (u) => u.role === 'admin' || u.role === 'trainer',
        );
        callback(filtered);
      } else {
        callback(allUsers);
      }
    },
    (error) => {
      logger.error('Chat', 'Error al suscribirse a contactos:', error);
      callback([]);
    },
  );
}

/**
 * Obtiene el perfil básico de un contacto por su UID.
 */
export async function getUserProfile(uid: string): Promise<ChatContact | null> {
  if (!uid) return null;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      const data = snap.data();
      return {
        uid: snap.id,
        name: data.name || data.email || 'Usuario',
        email: data.email || '',
        role: (data.role as 'client' | 'trainer' | 'admin') || 'client',
        assignedTrainerId: data.assignedTrainerId,
        hasActiveAlert: data.hasActiveAlert ?? false,
      };
    }
    return null;
  } catch (error) {
    logger.error('Chat', 'Error obteniendo perfil de usuario:', error);
    return null;
  }
}

// ============================================================
// Suscripciones
// ============================================================

/**
 * Se suscribe al conteo y lista de mensajes no leídos dirigidos a un usuario.
 * @param userId - ID del usuario receptor
 * @param callback - Función invocada con el número total de mensajes no leídos y los mensajes
 * @param onError - Callback opcional de error
 * @returns Función para cancelar la suscripción
 */
export function subscribeToUnreadCount(
  userId: string,
  callback: (unreadCount: number, unreadMessages: ChatMessage[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  if (!userId) {
    callback(0, []);
    return () => {};
  }

  const q = query(
    collection(db, 'messages'),
    where('receiverId', '==', userId),
    where('isRead', '==', false),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatMessage[];
      callback(messages.length, messages);
    },
    (error) => {
      logger.error('Chat', 'Error al suscribirse a conteo de mensajes no leídos:', error);
      if (onError) onError(error);
      callback(0, []);
    },
  );
}

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
    return () => {};
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
 * @param onError - Callback opcional de error
 * @returns Función para cancelar la suscripción
 */
export function subscribeToConversation(
  userId1: string,
  userId2: string,
  callback: (messages: ChatMessage[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  if (!userId1 || !userId2) {
    callback([]);
    return () => {};
  }

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
    const docRef = await addDoc(collection(db, 'messages'), {
      senderId,
      receiverId,
      participants: [senderId, receiverId],
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

function docRef(messageId: string) {
  return doc(db, 'messages', messageId);
}

/**
 * Marca como leídos todos los mensajes recibidos de un remitente específico.
 * @param receiverId - ID del receptor actual
 * @param senderId - ID del remitente
 */
export async function markAllMessagesFromSenderAsRead(
  receiverId: string,
  senderId: string,
): Promise<void> {
  if (!receiverId || !senderId) return;

  try {
    const q = query(
      collection(db, 'messages'),
      where('receiverId', '==', receiverId),
      where('senderId', '==', senderId),
      where('isRead', '==', false),
    );

    const snapshot = await getDocs(q);
    const updates = snapshot.docs.map((docSnap) =>
      updateDoc(doc(db, 'messages', docSnap.id), { isRead: true }),
    );
    await Promise.all(updates);
  } catch (error) {
    logger.error('Chat', 'Error marcando mensajes como leídos:', error);
  }
}

