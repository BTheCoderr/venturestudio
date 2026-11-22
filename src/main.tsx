import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

type Exercise = { name: string; equipment: string; sets: number; reps: string };
type Lead = { id: string; name: string; service: string; email: string; status: 'New' | 'Contacted' | 'Booked'; note: string; createdAt: string };
const catalog: Exercise[] = [
  {name:'Push-ups',equipment:'Bodyweight',sets:3,reps:'12'},
  {name:'Bodyweight Squats',equipment:'Bodyweight',sets:3,reps:'15'},
  {name:'Plank',equipment:'Bodyweight',sets:3,reps:'40 sec'},
  {name:'Dumbbell Press',equipment:'Dumbbells',sets:3,reps:'10'},
  {name:'Dumbbell Rows',equipment:'Dumbbells',sets:3,reps:'12'},
  {name:'Goblet Squats',equipment:'Dumbbells',sets:3,reps:'12'},
  {name:'Cable Rows',equipment:'Cable Machine',sets:3,reps:'12'},
  {name:'Treadmill Intervals',equipment:'Treadmill',sets:1,reps:'12 min'},
  {name:'Bike Intervals',equipment:'Stationary Bike',sets:1,reps:'12 min'}
];
const options=['Bodyweight','Dumbbells','Cable Machine','Treadmill','Stationary Bike'];
function useStored<T>(key:string, initial:T):[T,(value:T)=>void] {
  const [value,setValue]=useState<T>(()=>{try{const v=localStorage.getItem(key);return v?JSON.parse(v):initial}catch{return initial}});
  return [value,(v:T)=>{setValue(v);localStorage.setItem(key,JSON.stringify(v))}];
}
function Gym(){
 const [equipment,setEquipment]=useStored<string[]>('vs-equipment',['Bodyweight','Dumbbells']);
 const [goal,setGoal]=useStored('vs-goal','Strength');
 const [workout,setWorkout]=useStored<Exercise[]>('vs-workout',[]);
 const [completed,setCompleted]=useState<string[]>([]);
 function generate(){
  const eligible=catalog.filter(e=>equipment.includes(e.equipment));
  const selected=goal==='Cardio'?eligible.filter(e=>e.name.includes('Intervals')).concat(eligible.filter(e=>!e.name.includes('Intervals')).slice(0,3)):eligible.filter(e=>!e.name.includes('Intervals')).slice(0,5);
  setWorkout(selected.slice(0,5));setCompleted([]);
 }
 return <section><div className="eyebrow">PRODUCT 01 · TRAVEL FITNESS</div><h2>Hotel Gym AI</h2><p>Build a workout using only the equipment available at your hotel. No account required for this local MVP.</p><h3>What's available?</h3><div className="chips">{options.map(o=><button key={o} className={equipment.includes(o)?'chip active':'chip'} onClick={()=>setEquipment(equipment.includes(o)?equipment.filter(x=>x!==o):[...equipment,o])}>{equipment.includes(o)?'✓ ':''}{o}</button>)}</div><label>Workout focus<select value={goal} onChange={e=>setGoal(e.target.value)}><option>Strength</option><option>Cardio</option><option>General Fitness</option></select></label><button className="primary" onClick={generate} disabled={!equipment.length}>Generate adapted workout</button>{workout.length>0&&<div className="panel"><h3>Your hotel workout</h3><p>{completed.length} of {workout.length} exercises complete</p>{workout.map(e=><label className="exercise" key={e.name}><input type="checkbox" checked={completed.includes(e.name)} onChange={()=>setCompleted(completed.includes(e.name)?completed.filter(x=>x!==e.name):[...completed,e.name])}/><span><strong>{e.name}</strong><small>{e.sets} sets · {e.reps} · {e.equipment}</small></span></label>)}{completed.length===workout.length&&<p className="success">Workout complete! Great job.</p>}</div>}</section>
}
function Leads(){
 const [leads,setLeads]=useStored<Lead[]>('vs-leads',[]);
 const [name,setName]=useState('');const [service,setService]=useState('');const [email,setEmail]=useState('');const [selected,setSelected]=useState<string|null>(null);
 const [reply,setReply]=useState('');
 function add(e:React.FormEvent){e.preventDefault();const lead={id:crypto.randomUUID(),name:name.trim(),service:service.trim(),email:email.trim(),status:'New' as const,note:'',createdAt:new Date().toISOString()};setLeads([lead,...leads]);setName('');setService('');setEmail('')}
 function draft(l:Lead){setSelected(l.id);setReply(`Hi ${l.name}, thanks for reaching out about ${l.service}. We'd love to help. What time works best for a quick call to discuss what you need?`)}
 function status(id:string,status:Lead['status']){setLeads(leads.map(l=>l.id===id?{...l,status}:l))}
 return <section><div className="eyebrow">PRODUCT 02 · CUSTOMER OPERATIONS</div><h2>Speed to Lead</h2><p>Capture prospects, prepare response drafts and move leads through your pipeline. Messages are not automatically sent in this MVP.</p><div className="metrics"><div><strong>{leads.length}</strong><small>Total leads</small></div><div><strong>{leads.filter(l=>l.status==='New').length}</strong><small>New</small></div><div><strong>{leads.filter(l=>l.status==='Booked').length}</strong><small>Booked</small></div></div><form onSubmit={add} className="panel"><h3>Add a lead</h3><input aria-label="Customer name" placeholder="Customer name" required value={name} onChange={e=>setName(e.target.value)}/><input aria-label="Email" type="email" placeholder="Email" required value={email} onChange={e=>setEmail(e.target.value)}/><input aria-label="Service requested" placeholder="Service requested" required value={service} onChange={e=>setService(e.target.value)}/><button className="primary">Save lead</button></form><h3>Lead inbox</h3>{leads.length===0?<p className="empty">No leads yet. Add your first prospect above.</p>:leads.map(l=><div className="lead" key={l.id}><div><strong>{l.name}</strong><small>{l.service} · {l.email}</small></div><select aria-label={`Status for ${l.name}`} value={l.status} onChange={e=>status(l.id,e.target.value as Lead['status'])}><option>New</option><option>Contacted</option><option>Booked</option></select><button onClick={()=>draft(l)}>Draft reply</button>{selected===l.id&&<div className="draft"><textarea aria-label="Response draft" value={reply} onChange={e=>setReply(e.target.value)} rows={4}/><button onClick={()=>navigator.clipboard.writeText(reply)}>Copy response</button><a href={`mailto:${encodeURIComponent(l.email)}?subject=${encodeURIComponent('Re: '+l.service)}&body=${encodeURIComponent(reply)}`}>Open in email app</a></div>}</div>)}</section>
}
function App(){const [tab,setTab]=useState<'gym'|'leads'>('gym');return <><header><div className="brand">◆ Venture Studio <span>Two products. One workspace.</span></div><nav><button className={tab==='gym'?'selected':''} onClick={()=>setTab('gym')}>Hotel Gym AI</button><button className={tab==='leads'?'selected':''} onClick={()=>setTab('leads')}>Speed to Lead</button></nav></header><main><div className="hero"><div className="eyebrow">BUILD · VALIDATE · LAUNCH</div><h1>From startup ideas to working products.</h1><p>Explore two independent products, built together and ready for the next development phase.</p></div>{tab==='gym'?<Gym/>:<Leads/>}</main><footer>Venture Studio · Local prototype · Data stored in this browser</footer></>}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
