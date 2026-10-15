import {parseDate,type View} from './time'
export type Settings={dob:string;life:number;view:View;goal:string;theme:'dark'|'light'|'system';heading:string}
export type Entry={intention:string;note:string}
export type Milestone={id:string;title:string;date:string;desc:string}
export type Data={v:1;settings:Settings|null;entries:Record<string,Entry>;milestones:Milestone[]}
export const KEY='memento-mori:v1'
export const empty=():Data=>({v:1,settings:null,entries:{},milestones:[]})
const str=(x:unknown,n:number)=>typeof x==='string'?x.slice(0,n):''
export function validate(r:unknown):Data|null{
 if(!r||typeof r!=='object')return null
 const o=r as Record<string,any>,out=empty(),s=o.settings
 if(s){if(!parseDate(str(s.dob,10))||!Number.isInteger(s.life)||s.life<1||s.life>120)return null
  out.settings={dob:s.dob,life:s.life,view:['weeks','months','years'].includes(s.view)?s.view:'weeks',goal:str(s.goal,200),
   theme:['dark','light','system'].includes(s.theme)?s.theme:'dark',heading:str(s.heading,120)}}
 if(o.entries&&typeof o.entries==='object')for(const[k,e]of Object.entries<any>(o.entries))
  if(parseDate(k)&&e&&(str(e.intention,2000)||str(e.note,5000)))out.entries[k]={intention:str(e.intention,2000),note:str(e.note,5000)}
 if(Array.isArray(o.milestones))for(const m of o.milestones)
  if(m&&parseDate(str(m.date,10))&&str(m.title,120).trim())out.milestones.push({id:str(m.id,40)||Math.random().toString(36).slice(2),title:str(m.title,120),date:m.date,desc:str(m.desc,500)})
 return out}
export function load():Data{try{const r=localStorage.getItem(KEY);return r?validate(JSON.parse(r))??empty():empty()}catch{return empty()}}
export function save(d:Data){try{localStorage.setItem(KEY,JSON.stringify(d))}catch{}}
export function wipe(){try{localStorage.removeItem(KEY)}catch{}}
