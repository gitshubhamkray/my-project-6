import { answerQuestion } from '../server/ai.js';
import { json, fail, notAllowed } from '../server/http.js';
export default {
  async fetch(request: Request) {
    if (request.method !== 'POST') return notAllowed();
    try {
      const contentLength = Number(request.headers.get('content-length') || '0');
      if (contentLength > 16_384) return json({ error: 'Question is too long' }, 413);
      const payload: unknown = await request.json();
      if (!payload || typeof payload !== 'object' || Array.isArray(payload))
        return json({ error: 'Invalid request body' }, 400);
      const { asset, question, riskScore } = payload as Record<string,unknown>;
      if (typeof asset !== 'string' || asset.length > 50 || typeof question !== 'string'
        || question.trim().length < 3 || question.length > 500 || typeof riskScore !== 'number'
        || !Number.isFinite(riskScore) || riskScore < 0 || riskScore > 100)
        return json({ error: 'Please enter a valid question and asset' }, 400);
      return json(await answerQuestion(asset,question,riskScore));
    } catch { return fail('Assistant unavailable'); }
  }
};
