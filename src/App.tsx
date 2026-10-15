import {useEffect,useMemo,useRef,useState,type ReactNode} from 'react'
import {Sun,Hourglass,Settings as Cog} from 'lucide-react'
import {iso,parseDate,dayDiff,stats,progress,cellRange,fmt,type View} from './lib/time'
import {ask} from './lib/ask'
import {load,save,validate,wipe,empty,type Data,type Settings} from './lib/store'

const HEADS=['Remember that you will die.','Time is the one thing you cannot spend twice.','This, too, is your life.']
const TABS=[['today','Today',Sun],['stats','Stats',Hourglass],['settings','Settings',Cog]] as const
type Tab=typeof TABS[number][0]
const nf=(n:number)=>Math.round(n).toLocaleString()

function useToday(){const [d,setD]=useState(iso(new Date()))
 useEffect(()=>{const f=()=>setD(iso(new Date()));const i=setInterval(f,30000);document.addEventListener('visibilitychange',f);return()=>{clearInterval(i);document.removeEventListener('visibilitychange',f)}},[])
 return d}
function Clock(){const [n,setN]=useState(new Date());useEffect(()=>{const i=setInterval(()=>setN(new Date()),1000);return()=>clearInterval(i)},[])
 return <time className="num mu">{n.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})} · {n.toLocaleTimeString()}</time>}

function Bar({label,a,b,pct}:{label:string;a:string;b:string;pct:number}){
 return <div className="bar"><div className="row"><span>{label}</span><span className="num mu">{a} / {b}</span></div>
 <div className="track" role="progressbar" aria-label={label} aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}><i style={{width:pct+'%'}}/></div></div>}

function LifeGrid({b,life,t,view}:{b:Date;life:number;t:Date;view:View}){
 const {total,done}=progress(b,life,t,view),cols={weeks:52,months:12,years:10}[view]
 const [sel,setSel]=useState(Math.min(done,total-1)),ref=useRef<HTMLDivElement>(null)
 useEffect(()=>setSel(Math.min(done,total-1)),[view,done,total])
 const cells=useMemo(()=>Array.from({length:total},(_,i)=><i key={i} data-i={i} className={i<done?'p':i===done?'c':'f'}/>),[total,done])
 useEffect(()=>{const el=ref.current;if(!el)return;el.querySelector('.s')?.classList.remove('s');el.children[sel]?.classList.add('s')},[sel,cells])
 const key=(e:React.KeyboardEvent)=>{const m:Record<string,number>={ArrowLeft:-1,ArrowRight:1,ArrowUp:-cols,ArrowDown:cols}
  if(e.key in m){e.preventDefault();setSel(s=>Math.max(0,Math.min(total-1,s+m[e.key])))}}
 const [s,e]=cellRange(b,view,sel),status=sel<done?'Past':sel===done?'Current':'Estimated future'
 const unit={weeks:52,months:12,years:1}[view]
 return <div>
  <div ref={ref} className="grid" style={{gridTemplateColumns:`repeat(${cols},1fr)`}} tabIndex={0} role="group"
   aria-label={`Your life in ${view}. Use arrow keys to move between cells.`} aria-describedby="cell-info" onKeyDown={key}
   onClick={ev=>{const i=(ev.target as HTMLElement).dataset.i;if(i)setSel(+i)}}>{cells}</div>
  <p id="cell-info" className="mu small" aria-live="polite"><b>{status}</b> {view.slice(0,-1)} {sel+1} · age {Math.floor(sel/unit)} · {fmt(s)} – {fmt(e)}</p>
  <p className="legend small mu"><i className="p"/>lived <i className="c"/>current <i className="f"/>estimated future</p></div>}

