/**
 * API: Acceso a logs de aplicación para agentes IA.
 *
 * Seguridad:
 * - Por defecto: cookie de sesión admin existente.
 * - Si hay header `Authorization: Bearer ia-log-...`, valida token rotativo.
 *
 * @module api/ia/logs
 */

import { db } from '@/lib/firebase';
import { requireAdmin } from '@/lib/shared/authGuard';
import { collection, query, where, orderBy, limit, getDocs, type QueryConstraint } from 'firebase/firestore';

export const GET = async (request: Request) => {
  try {
    const authHeader = request.headers.get('authorization') || '';

    if (authHeader.startsWith('Bearer ia-log-')) {
      const token = authHeader.slice(7);
      const tokenQuery = query(collection(db, 'ia_log_tokens'), where('__name__', '==', token), limit(1));
      const tokenDoc = await getDocs(tokenQuery);

      if (tokenDoc.empty) {
        return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
      }

      const tokenData = tokenDoc.docs[0].data();
      if (Date.now() > tokenData.expiresAt) {
        return new Response(JSON.stringify({ error: 'Token expired' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
      }
    } else {
      await requireAdmin();
    }

    const url = new URL(request.url);
    const level = url.searchParams.get('level') || undefined;
    const feature = url.searchParams.get('feature') || undefined;
    const userId = url.searchParams.get('userId') || undefined;
    const limitParam = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 50);

    const logsRef = collection(db, 'app_logs');
    const constraints: QueryConstraint[] = [];

    if (level && ['warn', 'error', 'critical'].includes(level)) {
      constraints.push(where('level', '==', level));
    }

    if (feature) {
      constraints.push(where('feature', '==', feature));
    }

    if (userId) {
      constraints.push(where('userId', '==', userId));
    }

    constraints.push(orderBy('timestamp', 'desc'));
    constraints.push(limit(limitParam));

    const q = query(logsRef, ...constraints);
    const snapshot = await getDocs(q);

    const logs = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        timestamp: data.timestamp,
        level: data.level,
        feature: data.feature,
        activity: data.activity,
        action: data.action,
        message: data.message,
        errorName: data.errorName,
        errorCode: data.errorCode,
        userId: data.userId,
        userRole: data.userRole,
        relatedUserId: data.relatedUserId,
        relatedUserRole: data.relatedUserRole,
        relationType: data.relationType,
        occurrenceCount: data.occurrenceCount,
        breadcrumb: data.breadcrumb,
        payload: data.payload,
      };
    });

    return new Response(
      JSON.stringify({ logs, count: logs.length }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[API/ia/logs] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Unauthorized or internal error' }),
      {
        status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
