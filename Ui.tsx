import React from 'react';
import {ArrowUpRight,LoaderCircle,Search,X} from 'lucide-react';
import type {Asset,Risk} from '../data/assets';
import {formatMoney,formatReferencePrice} from '../lib/math';
import type {Quote} from '../lib/api';
export function AssetMark({asset,size='md'}:{asset:Asset;size?:'sm'|'md'|'lg'}){return <span className={`asset-mark ${size}`} style={{'--mark':asset.color} as React.CSSProperties}>{asset.icon}</span>}
export function Eyebrow({children}:{children:React.ReactNode}){return <div className="eyebrow"><span className="eyebrow-dot"/>{children}</div>}
export function PageHeading({eyebrow,title,subtitle,action}:{eyebrow:string;title:string;subtitle:string;action?:React.ReactNode}){return <div className="page-heading"><div><Eyebrow>{eyebrow}</Eyebrow><h1>{title}</h1><p>{subtitle}</p></div>{action&&<div className="heading-action">{action}</div>}</div>}
export function PanelHeading({title,subtitle,action}:{title:string;subtitle?:string;action?:React.ReactNode}){return <div className="panel-heading"><div><h3>{title}</h3>{subtitle&&<p>{subtitle}</p>}</div>{action}</div>}
export function RiskBadge({risk}:{risk:Risk}){return <span className={`risk-badge risk-${risk.toLowerCase().replace(' ','-')}`}><span className="risk-dot"/>{risk} risk</span>}
export function DataStatus({quote}:{quote:Quote}){return <span title={quote.note||quote.source||'Market data not accessible'} className={`data-status ${quote.status.toLowerCase()}`}><span className="data-dot"/>{quote.status}</span>}
export function Change({value,period}:{value:number|null|undefined;period?:string}){return <span title={period?`Change: ${period}`:'Market movement period depends on provider'} className={`change ${value==null?'muted':value>=0?'up':'down'}`}>{value===null||value===undefined?'—':`${value>=0?'+':''}${value.toFixed(2)}%`}</span>}
export function QuotePrice({quote}:{quote:Quote}){return <strong className="quote-price">{quote.price!==null?formatReferencePrice(quote.price,quote.unit):'Unavailable'}</strong>}
export function Empty({icon,title,description,action}:{icon?:React.ReactNode;title:string;description:string;action?:React.ReactNode}){return <div className="empty-state"><div className="empty-icon">{icon||<Search size={22}/>}</div><h3>{title}</h3><p>{description}</p>{action}</div>}
export function Loading({label='Loading…'}:{label?:string}){return <div className="loading"><LoaderCircle size={19} className="spin"/>{label}</div>}
export function IconButton({onClick,children,label,active}:{onClick:()=>void;children:React.ReactNode;label:string;active?:boolean}){return <button className={`icon-btn ${active?'active':''}`} onClick={onClick} aria-label={label} title={label}>{children}</button>}
export function External({href,children}:{href:string;children:React.ReactNode}){return <a href={href} target="_blank" rel="noopener noreferrer" className="text-link">{children}<ArrowUpRight size={14}/></a>}
export function Dialog({children,onClose,wide=false}:{children:React.ReactNode;onClose:()=>void;wide?:boolean}){return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><div className={`dialog ${wide?'wide':''}`} role="dialog" aria-modal="true"><button className="modal-x" onClick={onClose} aria-label="Close"><X size={19}/></button>{children}</div></div>}
export function Disclaimer({children}:{children:React.ReactNode}){return <div className="disclaimer">{children}</div>}