function Today({data,set,today}:{data:Data;set:(f:(d:Data)=>Data)=>void;today:string}){
 const s=data.settings!,b=parseDate(s.dob)!,t=parseDate(today)!,wk=progress(b,s.life,t,'weeks')
 const yd=dayDiff(t,new Date(t.getFullYear()+1,0,1)),x=yd%7
 return <div className="stack-lg">
  <header className="hero"><Clock/><h1>{s.heading||HEADS[0]}</h1><p className="lead">{s.goal||'Your time is finite. Make it yours.'}</p></header>
  <section aria-label={`Your life in ${s.view}`}><LifeGrid b={b} life={s.life} t={t} view={s.view}/>
   <div className="stats left">
    <div><span className="num big">{Math.floor(yd/7)}</span><span className="mu small">weeks left in {t.getFullYear()}{x?` (+${x} day${x>1?'s':''})`:''}</span></div>
    <div><span className="num big">{nf(Math.max(0,wk.total-wk.done))}</span><span className="mu small">weeks left in your estimated life</span></div></div>
   <div className="row small mu"><span>View:</span>{(['weeks','months','years'] as View[]).map(v=><button key={v} className={'chip'+(v===s.view?' on':'')} aria-pressed={v===s.view}
    onClick={()=>set(d=>({...d,settings:{...d.settings!,view:v}}))}>{v}</button>)}</div></section></div>}

function Stats({data,today}:{data:Data;today:string}){
 const s=data.settings!,b=parseDate(s.dob)!,t=parseDate(today)!,st=stats(b,s.life,t),a=st.age
 const wk=progress(b,s.life,t,'weeks'),yr=progress(b,s.life,t,'years')
 return <div className="stack-lg"><h1 className="h1">Stats</h1>
  <section aria-label="Statistics" className="stats">
   <div><span className="num big">{a.y}<small>y</small> {a.m}<small>m</small> {a.d}<small>d</small></span><span className="mu small">Age</span></div>
   <div><span className="num big">{nf(st.lived)}</span><span className="mu small">Days lived</span></div>
   <div><span className="num big">{nf(st.rem)}</span><span className="mu small">Days remaining (estimate)</span></div>
   <div><span className="num big">{st.pct.toFixed(1)}%</span><span className="mu small">Of chosen lifespan elapsed</span></div></section>
  <p className="small mu">{st.over?`You have passed the ${s.life}-year lifespan you chose. Every day beyond it is a gift; adjust it in Settings if you like.`:`A hypothetical endpoint of ${fmt(st.end)} follows from your chosen ${s.life}-year lifespan. It is an estimate, not a prediction.`}</p>
  <section><h2>Time breakdown</h2><div className="stack">
   <Bar label="Weeks completed" a={nf(wk.done)} b={nf(wk.total)} pct={wk.done/wk.total*100}/>
   <Bar label="Days lived" a={nf(st.lived)} b={nf(st.tot)} pct={st.pct*1}/>
   <Bar label="Years completed" a={String(yr.done)} b={String(yr.total)} pct={yr.done/yr.total*100}/></div></section></div>}

function SettingsForm({init,today,onSubmit,label,intro}:{init:Settings;today:string;onSubmit:(s:Settings)=>void;label:string;intro?:ReactNode}){
 const [s,setS]=useState(init),[life,setLife]=useState(String(init.life)),[err,setErr]=useState('')
 const go=(e:React.FormEvent)=>{e.preventDefault();const d=parseDate(s.dob),l=Number(life)
  if(!d)return setErr('Enter a valid date of birth.');if(dayDiff(d,parseDate(today)!)<0)return setErr('Your date of birth cannot be in the future.')
  if(d.getFullYear()<1900)return setErr('Please enter a birth year from 1900 onward.')
  if(!Number.isInteger(l)||l<1||l>120)return setErr('Expected lifespan must be a whole number between 1 and 120.')
  setErr('');onSubmit({...s,life:l})}
 return <form className="stack" onSubmit={go} noValidate>{intro}
  <label>Date of birth<input type="date" value={s.dob} max={today} onChange={e=>setS({...s,dob:e.target.value})}/></label>
  <label>Expected lifespan (years)<input inputMode="numeric" value={life} onChange={e=>setLife(e.target.value)}/></label>
  <label>Visualization<select value={s.view} onChange={e=>setS({...s,view:e.target.value as View})}><option value="weeks">Weeks</option><option value="months">Months</option><option value="years">Years</option></select></label>
  <label>Theme<select value={s.theme} onChange={e=>setS({...s,theme:e.target.value as Settings['theme']})}><option value="dark">Dark</option><option value="light">Light</option><option value="system">System</option></select></label>
  <label>Guiding sentence (optional)<input value={s.goal} maxLength={200} onChange={e=>setS({...s,goal:e.target.value})}/></label>
  <label>Heading<input list="heads" value={s.heading} maxLength={120} placeholder={HEADS[0]} onChange={e=>setS({...s,heading:e.target.value})}/><datalist id="heads">{HEADS.map(h=><option key={h} value={h}/>)}</datalist></label>
  {err&&<p role="alert" className="err">{err}</p>}<div><button className="btn">{label}</button></div></form>}

