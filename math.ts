export function tokenQuantity(amount:number,tokenPrice:number):number{
 if(!Number.isFinite(amount)||!Number.isFinite(tokenPrice)||amount<=0||tokenPrice<=0)return 0;
 const result=Math.floor((amount+1e-9)/tokenPrice);return Number.isSafeInteger(result)&&result>0?result:0;
}
export function tokenCost(quantity:number,tokenPrice:number):number{
 if(!Number.isSafeInteger(quantity)||quantity<0||!Number.isFinite(tokenPrice)||tokenPrice<0)throw new Error('Invalid token calculation');
 return Math.round(quantity*tokenPrice*100)/100;
}
export const formatMoney=(v:number|null|undefined,decimals=2)=>v===null||v===undefined||!Number.isFinite(v)?'—':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:decimals,maximumFractionDigits:decimals}).format(v);
export const formatCompact=(v:number|null|undefined)=>v===null||v===undefined||!Number.isFinite(v)?'—':new Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:2}).format(v);
export const shortAddress=(addr:string)=>addr?`${addr.slice(0,6)}…${addr.slice(-4)}`:'';
export const dateTime=(value:string|null|undefined)=>value&&Number.isFinite(Date.parse(value))?new Date(value).toLocaleString(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}):'Not available';
export function relativeTime(value:string|null|undefined){if(!value||!Number.isFinite(Date.parse(value)))return 'No timestamp';const minutes=Math.max(0,Math.round((Date.now()-Date.parse(value))/60000));return minutes<2?'just now':minutes<60?`${minutes}m ago`:minutes<1440?`${Math.floor(minutes/60)}h ago`:`${Math.floor(minutes/1440)}d ago`}

export const formatReferencePrice=(value:number|null|undefined,unit:string):string=>{if(value===null||value===undefined||!Number.isFinite(value))return 'Unavailable';if(unit.startsWith('%'))return `${value.toFixed(3)}%`;return formatMoney(value,value<10?3:2)};
