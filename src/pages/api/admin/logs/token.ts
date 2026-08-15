/**
 * API: Generar token rotativo para acceso de agentes IA a logs.
 *
 * Seguridad:
 * - Solo accesible por administradores autenticados.
 * - Token expira en 24 horas.
 * - Un admin puede revocar tokens eliminándolos de `ia_log_tokens`.
 *
 * @module api/admin/logs/token
 */

import { db } from '@/lib/firebase';
import { requireAdmin } from '@/lib/shared/authGuard';
import { doc, collection, setDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

export const POST = async (request: Request) => {
  try {
    const user = await requireAdmin();

    // 1. Leer body
    const body = await request.json().catch(() => ({}));
    const reason = (body.reason as string | undefined)?.trim() || 'IA agent access';

    // 2. Generar token seguro
    const tokenId = `ia-log-${Date.now()}-${Math.random().toString(36).slice(2, 15)}`;
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 horas

    // 3. Guardar token en Firestore
    const tokenRef = doc(collection(db, 'ia_log_tokens'), tokenId);
    await setDoc(tokenRef, {
      token: tokenId,
      scope: 'logs:read',
      createdAt: serverTimestamp(),
      expiresAt,
      createdBy: user.uid,
      reason,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    // 4. Retornar token al admin
    return new Response(
      JSON.stringify({
        token: tokenId,
        scope: 'logs:read',
        expiresAt: new Date(expiresAt).toISOString(),
        reason,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[API/admin/logs/token] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Unauthorized or internal error' }),
      {
        status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

/**
 * GET: Listar tokens activos del admin actual.
 */
export const GET = async (request: Request) => {
  try {
    if (typeof window === 'undefined' && process.env.NODE_ENV === 'production' && !request.headers.get('cookie')) {
      return new Response(JSON.stringify({ tokens: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const user = await requireAdmin();
    if (!user?.uid) {
      return new Response(JSON.stringify({ tokens: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const tokensQuery = query(
      collection(db, 'ia_log_tokens'),
      where('createdBy', '==', user.uid),
      where('expiresAt', '>', Date.now())
    );
    const snapshot = await getDocs(tokensQuery);

    const tokens = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        scope: data.scope,
        expiresAt: data.expiresAt,
        reason: data.reason,
        createdAt: data.createdAt,
      };
    });

    return new Response(
      JSON.stringify({ tokens }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ tokens: [], error: 'Unauthorized or internal error' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

