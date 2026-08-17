import type { APIRoute } from 'astro';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';

export const PATCH: APIRoute = async ({ params, request, cookies }) => {
  try {
    // 1. Extraer ticketId de la URL
    const { id } = params;
    if (!id || typeof id !== 'string') {
      return new Response(
        JSON.stringify({ error: 'ID de ticket inválido.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Verificar que es admin
    const sessionUid = cookies.get('session')?.value || cookies.get('__session')?.value;
    if (!sessionUid) {
      return new Response(
        JSON.stringify({ error: 'No autenticado. Solo admins pueden actualizar tickets.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const userDoc = await getDoc(doc(db, 'users', sessionUid));
    if (!userDoc.exists()) {
      return new Response(
        JSON.stringify({ error: 'Usuario no encontrado.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const userData = userDoc.data();
    const isAdminUser = userData.role === 'admin' ||
      sessionUid === 'servicioweb.pmi@gmail.com' ||
      sessionUid === 'sevicioweb.pmi@gmail.com';

    if (!isAdminUser) {
      return new Response(
        JSON.stringify({ error: 'No autorizado. Solo admins pueden actualizar tickets.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Verificar que el ticket existe
    const ticketDoc = await getDoc(doc(db, 'support_tickets', id));
    if (!ticketDoc.exists()) {
      return new Response(
        JSON.stringify({ error: 'Ticket no encontrado.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const ticketData = ticketDoc.data();

    // 4. Parsear cuerpo
    const body = await request.json();
    const { action, status, adminNote, contactMessage, assignedAdminId, severity } = body;

    // 5. Validar acción
    if (!action || !['status_change', 'add_note', 'contact', 'assign', 'resolve'].includes(action)) {
      return new Response(
        JSON.stringify({ error: 'Acción inválida.', validActions: ['status_change', 'add_note', 'contact', 'assign', 'resolve'] }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 6. Validar campos según acción
    if (action === 'status_change' && (!status || !['open', 'in_review', 'awaiting_response', 'resolved', 'closed'].includes(status))) {
      return new Response(
        JSON.stringify({ error: 'Estado inválido.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'add_note' && (!adminNote || typeof adminNote !== 'string' || adminNote.trim().length === 0)) {
      return new Response(
        JSON.stringify({ error: 'La nota del admin es requerida.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'contact' && (!contactMessage || typeof contactMessage !== 'string' || contactMessage.trim().length === 0)) {
      return new Response(
        JSON.stringify({ error: 'El mensaje de contacto es requerido.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'contact' && ticketData.isAnonymous) {
      return new Response(
        JSON.stringify({ error: 'No se puede contactar a un reporter anónimo.', isAnonymous: true }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 7. Construir actualización
    const updates: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
      lastActivityAt: serverTimestamp(),
    };

    const statusHistoryEntry = {
      status: ticketData.status,
      changedAt: serverTimestamp(),
      changedBy: sessionUid,
      note: '',
    };

    switch (action) {
      case 'status_change': {
        updates.status = status;
        statusHistoryEntry.status = status;
        statusHistoryEntry.note = `Estado cambiado a "${status}" por admin.`;
        updates.statusHistory = arrayUnion(statusHistoryEntry);

        if (status === 'resolved') {
          updates.resolvedAt = serverTimestamp();
        }
        break;
      }

      case 'add_note': {
        const noteEntry = {
          id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36),
          adminId: sessionUid,
          adminName: userData.name || 'Admin',
          content: adminNote.trim(),
          createdAt: serverTimestamp(),
        };
        updates.adminNotes = arrayUnion(noteEntry);
        statusHistoryEntry.note = `Nota interna añadida por admin.`;
        updates.statusHistory = arrayUnion(statusHistoryEntry);
        break;
      }

      case 'contact': {
        const msgEntry = {
          id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36),
          adminId: sessionUid,
          adminName: userData.name || 'Admin',
          message: contactMessage.trim(),
          createdAt: serverTimestamp(),
        };
        updates.adminContactMessages = arrayUnion(msgEntry);
        statusHistoryEntry.note = `Admin contactó al reporter.`;
        updates.statusHistory = arrayUnion(statusHistoryEntry);
        // Si estaba en 'open', pasar a 'in_review' cuando el admin contacta
        if (ticketData.status === 'open') {
          updates.status = 'in_review';
          statusHistoryEntry.status = 'in_review';
          statusHistoryEntry.note = `Estado cambiado a "in_review" porque admin contactó al reporter.`;
        }
        break;
      }

      case 'assign': {
        if (!assignedAdminId || typeof assignedAdminId !== 'string') {
          return new Response(
            JSON.stringify({ error: 'ID de admin asignado es requerido.' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
        updates.assignedAdminId = assignedAdminId;
        statusHistoryEntry.note = `Ticket asignado a admin ID ${assignedAdminId}.`;
        updates.statusHistory = arrayUnion(statusHistoryEntry);
        break;
      }

      case 'resolve': {
        // Resolver = marcar como resolved con nota opcional
        updates.status = 'resolved';
        updates.resolvedAt = serverTimestamp();
        statusHistoryEntry.status = 'resolved';
        statusHistoryEntry.note = adminNote
          ? `Ticket resuelto por admin. Nota: ${adminNote.trim()}`
          : 'Ticket resuelto por admin.';
        updates.statusHistory = arrayUnion(statusHistoryEntry);
        if (adminNote && typeof adminNote === 'string' && adminNote.trim().length > 0) {
          const noteEntry = {
            id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36),
            adminId: sessionUid,
            adminName: userData.name || 'Admin',
            content: adminNote.trim(),
            createdAt: serverTimestamp(),
          };
          updates.adminNotes = arrayUnion(noteEntry);
        }
        break;
      }
    }

    // 8. Actualizar documento
    await updateDoc(doc(db, 'support_tickets', id), updates);

    // 9. Responder
    return new Response(
      JSON.stringify({
        success: true,
        ticketId: id,
        message: `Ticket actualizado (${action}).`,
        newStatus: updates.status || ticketData.status,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('[API/support/tickets PATCH] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
