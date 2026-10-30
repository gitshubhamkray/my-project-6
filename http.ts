/** Small shared response helpers for Vercel's Web Request API. */
export const json = (data: unknown, status = 200, cache = 'no-store') =>
  Response.json(data, {
    status,
    headers: {
      'Cache-Control': cache,
      'X-Content-Type-Options': 'nosniff'
    }
  });
export const notAllowed = () => json({ error: 'Method not allowed' }, 405);
export const fail = (message: string, status = 503) => json({ error: message }, status);
export const urlFor = (request: Request) => new URL(request.url);
