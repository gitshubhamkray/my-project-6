import {Link} from 'react-router-dom';
import {ArrowUpRight,Heart,Plus} from 'lucide-react';
import type {Asset} from '../data/assets';
import {useApp,useQuote} from '../context/AppContext';
import {formatCompact,formatMoney,formatReferencePrice,relativeTime} from '../lib/math';
import {AssetMark,Change,DataStatus,RiskBadge} from './Ui';
export function AssetCard({asset}:{asset:Asset}){
 const {state,watch,openInvest}=useApp();const quote=useQuote(asset.id);const saved=state.watchlist.includes(asset.id);
 return <div className="asset-card"><div className="asset-card-top"><div className="asset-card-name"><AssetMark asset={asset}/><div><h3>{asset.name}</h3><span>{asset.symbol} · {asset.category}</span></div></div><button className={`heart-btn ${saved?'saved':''}`} onClick={()=>watch(asset.id)} title={saved?'Remove from watchlist':'Add to watchlist'} aria-label="Toggle watchlist"><Heart size={18} fill={saved?'currentColor':'none'}/></button></div>
 <div className="asset-card-price"><div className="muted-label">Market reference</div><div className="price-line"><strong>{quote.price===null?'Unavailable':formatReferencePrice(quote.price,quote.unit)}</strong><Change value={quote.changePct} period={quote.changePeriod}/></div><div className="card-source"><DataStatus quote={quote}/><span>{quote.source?`${quote.source} · ${relativeTime(quote.asOf)}`:'No source'}</span></div></div>
 <div className="card-mini-stats"><div><small>DEMO TOKEN</small><strong>{formatMoney(asset.tokenPrice)}</strong></div><div><small>SUPPLY</small><strong>{formatCompact(asset.supply)}</strong></div><div><small>RISK PROFILE</small><RiskBadge risk={asset.risk}/></div></div>
 <div className="asset-card-actions"><Link to={`/assets/${asset.id}`} className="btn btn-subtle">Details <ArrowUpRight size={14}/></Link><button className="btn btn-gold" onClick={()=>openInvest(asset.id)}><Plus size={16}/> Invest</button></div>
 </div>
}
