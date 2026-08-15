/**
 * API: Consulta de logs de aplicación para administradores.
 *
 * Seguridad:
 * - Solo accesible por usuarios con rol admin.
 * - Filtros: level, feature, userId, search, limit, startAfter.
 *
 * @module api/admin/logs
 */

import { db } from '@/lib/firebase';
import { requireAdmin } from '@/lib/shared/authGuard';
import { collection, query, where, orderBy, limit, startAfter, getDocs, QueryDocumentSnapshot, type QueryConstraint } from 'firebase/firestore';

export const GET = async (request: Request) => {
  try {
    // 1. Verificar que el usuario es admin
    const user = await requireAdmin();

    // 2. Leer parámetros de query
    const url = new URL(request.url);
    const level = url.searchParams.get('level') || undefined;
    const feature = url.searchParams.get('feature') || undefined;
    const userId = url.searchParams.get('userId') || undefined;
    const search = url.searchParams.get('search') || undefined;
    const limitParam = parseInt(url.searchParams.get('limit') || '50', 10);
    const startAfterParam = url.searchParams.get('startAfter') || undefined;

    // 3. Limitar cantidad máxima
    const maxLimit = 100;
    const pageSize = Math.min(limitParam, maxLimit);

    // 4. Construir query base
    const logsRef = collection(db, 'app_logs');
    const constraints: QueryConstraint[] = [];

    // Filtros
    if (level && ['warn', 'error', 'critical'].includes(level)) {
      constraints.push(where('level', '==', level));
    }

    if (feature) {
      constraints.push(where('feature', '==', feature));
    }

    if (userId) {
      constraints.push(where('userId', '==', userId));
    }

    // Ordenar por timestamp descendente
    constraints.push(orderBy('timestamp', 'desc'));

    // Paginación
    if (startAfterParam) {
      constraints.push(startAfter(startAfterParam));
    }

    constraints.push(limit(pageSize));

    // 5. Ejecutar query
    const q = query(logsRef, ...constraints);
    const snapshot = await getDocs(q);

    // 6. Procesar resultados
    const logs = snapshot.docs.map((doc: QueryDocumentSnapshot) => {
      const data = doc.data();
      return {
        id: doc.id,
        timestamp: data.timestamp,
        hash: data.hash,
        occurrenceCount: data.occurrenceCount,
        userId: data.userId,
        userEmailHash: data.userEmailHash,
        userRole: data.userRole,
        activity: data.activity,
        action: data.action,
        feature: data.feature,
        relatedUserId: data.relatedUserId,
        relatedUserRole: data.relatedUserRole,
        relationType: data.relationType,
        url: data.url,
        userAgent: data.userAgent,
        language: data.language,
        viewport: data.viewport,
        level: data.level,
        message: data.message,
        errorName: data.errorName,
        errorStack: data.errorStack,
        errorCode: data.errorCode,
        payload: data.payload,
        sessionId: data.sessionId,
        breadcrumb: data.breadcrumb,
        environment: data.environment,
      };
    });

    // 7. Obtener cursor para siguiente página
    const lastDoc = snapshot.docs[snapshot.docs.length - 1];
    const nextCursor = lastDoc ? lastDoc.id : null;

    // 8. Filtrar por búsqueda de texto si se proporciona
    let filteredLogs = logs;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredLogs = logs.filter((log: { message?: string; userId?: string; activity?: string; action?: string; errorCode?: string }) =>
        (log.message || '').toLowerCase().includes(searchLower) ||
        (log.userId || '').toLowerCase().includes(searchLower) ||
        (log.activity || '').toLowerCase().includes(searchLower) ||
        (log.action || '').toLowerCase().includes(searchLower) ||
        (log.errorCode || '').toLowerCase().includes(searchLower)
      );
    }

    // 9. Retornar respuesta
    return new Response(
      JSON.stringify({
        logs: filteredLogs,
        total: filteredLogs.length,
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
    console.error('[API/logs] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Unauthorized or internal error' }),
      {
        status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};

/**
 * DELETE: Eliminar logs seleccionados (solo admin).
 * Body: { logIds: string[] }
 */
export const DELETE = async (request: Request) => {
  try {
    const user = await requireAdmin();

    const body = await request.json();
    const { logIds } = body as { logIds?: string[] };

    if (!logIds || !Array.isArray(logIds) || logIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'logIds array is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Limitar a 100 logs por petición para evitar abuso
    const idsToDelete = logIds.slice(0, 100);

    // Eliminar en batch
    const { writeBatch, doc } = await import('firebase/firestore');
    const batch = writeBatch(db);

    for (const logId of idsToDelete) {
      const logRef = doc(db, 'app_logs', logId);
      batch.delete(logRef);
    }

    await batch.commit();

    return new Response(
      JSON.stringify({ deleted: idsToDelete.length }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[API/logs DELETE] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Unauthorized or internal error' }),
      {
        status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};
