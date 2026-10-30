import { getNews } from '../server/news.js';
import { json, fail, notAllowed } from '../server/http.js';
export default {
  async fetch(request: Request) {
    if (request.method !== 'GET') return notAllowed();
    try { return json(await getNews(), 200, 'public, s-maxage=300, stale-while-revalidate=300'); }
    catch { return fail('News unavailable'); }
  }
};
