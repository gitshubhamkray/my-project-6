import {createHmac,randomUUID,timingSafeEqual} from 'node:crypto';
import type {Request,Response} from 'express';
import pg from 'pg';
const secret=process.env.SESSION_SECRET||'';
const enabled=!!process.env.DATABASE_URL&&secret.length>=32;
let pool:pg.Pool|null=null;
export const databaseEnabled=enabled;
function getPool(){if(!enabled)throw new Error('DATABASE_URL and SESSION_SECRET (32+ chars) required');if(!pool)pool=new pg.Pool({connectionString:process.env.DATABASE_URL,ssl:process.env.DATABASE_SSL==='true'?{rejectUnauthorized:true}:undefined,max:5,idleTimeoutMillis:30000});return pool}
const sign=(id:string)=>createHmac('sha256',secret).update(id).digest('base64url');
function session(req:Request,res:Response):string{
 const cookie=(req.headers.cookie||'').split(';').map(p=>p.trim()).find(p=>p.startsWith('vestora_session='))?.split('=')[1];
 if(cookie){const [id,signature]=cookie.split('.');if(/^[0-9a-f-]{36}$/.test(id||'')&&signature){const expected=sign(id);if(signature.length===expected.length&&timingSafeEqual(Buffer.from(signature),Buffer.from(expected)))return id}}
 const id=randomUUID();res.setHeader('Set-Cookie',`vestora_session=${id}.${sign(id)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000${process.env.NODE_ENV==='production'?'; Secure':''}`);return id;
}
export async function readWorkspace(req:Request,res:Response){if(!enabled)return res.status(503).json({error:'Optional PostgreSQL sync is not configured'});try{const id=session(req,res);const result=await getPool().query('SELECT data, updated_at FROM demo_workspaces WHERE id=$1',[id]);return res.json({data:result.rows[0]?.data||null,updatedAt:result.rows[0]?.updated_at||null})}catch{return res.status(503).json({error:'Workspace database unavailable'})}}
export async function saveWorkspace(req:Request,res:Response){if(!enabled)return res.status(503).json({error:'Optional PostgreSQL sync is not configured'});const x=req.body;
 if(!x||typeof x!=='object'||Array.isArray(x)||!x.holdings||typeof x.holdings!=='object'||!Array.isArray(x.watchlist)||!Array.isArray(x.transactions)||!Array.isArray(x.alerts)||!Number.isFinite(x.demoCash)||!['dark','light'].includes(x.theme))return res.status(400).json({error:'Invalid workspace data'});
 if(Object.keys(x.holdings).length>40||x.watchlist.length>50||x.transactions.length>250||x.alerts.length>100||x.demoCash<0||x.demoCash>10000000)return res.status(400).json({error:'Workspace payload exceeds limits'});
 // Explicit allow-list. The mock KYC form name/email are NEVER persisted here.
 const data={holdings:x.holdings,watchlist:x.watchlist,transactions:x.transactions,alerts:x.alerts,demoCash:x.demoCash,theme:x.theme};
 try{const id=session(req,res);await getPool().query('INSERT INTO demo_workspaces (id,data) VALUES ($1,$2::jsonb) ON CONFLICT (id) DO UPDATE SET data=$2::jsonb,updated_at=NOW()',[id,JSON.stringify(data)]);return res.json({saved:true,at:new Date().toISOString()})}catch{return res.status(503).json({error:'Workspace database unavailable'})}
}
