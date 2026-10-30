import { json, notAllowed } from '../server/http.js';
export default {
  fetch(request: Request) {
    if (request.method !== 'GET') return notAllowed();
    return json({ ok: true, service: 'VESTORA', mode: 'education-testnet', runtime: 'vercel-function' });
  }
};
