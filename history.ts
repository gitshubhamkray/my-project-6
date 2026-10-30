import { getHistory, marketIds } from '../server/providers.js';
import { json, fail, notAllowed, urlFor } from '../server/http.js';
const RANGES = new Set(['1D','1W','1M','3M','1Y','ALL']);
export default {
  async fetch(request: Request) {
    if (request.method !== 'GET') return notAllowed();
    const params = urlFor(request).searchParams;
    const id = params.get('id') || '';
    const range = params.get('range') || '1M';
    if (!marketIds.includes(id)) return json({ error: 'Unknown instrument' }, 404);
    if (!RANGES.has(range)) return json({ error: 'Invalid time range' }, 400);
    try {
      return json(await getHistory(id, range), 200, 'public, s-maxage=120, stale-while-revalidate=120');
    } catch { return fail('Market history unavailable'); }
  }
};
