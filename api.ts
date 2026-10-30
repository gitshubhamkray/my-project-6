export interface Quote {id:string;price:number|null;changePct:number|null;status:'Live'|'Delayed'|'Unavailable';source:string|null;asOf:string|null;currency:string;unit:string;note?:string;changePeriod?:string}
export interface HistoryPoint {time:number;value:number}
export interface History {id:string;points:HistoryPoint[];status:'Live'|'Delayed'|'Unavailable';source:string|null;unit:string;note?:string;changePeriod?:string}
const call=async<T>(url:string,opts?:RequestInit):Promise<T>=>{const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),16000);try{const r=await fetch(url,{...opts,signal:controller.signal});if(!r.ok)throw new Error(`Request failed (${r.status})`);return await r.json() as T}finally{clearTimeout(timeout)}};
export async function fetchMarkets():Promise<Quote[]>{const data=await call<{quotes:Quote[]}>('/api/markets');return data.quotes}
export async function fetchHistory(id:string,range:string):Promise<History>{return call<History>(`/api/history?id=${encodeURIComponent(id)}&range=${encodeURIComponent(range)}`)}
export async function askIntelligence(asset:string,question:string,riskScore:number):Promise<{mode:string;answer:string;disclaimer:string}>{return call('/api/intelligence',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({asset,question,riskScore})})}

export interface NewsItem {title:string;url:string;publishedAt:string|null;source:string}
export async function fetchNews():Promise<{items:NewsItem[];status:string;source:string}>{return call('/api/news')}
