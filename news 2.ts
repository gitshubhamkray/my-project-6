// Public business RSS. Headlines are shown only when actually fetched, never invented.
interface NewsItem {title:string;url:string;publishedAt:string|null;source:string}
let cached:{expires:number;items:NewsItem[]}|null=null;
const decode=(x:string)=>x.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&apos;|&#39;|&#x27;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/<[^>]*>/g,'').trim();
const tag=(s:string,key:string)=>decode(s.match(new RegExp(`<${key}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${key}>`,'i'))?.[1]||'');
export async function getNews(){if(cached&&cached.expires>Date.now())return{items:cached.items,status:'Fetched',source:'BBC News Business RSS'};try{
 const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),6500);let raw='';try{const r=await fetch('https://feeds.bbci.co.uk/news/business/rss.xml',{signal:ctrl.signal});if(!r.ok)throw new Error('RSS unavailable');raw=await r.text()}finally{clearTimeout(timer)}
 const items=(raw.match(/<item>[\s\S]*?<\/item>/gi)||[]).slice(0,6).map(x=>{const url=tag(x,'link');const published=tag(x,'pubDate');return {title:tag(x,'title'),url,publishedAt:Number.isFinite(Date.parse(published))?new Date(published).toISOString():null,source:'BBC News Business'}}).filter(x=>x.title&&/^https:\/\//.test(x.url));
 if(!items.length)throw new Error('No accessible articles');cached={expires:Date.now()+10*60*1000,items};return{items,status:'Fetched',source:'BBC News Business RSS'};
 }catch{return cached?{items:cached.items,status:'Delayed',source:'BBC News Business RSS'}:{items:[],status:'Unavailable',source:'BBC News Business RSS'}}
}
