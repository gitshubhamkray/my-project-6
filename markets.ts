import { getQuotes, marketIds } from '../server/providers.js';
import { json, fail, notAllowed, urlFor } from '../server/http.js';
export default {
  async fetch(request: Request) {
    if (request.method !== 'GET') return notAllowed();
    try {
      const idsParam = urlFor(request).searchParams.get('ids');
      const ids = idsParam
        ? idsParam.split(',').slice(0, 30).filter(id => marketIds.includes(id))
        : undefined;
      if (idsParam && !ids?.length) return json({ error: 'No recognized instrument ids' }, 400);
      return json({
        quotes: await getQuotes(ids),
        fetchedAt: new Date().toISOString(),
        disclaimer: 'Market references are not sample token prices.'
      }, 200, 'public, s-maxage=45, stale-while-revalidate=60');
    } catch { return fail('Market service unavailable'); }
  }
};
