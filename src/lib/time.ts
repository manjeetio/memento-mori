// Conventions: all math uses local calendar days (DST-safe). Week i = days [7i, 7i+7) since birth.
// Total weeks = ceil(days in lifespan / 7). Completed weeks = floor(days lived / 7); the current week is the next cell.
// Month/year steps clamp to month end, so a Feb 29 birthday is observed on Feb 28 in non-leap years.
export type View='weeks'|'months'|'years'
export const DAY=864e5
export const pad=(n:number)=>String(n).padStart(2,'0')
export const iso=(d:Date)=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
export function parseDate(s:string){const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s);if(!m)return null
 const y=+m[1],mo=+m[2]-1,d=+m[3],t=new Date(y,mo,d)
 return t.getFullYear()===y&&t.getMonth()===mo&&t.getDate()===d?t:null}
export const dayDiff=(a:Date,b:Date)=>Math.round((Date.UTC(b.getFullYear(),b.getMonth(),b.getDate())-Date.UTC(a.getFullYear(),a.getMonth(),a.getDate()))/DAY)
export const addDays=(d:Date,n:number)=>new Date(d.getFullYear(),d.getMonth(),d.getDate()+n)
export function addMonths(d:Date,n:number){const f=new Date(d.getFullYear(),d.getMonth()+n,1)
 const last=new Date(f.getFullYear(),f.getMonth()+1,0).getDate();return new Date(f.getFullYear(),f.getMonth(),Math.min(d.getDate(),last))}
export const addYears=(d:Date,n:number)=>addMonths(d,12*n)
export function age(b:Date,t:Date){if(t<b)return{y:0,m:0,d:0}
 let k=(t.getFullYear()-b.getFullYear())*12+t.getMonth()-b.getMonth()
 if(dayDiff(addMonths(b,k),t)<0)k--
 return{y:Math.floor(k/12),m:k%12,d:dayDiff(addMonths(b,k),t)}}
export function stats(b:Date,life:number,t:Date){
 const end=addYears(b,life),tot=dayDiff(b,end),lived=Math.max(0,dayDiff(b,t)),rem=Math.max(0,tot-lived)
 return{end,tot,lived,rem,over:lived>=tot,pct:Math.min(100,lived/tot*100),age:age(b,t)}}
export function progress(b:Date,life:number,t:Date,view:View){
 const a=age(b,t),lived=Math.max(0,dayDiff(b,t)),tot=dayDiff(b,addYears(b,life))
 const total=view==='weeks'?Math.ceil(tot/7):view==='months'?life*12:life
 const raw=view==='weeks'?Math.floor(lived/7):view==='months'?a.y*12+a.m:a.y
 return{total,done:Math.min(total,raw)}}
export function cellRange(b:Date,view:View,i:number):[Date,Date]{
 if(view==='weeks')return[addDays(b,7*i),addDays(b,7*i+6)]
 if(view==='months')return[addMonths(b,i),addDays(addMonths(b,i+1),-1)]
 return[addYears(b,i),addDays(addYears(b,i+1),-1)]}
export const fmt=(d:Date)=>d.toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'})
