/** The existing validated, cookie-isolated PostgreSQL adapter works in a Vercel Function too. */
import express from 'express';
import { readWorkspace, saveWorkspace } from '../server/database.js';
const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '96kb' }));
app.route(['/','/api/workspace']).get(readWorkspace).post(saveWorkspace);
export default app;
