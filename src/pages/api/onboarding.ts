/**
 * API Route ELIMINADA - No se usa.
 */
export const prerender = true;
export function GET() {
  return new Response(JSON.stringify({ status: 'deprecated' }), {
    headers: { 'Content-Type': 'application/json' },
  });
}