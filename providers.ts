import { databaseEnabled } from '../server/database.js';
import { json, notAllowed } from '../server/http.js';
export default {
  fetch(request: Request) {
    if (request.method !== 'GET') return notAllowed();
    return json({
      coingecko: true,
      twelveData: Boolean(process.env.TWELVE_DATA_API_KEY),
      metalsDev: Boolean(process.env.METALS_DEV_API_KEY),
      fred: Boolean(process.env.FRED_API_KEY),
      ai: Boolean(process.env.OPENAI_API_KEY),
      database: databaseEnabled
    });
  }
};
