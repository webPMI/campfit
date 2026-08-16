import type { APIRoute } from 'astro';
import { checkR2Health } from '@/lib/server/r2Client';

export const GET: APIRoute = async () => {
  try {
    const health = await checkR2Health();
    return new Response(JSON.stringify(health), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({
        configured: false,
        connected: false,
        error: errorMsg,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
