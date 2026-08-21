/**
 * Servicio de Soporte Técnico y Tickets para Clientes y Administradores.
 * Utiliza el SDK cliente de Firestore directamente para autenticación reactiva y soporte offline.
 *
 * @module support/supportTicketService
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

export type TicketCategory = 'bug' | 'misconduct' | 'vulnerability' | 'inquiry' | 'suggestion' | 'other';
export type TicketSeverity = 'low' | 'medium' | 'high' | 'critical';
export type TicketStatus = 'open' | 'in_review' | 'awaiting_response' | 'resolved' | 'closed';

export interface SupportTicketAdminNote {
  content: string;
  adminId?: string;
  adminEmail?: string;
  createdAt: any;
}

export interface SupportTicketContactMessage {
  message: string;
  senderRole?: 'admin' | 'reporter';
  senderEmail?: string;
  createdAt: any;
}

export interface SupportTicket {
  id: string;
  reporterUid: string;
  reporterEmail: string;
  reporterName: string;
  title: string;
  description: string;
  category: TicketCategory;
  severity: TicketSeverity;
  status: TicketStatus;
  isAnonymous: boolean;
  sessionId?: string | null;
  snapshotData?: Record<string, unknown> | null;
  relatedUserId?: string | null;
  relatedEntityType?: string | null;
  relatedEntityName?: string | null;
  adminNotes?: SupportTicketAdminNote[];
  adminContactMessages?: SupportTicketContactMessage[];
  createdAt: any;
  updatedAt: any;
  lastActivityAt: any;
}

export interface CreateSupportTicketPayload {
  reporterUid: string;
  reporterEmail?: string;
  reporterName?: string;
  title: string;
  description: string;
  category: TicketCategory;
  severity?: TicketSeverity;
  isAnonymous?: boolean;
  sessionId?: string | null;
  snapshotData?: Record<string, unknown> | null;
  relatedUserId?: string | null;
  relatedEntityType?: string | null;
  relatedEntityName?: string | null;
}

/**
 * 🔒 CRÍTICO: Crea un ticket de soporte técnico en la colección /support_tickets.
 * Cumple estrictamente con las reglas de seguridad de firestore.rules.
 * serverTimestamp() en createdAt, updatedAt y lastActivityAt es obligatorio.
 */
export async function createSupportTicket(
  payload: CreateSupportTicketPayload,
): Promise<{ success: boolean; ticketId?: string; error?: string }> {
  try {
    if (!payload.reporterUid) {
      return { success: false, error: 'Usuario no identificado.' };
    }
    if (!payload.title || payload.title.trim().length === 0) {
      return { success: false, error: 'El título es obligatorio.' };
    }
    if (payload.title.length > 100) {
      return { success: false, error: 'El título no puede exceder 100 caracteres.' };
    }
    if (!payload.description || payload.description.trim().length === 0) {
      return { success: false, error: 'La descripción es obligatoria.' };
    }

    const isAnon = Boolean(payload.isAnonymous);

    const ticketDocData: Record<string, unknown> = {
      reporterUid: payload.reporterUid,
      reporterEmail: isAnon ? '' : payload.reporterEmail || '',
      reporterName: isAnon ? 'Anónimo' : payload.reporterName || 'Usuario',
      title: payload.title.trim(),
      description: payload.description.trim(),
      category: payload.category || 'inquiry',
      severity: payload.severity || 'medium',
      status: 'open',
      isAnonymous: isAnon,
      sessionId: payload.sessionId || null,
      snapshotData: payload.snapshotData || null,
      relatedUserId: payload.relatedUserId || null,
      relatedEntityType: payload.relatedEntityType || null,
      relatedEntityName: payload.relatedEntityName || null,
      adminNotes: [],
      adminContactMessages: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastActivityAt: serverTimestamp(),
    };

    // 🔒 CRÍTICO: addDoc en /support_tickets valida reporterUid == request.auth.uid
    const docRef = await addDoc(collection(db, 'support_tickets'), ticketDocData);
    logger.info('SupportTicketService', `Ticket creado con éxito: ${docRef.id}`);

    return { success: true, ticketId: docRef.id };
  } catch (err: unknown) {
    logger.error('SupportTicketService', 'Error al crear ticket:', err);
    const msg = err instanceof Error ? err.message : 'Error al registrar el ticket';
    return { success: false, error: msg };
  }
}

