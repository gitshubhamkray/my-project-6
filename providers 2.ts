/* Market references are distinct from illustrative token prices.
   No historical prices, percentage changes or last-updated timestamps are fabricated. */
export type MarketStatus = 'Live' | 'Delayed' | 'Unavailable';
export interface Quote { id: string; price: number | null; changePct: number | null; status: MarketStatus; source: string | null; asOf: string | null; currency: string; unit: string; note?: string; changePeriod?: string; }
export interface Point { time: number; value: number }
export interface History { id: string; points: Point[]; status: MarketStatus; source: string | null; unit: string; note?: string; changePeriod?: string; }
const CG_IDS: Record<string,string>={bitcoin:'bitcoin',ethereum:'ethereum',solana:'solana',xrp:'ripple'};
const TD_SYMBOLS: Record<string,string>={gold:'XAU/USD',silver:'XAG/USD',platinum:'XPT/USD',palladium:'XPD/USD',wti:'WTI',brent:'BRENT',gas:'NG',gasoline:'RB',copper:'HG',aluminium:'ALI',nickel:'NICKEL',zinc:'ZINC',lead:'LEAD',tin:'TIN',wheat:'ZW',corn:'ZC',soybeans:'ZS',coffee:'KC',cocoa:'CC',sugar:'SB',cotton:'CT'};
const UNIT: Record<string,string>={gold:'USD / troy oz',silver:'USD / troy oz',platinum:'USD / troy oz',palladium:'USD / troy oz',wti:'USD / barrel',brent:'USD / barrel',gas:'USD / MMBtu',gasoline:'USD / gallon',copper:'USD / lb',aluminium:'USD / metric ton',nickel:'USD / metric ton',zinc:'USD / metric ton',lead:'USD / metric ton',tin:'USD / metric ton',wheat:'USD / bushel',corn:'USD / bushel',soybeans:'USD / bushel',coffee:'USD / lb',cocoa:'USD / metric ton',sugar:'USD / lb',cotton:'USD / lb',bitcoin:'USD / BTC',ethereum:'USD / ETH',solana:'USD / SOL',xrp:'USD / XRP',treasury:'% annual yield', 'real-estate':'Not applicable'};
const ids = Object.keys(UNIT);
export const marketIds=ids;
const validNumber=(x:any):number|null=>x!==null&&x!==undefined&&x!==''&&Number.isFinite(Number(x))&&Number(x)>0?Number(x):null;
const iso=(value:any):string|null=>{if(!value)return null;const d=new Date(typeof value==='number'?value*1000:String(value).replace(' ','T')+(String(value).includes('T')?'':'Z'));return isNaN(d.getTime())?null:d.toISOString()};
const cache=new Map<string,{expires:number;value:any}>();
async function memo<T>(key:string,ttl:number,fn:()=>Promise<T>):Promise<T>{const item=cache.get(key);if(item&&item.expires>Date.now())return item.value;const value=await fn();cache.set(key,{expires:Date.now()+ttl,value});return value;}
const abortFetch=async(url:string)=>{const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),7500);try{const r=await fetch(url,{headers:{'Accept':'application/json','User-Agent':'VESTORA-Educational-Testnet/1.0'},signal:controller.signal});if(r.status===429)throw new Error('Provider rate limited requests');if(!r.ok)throw new Error('Provider HTTP '+r.status);return await r.json()}finally{clearTimeout(timer)}};
function unavailable(id:string,note?:string):Quote{return{id,price:null,changePct:null,status:'Unavailable',source:null,asOf:null,currency:'USD',unit:UNIT[id]||'USD',note:note||'No accessible market reference. Sample token price is not a market quote.',changePeriod:'Unavailable'}}
const cgbase=()=>process.env.COINGECKO_BASE_URL||'https://api.coingecko.com/api/v3';
async function cryptos():Promise<Record<string,Quote>>{
 return memo('crypto-quotes',60_000,async()=>{
  const out:Record<string,Quote>={};
  try{
   const raw=await abortFetch(`${cgbase()}/simple/price?ids=${Object.values(CG_IDS).join(',')}&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true`);
   for(const [id,cg] of Object.entries(CG_IDS)){
    const p=validNumber(raw[cg]?.usd);const t=iso(raw[cg]?.last_updated_at);
    out[id]=p!==null?{id,price:p,changePct:Number.isFinite(raw[cg]?.usd_24h_change)?raw[cg].usd_24h_change:null,status:t&&Date.now()-new Date(t).getTime()<3*60*1000?'Live':'Delayed',source:'CoinGecko',asOf:t,currency:'USD',unit:UNIT[id],changePeriod:'24h'}:unavailable(id,'CoinGecko has no quote for this asset');
   }
  }catch(e){for(const id of Object.keys(CG_IDS))out[id]=unavailable(id,'CoinGecko unavailable or rate limited');}
  return out;
 });
}
async function metals():Promise<Record<string,Quote>>{
 return memo('metals-quotes',300_000,async()=>{
  const out:Record<string,Quote>={};const key=process.env.METALS_DEV_API_KEY;
  if(!key)return out;
  try{
   const raw=await abortFetch(`https://api.metals.dev/v1/latest?api_key=${encodeURIComponent(key)}&currency=USD&unit=toz`);
   if(raw.status!=='success'&&raw.status!==undefined)return out;
   for(const [id,field] of Object.entries({gold:'gold',silver:'silver',platinum:'platinum',palladium:'palladium'})){
    const p=validNumber(raw.metals?.[field]);if(p!==null)out[id]={id,price:p,changePct:null,status:'Delayed',source:'Metals.Dev',asOf:iso(raw.timestamp)||iso(raw.date),currency:'USD',unit:UNIT[id],note:'Provider reference snapshot; 24h change unavailable',changePeriod:'Unavailable'};
   }
  }catch{/* Twelve Data may provide another reference */}
  return out;
 });
}
async function twelve(id:string):Promise<Quote>{
 const key=process.env.TWELVE_DATA_API_KEY,symbol=TD_SYMBOLS[id];if(!key||!symbol)return unavailable(id,key?'No supported reference mapping':'Configure TWELVE_DATA_API_KEY for commodity references');
 return memo('td:'+id,300_000,async()=>{
  try{
   const raw=await abortFetch(`https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbol)}&apikey=${encodeURIComponent(key)}`);
   if(raw.status==='error'||raw.code)return unavailable(id,'Twelve Data does not supply a supported quote for this instrument/plan');
   const p=validNumber(raw.close);const prev=validNumber(raw.previous_close);
   const pct=p!==null&&prev!==null?(p-prev)/prev*100:null;
   return p!==null?{id,price:p,changePct:pct,status:'Delayed',source:'Twelve Data',asOf:iso(raw.timestamp)||iso(raw.datetime),currency:'USD',unit:UNIT[id],note:'Provider quote may be delayed; verify contract and unit at source',changePeriod:'Previous session'}:unavailable(id,'Unsupported or rate-limited Twelve Data instrument');
  }catch{return unavailable(id,'Twelve Data unavailable or rate limited');}
 });
}
async function fred():Promise<Quote>{
 const id='treasury',key=process.env.FRED_API_KEY;if(!key)return unavailable(id,'Configure FRED_API_KEY for US Treasury yield reference');
 return memo('fred-yield',30*60_000,async()=>{
  try{
   const raw=await abortFetch(`https://api.stlouisfed.org/fred/series/observations?series_id=DGS10&api_key=${encodeURIComponent(key)}&file_type=json&sort_order=desc&limit=14`);
   const data=(raw.observations||[]).filter((o:any)=>validNumber(o.value)!==null);
   const p=validNumber(data[0]?.value),prev=validNumber(data[1]?.value);
   return p!==null?{id,price:p,changePct:p!==null&&prev!==null?(p-prev)/prev*100:null,status:'Delayed',source:'FRED / U.S. Treasury DGS10',asOf:iso(data[0]?.date),currency:'%',unit:UNIT[id],note:'Daily yield reference, not a token price or bond price',changePeriod:'Previous daily observation'}:unavailable(id,'FRED observations unavailable');
  }catch{return unavailable(id,'FRED API unavailable');}
 });
}
export async function getQuotes(requested?:string[]):Promise<Quote[]>{
 const selected=(requested?.length?requested:ids).filter(id=>ids.includes(id));
 const needsCrypto=selected.some(id=>CG_IDS[id]);const needsMetal=selected.some(id=>['gold','silver','platinum','palladium'].includes(id));
 const [c,m]=await Promise.all([needsCrypto?cryptos():Promise.resolve({}),needsMetal?metals():Promise.resolve({})]);
 // Cache and limit simultaneous requests to avoid provider hammering.
 const result:Quote[]=[];
 for(let i=0;i<selected.length;i+=4){const batch=await Promise.all(selected.slice(i,i+4).map(async id=>{
  if(CG_IDS[id])return (c as Record<string,Quote>)[id]||unavailable(id);
  if((m as Record<string,Quote>)[id])return (m as Record<string,Quote>)[id];
  if(id==='treasury')return fred();
  if(id==='real-estate')return unavailable(id,'Fictional property: no public market quote exists');
  return twelve(id);
 }));result.push(...batch)}
 return result;
}
function intervalAndCount(range:string){const config:Record<string,[string,number]>={'1D':['15min',96],'1W':['1h',168],'1M':['1day',30],'3M':['1day',90],'1Y':['1week',52],'ALL':['1month',120]};return config[range]||config['1M']}
export async function getHistory(id:string,range:string):Promise<History>{
 const base={id,points:[] as Point[],status:'Unavailable' as MarketStatus,source:null as string|null,unit:UNIT[id]||'USD'};
 if(!ids.includes(id))return {...base,note:'Unknown asset'};
 if(CG_IDS[id])return memo('hist:cg:'+id+range,5*60_000,async()=>{
  try{
   const days:Record<string,number|string>={'1D':1,'1W':7,'1M':30,'3M':90,'1Y':365,'ALL':'max'};
   const raw=await abortFetch(`${cgbase()}/coins/${CG_IDS[id]}/market_chart?vs_currency=usd&days=${days[range]||30}`);
   const pts:Point[]=(raw.prices||[]).filter((p:any)=>Array.isArray(p)&&Number.isFinite(p[0])&&validNumber(p[1])!==null).map((p:number[])=>({time:p[0],value:p[1]}));
   return {id,points:pts,status:'Delayed' as MarketStatus,source:'CoinGecko',unit:UNIT[id],note:'Historical observations returned by provider'};
  }catch{return {...base,note:'CoinGecko chart unavailable or rate limited'}}
 });
 if(id==='treasury')return memo('hist:fred:'+range,30*60_000,async()=>{
  if(!process.env.FRED_API_KEY)return {...base,note:'FRED_API_KEY required'};
  try{
   const days:Record<string,number>={'1D':2,'1W':14,'1M':45,'3M':110,'1Y':400,'ALL':3650};const start=new Date(Date.now()-(days[range]||45)*86400000).toISOString().slice(0,10);
   const raw=await abortFetch(`https://api.stlouisfed.org/fred/series/observations?series_id=DGS10&api_key=${encodeURIComponent(process.env.FRED_API_KEY!)}&file_type=json&observation_start=${start}`);
   const pts=(raw.observations||[]).filter((p:any)=>validNumber(p.value)!==null).map((p:any)=>({time:new Date(p.date).getTime(),value:Number(p.value)}));
   return {id,points:pts,status:'Delayed' as MarketStatus,source:'FRED / DGS10',unit:UNIT[id],note:'Daily US 10-year Treasury yields'};
  }catch{return {...base,note:'FRED history unavailable'}}
 });
 if(!process.env.TWELVE_DATA_API_KEY||!TD_SYMBOLS[id])return {...base,note:'No configured historical market data provider'};
 return memo('hist:td:'+id+range,15*60_000,async()=>{
  try{
   const [interval,count]=intervalAndCount(range);
   const raw=await abortFetch(`https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(TD_SYMBOLS[id])}&interval=${interval}&outputsize=${count}&apikey=${encodeURIComponent(process.env.TWELVE_DATA_API_KEY!)}`);
   if(!Array.isArray(raw.values))return {...base,note:'Instrument or historical interval unavailable for this API plan'};
   const pts=(raw.values as any[]).map(p=>({time:new Date(String(p.datetime).replace(' ','T')+'Z').getTime(),value:Number(p.close)})).filter(p=>Number.isFinite(p.time)&&validNumber(p.value)!==null).sort((a,b)=>a.time-b.time);
   return {id,points:pts,status:'Delayed' as MarketStatus,source:'Twelve Data',unit:UNIT[id],note:'Historical provider observations; exchange time zones may differ'};
  }catch{return {...base,note:'Twelve Data history unavailable or rate limited'}}
 });
}
