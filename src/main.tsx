import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';
import { generateWorkout, substituteExercise } from './lib/workouts';
import { draftReply, leadsToCsv } from './lib/leads';

type Exercise = { name: string; equipment: string; sets: number; reps: string };
type Lead = { id: string; name: string; service: string; email: string; status: 'New' | 'Contacted' | 'Qualified' | 'Booked' | 'Closed'; note: string; createdAt: string; appointmentAt?: string };
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
 const [minutes,setMinutes]=useStored('vs-minutes',30);
 function generate(){
  const selected=generateWorkout(equipment,goal as 'Strength'|'Cardio'|'General Fitness',minutes);
  setWorkout(selected.map(({name,equipment,sets,reps})=>({name,equipment,sets,reps})));setCompleted([]);
 }
 return <section><div className="eyebrow">PRODUCT 01 · TRAVEL FITNESS</div><h2>Hotel Gym AI</h2><p>Build a workout using only the equipment available at your hotel. No account required for this local MVP.</p><h3>What's available?</h3><div className="chips">{options.map(o=><button key={o} className={equipment.includes(o)?'chip active':'chip'} onClick={()=>setEquipment(equipment.includes(o)?equipment.filter(x=>x!==o):[...equipment,o])}>{equipment.includes(o)?'✓ ':''}{o}</button>)}</div><label>Workout focus<select value={goal} onChange={e=>setGoal(e.target.value)}><option>Strength</option><option>Cardio</option><option>General Fitness</option></select></label><label>Available time (minutes)<select value={minutes} onChange={e=>setMinutes(Number(e.target.value))}><option value={15}>15</option><option value={30}>30</option><option value={45}>45</option></select></label><button className="primary" onClick={generate} disabled={!equipment.length}>Generate adapted workout</button>{workout.length>0&&<div className="panel"><h3>Your hotel workout</h3><p>{completed.length} of {workout.length} exercises complete</p>{workout.map(e=><label className="exercise" key={e.name}><input type="checkbox" checked={completed.includes(e.name)} onChange={()=>setCompleted(completed.includes(e.name)?completed.filter(x=>x!==e.name):[...completed,e.name])}/><span><strong>{e.name}</strong><small>{e.sets} sets · {e.reps} · {e.equipment}</small></span><button type="button" onClick={()=>{const original=catalog.find(x=>x.name===e.name);const sub=original?substituteExercise({...original,muscle: e.name.includes('Squat')?'Legs':e.name.includes('Row')?'Back':e.name.includes('Press')?'Chest':e.name.includes('Intervals')?'Cardio':'Core'},equipment):null;if(sub)setWorkout(workout.map(x=>x.name===e.name?{name:sub.name,equipment:sub.equipment,sets:sub.sets,reps:sub.reps}:x))}} aria-label={'Substitute '+e.name}>Swap</button></label>)}{completed.length===workout.length&&<p className="success">Workout complete! Great job.</p>}</div>}</section>
}
function Leads(){
 const [leads,setLeads]=useStored<Lead[]>('vs-leads',[]);
 const [name,setName]=useState('');const [service,setService]=useState('');const [email,setEmail]=useState('');const [selected,setSelected]=useState<string|null>(null);
 const [reply,setReply]=useState('');
 const [businessName,setBusinessName]=useStored('vs-business-name','');
 function add(e:React.FormEvent){e.preventDefault();const lead={id:crypto.randomUUID(),name:name.trim(),service:service.trim(),email:email.trim(),status:'New' as const,note:'',createdAt:new Date().toISOString()};setLeads([lead,...leads]);setName('');setService('');setEmail('')}
 function draft(l:Lead){setSelected(l.id);setReply(draftReply(l,businessName))}
 function status(id:string,status:Lead['status']){setLeads(leads.map(l=>l.id===id?{...l,status}:l))}
 return <section><div className="eyebrow">PRODUCT 02 · CUSTOMER OPERATIONS</div><h2>Speed to Lead</h2><p>Capture prospects, prepare response drafts and move leads through your pipeline. Messages are not automatically sent in this MVP.</p><label>Business name<input aria-label="Business name" value={businessName} onChange={e=>setBusinessName(e.target.value)} placeholder="Your business"/></label><div className="metrics"><div><strong>{leads.length}</strong><small>Total leads</small></div><div><strong>{leads.filter(l=>l.status==='New').length}</strong><small>New</small></div><div><strong>{leads.filter(l=>l.status==='Booked').length}</strong><small>Booked</small></div></div><form onSubmit={add} className="panel"><h3>Add a lead</h3><input aria-label="Customer name" placeholder="Customer name" required value={name} onChange={e=>setName(e.target.value)}/><input aria-label="Email" type="email" placeholder="Email" required value={email} onChange={e=>setEmail(e.target.value)}/><input aria-label="Service requested" placeholder="Service requested" required value={service} onChange={e=>setService(e.target.value)}/><button className="primary">Save lead</button></form><h3>Lead inbox</h3><button type="button" disabled={!leads.length} onClick={()=>{const blob=new Blob([leadsToCsv(leads)],{type:"text/csv;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="venturestudio-leads.csv";a.click();URL.revokeObjectURL(url)}}>Export CSV</button>{leads.length===0?<p className="empty">No leads yet. Add your first prospect above.</p>:leads.map(l=><div className="lead" key={l.id}><div><strong>{l.name}</strong><small>{l.service} · {l.email}</small></div><select aria-label={`Status for ${l.name}`} value={l.status} onChange={e=>status(l.id,e.target.value as Lead['status'])}><option>New</option><option>Contacted</option><option>Qualified</option><option>Booked</option><option>Closed</option></select><button onClick={()=>draft(l)}>Draft reply</button><label>Appointment<input aria-label={`Appointment for ${l.name}`} type="datetime-local" value={l.appointmentAt??""} onChange={e=>setLeads(leads.map(x=>x.id===l.id?{...x,appointmentAt:e.target.value}:x))}/></label>{selected===l.id&&<div className="draft"><textarea aria-label="Response draft" value={reply} onChange={e=>setReply(e.target.value)} rows={4}/><button onClick={()=>navigator.clipboard.writeText(reply)}>Copy response</button><a href={`mailto:${encodeURIComponent(l.email)}?subject=${encodeURIComponent('Re: '+l.service)}&body=${encodeURIComponent(reply)}`}>Open in email app</a></div>}</div>)}</section>
}
function App(){const [tab,setTab]=useState<'gym'|'leads'>('gym');return <><header><div className="brand">◆ Venture Studio <span>Two products. One workspace.</span></div><nav><button className={tab==='gym'?'selected':''} onClick={()=>setTab('gym')}>Hotel Gym AI</button><button className={tab==='leads'?'selected':''} onClick={()=>setTab('leads')}>Speed to Lead</button></nav></header><main><div className="hero"><div className="eyebrow">BUILD · VALIDATE · LAUNCH</div><h1>From startup ideas to working products.</h1><p>Explore two independent products, built together and ready for the next development phase.</p></div>{tab==='gym'?<Gym/>:<Leads/>}</main><footer>Venture Studio · Local prototype · Data stored in this browser</footer></>}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