/**
 * 🔒 CRÍTICO: Suscripción reactiva a los tickets creados por un usuario cliente.
 * Utiliza consulta por reporterUid y ordenación resiliente en memoria para evitar bloqueos por índices pendientes.
 */
export function subscribeToUserSupportTickets(
  userId: string,
  callback: (tickets: SupportTicket[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  if (!userId) {
    callback([]);
    return () => {};
  }

  // 🔒 CRÍTICO: Permite que el usuario lea únicamente sus propios tickets (regla firestore.rules)
  const q = query(
    collection(db, 'support_tickets'),
    where('reporterUid', '==', userId),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const tickets = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as SupportTicket[];

      // Ordenar por fecha descendente en cliente
      tickets.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
        return timeB - timeA;
      });

      callback(tickets);
    },
    (err) => {
      logger.error('SupportTicketService', 'Error suscribiéndose a tickets de usuario:', err);
      if (onError) onError(err);
      callback([]);
    },
  );
}

/**
 * 🔒 CRÍTICO: Suscripción reactiva para Administradores a todos los tickets de soporte.
 */
export function subscribeToAllSupportTickets(
  callback: (tickets: SupportTicket[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  // 🔒 CRÍTICO: Solo admins tienen permiso de lectura global en /support_tickets
  const q = query(
    collection(db, 'support_tickets'),
    orderBy('createdAt', 'desc'),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const tickets = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as SupportTicket[];
      callback(tickets);
    },
    (err) => {
      logger.error('SupportTicketService', 'Error suscribiéndose a todos los tickets:', err);
      if (onError) onError(err);
      callback([]);
    },
  );
}

/**
 * 🔒 CRÍTICO: Actualiza el estado y añade notas de resolución por parte del staff/admin.
 */
export async function updateSupportTicketStatus(
  ticketId: string,
  newStatus: TicketStatus,
  adminNote?: string,
  existingNotes: SupportTicketAdminNote[] = [],
): Promise<boolean> {
  try {
    const updates: Record<string, any> = {
      status: newStatus,
      updatedAt: serverTimestamp(),
      lastActivityAt: serverTimestamp(),
    };

    if (adminNote && adminNote.trim()) {
      const newNote: SupportTicketAdminNote = {
        content: adminNote.trim(),
        createdAt: new Date().toISOString(),
      };
      updates.adminNotes = [...existingNotes, newNote];
    }

    await updateDoc(doc(db, 'support_tickets', ticketId), updates);
    logger.info('SupportTicketService', `Estado de ticket ${ticketId} actualizado a ${newStatus}`);
    return true;
  } catch (err) {
    logger.error('SupportTicketService', `Error actualizando ticket ${ticketId}:`, err);
    return false;
  }
}

/**
 * 🔒 CRÍTICO: Envía un mensaje de contacto directo del administrador al reporter del ticket.
 */
export async function sendAdminContactMessage(
  ticketId: string,
  message: string,
  adminEmail: string = '',
  existingMessages: SupportTicketContactMessage[] = [],
): Promise<boolean> {
  try {
    if (!message || !message.trim()) return false;

    const newMessage: SupportTicketContactMessage = {
      message: message.trim(),
      senderRole: 'admin',
      senderEmail: adminEmail,
      createdAt: new Date().toISOString(),
    };

    await updateDoc(doc(db, 'support_tickets', ticketId), {
      status: 'awaiting_response',
      adminContactMessages: [...existingMessages, newMessage],
      lastActivityAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    logger.info('SupportTicketService', `Mensaje de administrador enviado en ticket ${ticketId}`);
    return true;
  } catch (err) {
    logger.error('SupportTicketService', `Error enviando mensaje en ticket ${ticketId}:`, err);
    return false;
  }
}