function SettingsPage({data,set,today,reset}:{data:Data;set:(f:(d:Data)=>Data)=>void;today:string;reset:()=>void}){
 const [msg,setMsg]=useState('')
 const exp=()=>{const u=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=u;a.download=`memento-mori-${today}.json`;a.click();URL.revokeObjectURL(u)}
 const imp=async(f?:File)=>{if(!f)return;try{const v=validate(JSON.parse(await f.text()));if(!v)throw 0
  if(await ask('Replace all current data with this file?')){set(()=>v);setMsg('Imported.')}}catch{setMsg('That file is not a valid Memento Mori export.')}}
 return <div className="stack-lg"><h1 className="h1">Settings</h1>
  <SettingsForm key={JSON.stringify(data.settings)} init={data.settings!} today={today} label="Save settings" onSubmit={s=>{set(d=>({...d,settings:s}));setMsg('Saved.')}}/>
  <section className="stack"><h2>Your data</h2><p className="small mu">Everything stays in this browser’s local storage. It does not sync between devices and is lost if browser data is cleared, so export a backup now and then.</p>
   <div className="row"><button className="btn ghost" onClick={exp}>Export JSON</button>
   <label className="btn ghost">Import JSON<input type="file" accept="application/json" hidden onChange={e=>{imp(e.target.files?.[0]);e.target.value=''}}/></label>
   <button className="btn danger" onClick={()=>ask('Delete all Memento Mori data from this browser? This cannot be undone.').then(ok=>ok&&reset())}>Delete all data</button></div>
   {msg&&<p role="status" className="small">{msg}</p>}</section></div>}

export default function App(){
 const [data,setData]=useState<Data>(load),today=useToday()
 const [tab,setTab]=useState<Tab>(()=>TABS.find(t=>t[0]===location.hash.slice(1))?.[0]??'today')
 const set=(f:(d:Data)=>Data)=>setData(f)
 useEffect(()=>save(data),[data]);useEffect(()=>{try{history.replaceState(null,'','#'+tab)}catch{}},[tab])
 const theme=data.settings?.theme??'dark'
 useEffect(()=>{const mq=matchMedia('(prefers-color-scheme: dark)'),a=()=>{document.documentElement.dataset.theme=theme==='system'?(mq.matches?'dark':'light'):theme}
  a();mq.addEventListener('change',a);return()=>mq.removeEventListener('change',a)},[theme])
 if(!data.settings)return <main className="wrap narrow"><h1 className="h1">Memento Mori</h1>
  <SettingsForm init={{dob:'',life:80,view:'weeks',goal:'',theme:'dark',heading:''}} today={today} label="Begin" onSubmit={s=>set(d=>({...d,settings:s}))}
   intro={<p className="lead">Time is finite, and seeing it plainly can make it kinder. Your lifespan is an estimate you choose, not a prediction. Everything stays on this device.</p>}/></main>
 const P={data,set,today}
 return <div className="shell"><nav aria-label="Main">{TABS.map(([k,l,I])=><button key={k} className={tab===k?'on':''} aria-current={tab===k?'page':undefined} onClick={()=>{setTab(k);window.scrollTo({top:0})}}><I size={18}/><span>{l}</span></button>)}</nav>
  <main className="wrap" key={tab}>{tab==='today'&&<Today {...P}/>}{tab==='stats'&&<Stats {...P}/>}{tab==='settings'&&<SettingsPage {...P} reset={()=>{wipe();setTab('today');setData(empty())}}/>}</main></div>}
