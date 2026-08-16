import type { APIRoute } from 'astro';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, addDoc, serverTimestamp, query, where, orderBy, limit, startAfter, getDocs, type QueryConstraint } from 'firebase/firestore';

export const POST = async ({ request, cookies }) => {
  try {
    // 1. Verificar autenticación
    const sessionCookie = cookies.get('session') || cookies.get('__session');
    if (!sessionCookie) {
      return new Response(
        JSON.stringify({ error: 'No autenticado. Inicia sesión para reportar un problema.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Verificar que el usuario existe
    const userDoc = await getDoc(doc(db, 'users', sessionCookie));
    if (!userDoc.exists()) {
      return new Response(
        JSON.stringify({ error: 'Usuario no encontrado.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const uid = sessionCookie;
    const userData = userDoc.data();
    const email = userData.email || '';
    const name = userData.name || '';

    // 3. Parsear cuerpo
    const body = await request.json();
    const { title, description, category, severity, relatedUserId, relatedEntityType, relatedEntityName, isAnonymous } = body;

    // 4. Validar campos requeridos
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'El título es requerido.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (title.length > 100) {
      return new Response(
        JSON.stringify({ error: 'El título no puede exceder 100 caracteres.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'La descripción es requerida.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 5. Validar categoría
    const validCategories = ['bug', 'misconduct', 'vulnerability', 'inquiry', 'suggestion', 'other'];
    if (!category || !validCategories.includes(category)) {
      return new Response(
        JSON.stringify({ error: 'Categoría inválida.', validCategories }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 6. Validar severidad
    const validSeverities = ['low', 'medium', 'high', 'critical'];
    const sev = severity || 'medium';
    if (!validSeverities.includes(sev)) {
      return new Response(
        JSON.stringify({ error: 'Severidad inválida.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 7. Determinar si es anónimo
    const anonymous = isAnonymous === true;

    // 8. Calcular hash para detección de duplicados (T-2.3)
    const reportHash = Buffer.from(
      `${title.trim()}-${description.trim()}-${uid}`
    ).toString('base64');

    // 9. Crear el ticket
    const ticketData = {
      reporterUid: uid,
      reporterEmail: anonymous ? '' : email,
      reporterName: anonymous ? '' : name,
      title: title.trim(),
      description: description.trim(),
      category,
      severity: sev,
      relatedUserId: relatedUserId || null,
      relatedEntityType: relatedEntityType || null,
      relatedEntityName: relatedEntityName || null,
      attachments: [],
      status: 'open',
      adminNotes: [],
      adminContactMessages: [],
      isAnonymous: anonymous,
      reportHash,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastActivityAt: serverTimestamp(),
      statusHistory: [{
        status: 'open',
        changedAt: serverTimestamp(),
        changedBy: uid,
        note: 'Ticket creado por el usuario.'
      }]
    };

    const ticketRef = await addDoc(collection(db, 'support_tickets'), ticketData);

    // 10. Responder
    return new Response(
      JSON.stringify({
        success: true,
        ticketId: ticketRef.id,
        message: anonymous
          ? 'Tu reporte ha sido enviado anónimamente. Si necesitamos más información, publicaremos una respuesta en esta página.'
          : 'Tu reporte ha sido enviado. Un administrador lo revisará y contactará contigo si es necesario.',
        ticket: {
          id: ticketRef.id,
          status: 'open',
          category,
          severity: sev,
          isAnonymous: anonymous,
          createdAt: new Date().toISOString(),
        }
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('[API/support/tickets POST] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor. Intenta nuevamente más tarde.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const GET = async ({ request, cookies }) => {
  try {
    // 1. Verificar que es admin
    const sessionCookie = cookies.get('session') || cookies.get('__session');
    if (!sessionCookie) {
      return new Response(
        JSON.stringify({ error: 'No autenticado. Solo admins pueden ver tickets.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Verificar rol admin desde documento de usuario
    const userDoc = await getDoc(doc(db, 'users', sessionCookie));
    if (!userDoc.exists()) {
      return new Response(
        JSON.stringify({ error: 'Usuario no encontrado.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const userData = userDoc.data();
    const isAdminUser = userData.role === 'admin' ||
      sessionCookie === 'servicioweb.pmi@gmail.com' ||
      sessionCookie === 'sevicioweb.pmi@gmail.com';

    if (!isAdminUser) {
      return new Response(
        JSON.stringify({ error: 'No autorizado. Solo admins pueden ver todos los tickets.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Leer parámetros de query
    const url = new URL(request.url);
    const statusFilter = url.searchParams.get('status') || undefined;
    const categoryFilter = url.searchParams.get('category') || undefined;
    const severityFilter = url.searchParams.get('severity') || undefined;
    const search = url.searchParams.get('search') || undefined;
    const limitParam = parseInt(url.searchParams.get('limit') || '50', 10);
    const startAfterParam = url.searchParams.get('startAfter') || undefined;

    // 4. Limitar cantidad máxima
    const maxLimit = 100;
    const pageSize = Math.min(limitParam, maxLimit);

    // 5. Construir query base
    const ticketsRef = collection(db, 'support_tickets');
    const constraints: QueryConstraint[] = [];

    // Filtros
    if (statusFilter && ['open', 'in_review', 'awaiting_response', 'resolved', 'closed'].includes(statusFilter)) {
      constraints.push(where('status', '==', statusFilter));
    }

    if (categoryFilter && ['bug', 'misconduct', 'vulnerability', 'inquiry', 'suggestion', 'other'].includes(categoryFilter)) {
      constraints.push(where('category', '==', categoryFilter));
    }

    if (severityFilter && ['low', 'medium', 'high', 'critical'].includes(severityFilter)) {
      constraints.push(where('severity', '==', severityFilter));
    }

    // Ordenar por lastActivityAt descendente (tickets más activos primero)
    constraints.push(orderBy('lastActivityAt', 'desc'));

    // Paginación
    if (startAfterParam) {
      constraints.push(startAfter(startAfterParam));
    }

    constraints.push(limit(pageSize));

    // 6. Ejecutar query
    const q = query(ticketsRef, ...constraints);
    const snapshot = await getDocs(q);

    // 7. Procesar resultados
    const tickets = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        reporterUid: data.reporterUid,
        reporterEmail: data.reporterEmail,
        reporterName: data.reporterName,
        title: data.title,
        description: data.description,
        category: data.category,
        severity: data.severity,
        relatedUserId: data.relatedUserId,
        relatedEntityType: data.relatedEntityType,
        relatedEntityName: data.relatedEntityName,
        attachments: data.attachments || [],
        status: data.status,
        adminNotes: data.adminNotes || [],
        adminContactMessages: data.adminContactMessages || [],
        isAnonymous: data.isAnonymous || false,
        createdAt: data.createdAt?.toDate().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString(),
        lastActivityAt: data.lastActivityAt?.toDate().toISOString(),
        assignedAdminId: data.assignedAdminId,
        resolvedAt: data.resolvedAt?.toDate().toISOString(),
      };
    });

    // 8. Obtener cursor para siguiente página
    const lastDoc = snapshot.docs[snapshot.docs.length - 1];
    const nextCursor = lastDoc ? lastDoc.id : null;

    // 9. Filtrar por búsqueda de texto
    let filteredTickets = tickets;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredTickets = tickets.filter((ticket) =>
        (ticket.title || '').toLowerCase().includes(searchLower) ||
        (ticket.description || '').toLowerCase().includes(searchLower) ||
        (ticket.reporterName || '').toLowerCase().includes(searchLower) ||
        (ticket.reporterEmail || '').toLowerCase().includes(searchLower)
      );
    }

    // 10. Retornar respuesta
    return new Response(
      JSON.stringify({
        tickets: filteredTickets,
        total: filteredTickets.length,
        page: 1,
        pageSize,
        nextCursor,
        hasMore: snapshot.docs.length >= pageSize,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('[API/support/tickets GET] Error:', error);
    return new Response(
      JSON.stringify({ tickets: [], total: 0, error: 'Error interno al consultar tickets.' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};
