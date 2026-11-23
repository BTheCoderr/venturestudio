import React, { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { loadLeads, saveLead, saveWorkout } from './lib/cloud';
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
function Gym({user}:{user:User|null}){
 const [equipment,setEquipment]=useStored<string[]>('vs-equipment',['Bodyweight','Dumbbells']);
 const [goal,setGoal]=useStored('vs-goal','Strength');
 const [workout,setWorkout]=useStored<Exercise[]>(user?'vs-workout-'+user.id:'vs-workout',[]);
 const [completed,setCompleted]=useState<string[]>([]);
 const [minutes,setMinutes]=useStored('vs-minutes',30);
 function generate(){
  const selected=generateWorkout(equipment,goal as 'Strength'|'Cardio'|'General Fitness',minutes);
  setWorkout(selected.map(({name,equipment,sets,reps})=>({name,equipment,sets,reps})));setCompleted([]);if(user&&supabase)void saveWorkout(user.id,goal,equipment,selected).catch(err=>alert('Workout cloud save failed: '+err.message));
 }
 return <section><div className="eyebrow">PRODUCT 01 · TRAVEL FITNESS</div><h2>Hotel Gym AI</h2><p>Build a workout using only the equipment available at your hotel. No account required for this local MVP.</p><h3>What's available?</h3><div className="chips">{options.map(o=><button key={o} className={equipment.includes(o)?'chip active':'chip'} onClick={()=>setEquipment(equipment.includes(o)?equipment.filter(x=>x!==o):[...equipment,o])}>{equipment.includes(o)?'✓ ':''}{o}</button>)}</div><label>Workout focus<select value={goal} onChange={e=>setGoal(e.target.value)}><option>Strength</option><option>Cardio</option><option>General Fitness</option></select></label><label>Available time (minutes)<select value={minutes} onChange={e=>setMinutes(Number(e.target.value))}><option value={15}>15</option><option value={30}>30</option><option value={45}>45</option></select></label><button className="primary" onClick={generate} disabled={!equipment.length}>Generate adapted workout</button>{workout.length>0&&<div className="panel"><h3>Your hotel workout</h3><p>{completed.length} of {workout.length} exercises complete</p>{workout.map(e=><label className="exercise" key={e.name}><input type="checkbox" checked={completed.includes(e.name)} onChange={()=>setCompleted(completed.includes(e.name)?completed.filter(x=>x!==e.name):[...completed,e.name])}/><span><strong>{e.name}</strong><small>{e.sets} sets · {e.reps} · {e.equipment}</small></span><button type="button" onClick={()=>{const original=catalog.find(x=>x.name===e.name);const sub=original?substituteExercise({...original,muscle: e.name.includes('Squat')?'Legs':e.name.includes('Row')?'Back':e.name.includes('Press')?'Chest':e.name.includes('Intervals')?'Cardio':'Core'},equipment):null;if(sub)setWorkout(workout.map(x=>x.name===e.name?{name:sub.name,equipment:sub.equipment,sets:sub.sets,reps:sub.reps}:x))}} aria-label={'Substitute '+e.name}>Swap</button></label>)}{completed.length===workout.length&&<p className="success">Workout complete! Great job.</p>}</div>}</section>
}
function Leads({user}:{user:User|null}){
 const [localLeads,setLocalLeads]=useStored<Lead[]>('vs-leads',[]);
 const [cloudLeads,setCloudLeads]=useState<Lead[]>([]);
 const [loading,setLoading]=useState(Boolean(user));
 const leads=user?cloudLeads:localLeads;
 const setLeads=user?setCloudLeads:setLocalLeads;
 const [name,setName]=useState('');const [service,setService]=useState('');const [email,setEmail]=useState('');const [selected,setSelected]=useState<string|null>(null);
 const [reply,setReply]=useState('');
 const [cloudError,setCloudError]=useState('');
 useEffect(()=>{if(!user||!supabase)return;let active=true;setCloudLeads([]);setLoading(true);loadLeads().then(rows=>{if(active)setCloudLeads(rows)}).catch(e=>{if(active)setCloudError(e.message)}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[user?.id]);
 async function persist(lead:Lead){if(!user||!supabase)return;try{await saveLead(lead,user.id);setCloudError('')}catch(e){setCloudError(e instanceof Error?e.message:String(e));void loadLeads().then(setCloudLeads).catch(()=>{})}}
 const [businessName,setBusinessName]=useStored('vs-business-name','');
 function add(e:React.FormEvent){e.preventDefault();const lead={id:crypto.randomUUID(),name:name.trim(),service:service.trim(),email:email.trim(),status:'New' as const,note:'',createdAt:new Date().toISOString()};setLeads([lead,...leads]);void persist(lead);setName('');setService('');setEmail('')}
 function draft(l:Lead){setSelected(l.id);setReply(draftReply(l,businessName))}
 function status(id:string,status:Lead['status']){setLeads(leads.map(l=>l.id===id?{...l,status}:l));const lead=leads.find(l=>l.id===id);if(lead)void persist({...lead,status})}
 return <section><div className="eyebrow">PRODUCT 02 · CUSTOMER OPERATIONS</div><h2>Speed to Lead</h2>{loading&&<p role="status">Loading your leads…</p>}{cloudError&&<p role="alert" className="empty">Cloud sync error: {cloudError}</p>}<p>Capture prospects, prepare response drafts and move leads through your pipeline. Messages are not automatically sent in this MVP.</p><label>Business name<input aria-label="Business name" value={businessName} onChange={e=>setBusinessName(e.target.value)} placeholder="Your business"/></label><div className="metrics"><div><strong>{leads.length}</strong><small>Total leads</small></div><div><strong>{leads.filter(l=>l.status==='New').length}</strong><small>New</small></div><div><strong>{leads.filter(l=>l.status==='Booked').length}</strong><small>Booked</small></div></div><form onSubmit={add} className="panel"><h3>Add a lead</h3><input aria-label="Customer name" placeholder="Customer name" required value={name} onChange={e=>setName(e.target.value)}/><input aria-label="Email" type="email" placeholder="Email" required value={email} onChange={e=>setEmail(e.target.value)}/><input aria-label="Service requested" placeholder="Service requested" required value={service} onChange={e=>setService(e.target.value)}/><button className="primary" disabled={loading}>Save lead</button></form><h3>Lead inbox</h3><button type="button" disabled={loading||!leads.length} onClick={()=>{const blob=new Blob([leadsToCsv(leads)],{type:"text/csv;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="venturestudio-leads.csv";a.click();URL.revokeObjectURL(url)}}>Export CSV</button>{leads.length===0?<p className="empty">No leads yet. Add your first prospect above.</p>:leads.map(l=><div className="lead" key={l.id}><div><strong>{l.name}</strong><small>{l.service} · {l.email}</small></div><select aria-label={`Status for ${l.name}`} value={l.status} onChange={e=>status(l.id,e.target.value as Lead['status'])}><option>New</option><option>Contacted</option><option>Qualified</option><option>Booked</option><option>Closed</option></select><button onClick={()=>draft(l)}>Draft reply</button><label>Appointment<input aria-label={`Appointment for ${l.name}`} type="datetime-local" value={l.appointmentAt??""} onChange={e=>(setLeads(leads.map(x=>x.id===l.id?{...x,appointmentAt:e.target.value}:x)),void persist({...l,appointmentAt:e.target.value}))}/></label>{selected===l.id&&<div className="draft"><textarea aria-label="Response draft" value={reply} onChange={e=>setReply(e.target.value)} rows={4}/><button onClick={()=>navigator.clipboard.writeText(reply)}>Copy response</button><a href={`mailto:${encodeURIComponent(l.email)}?subject=${encodeURIComponent('Re: '+l.service)}&body=${encodeURIComponent(reply)}`}>Open in email app</a></div>}</div>)}</section>
}
function Auth({onUser}:{onUser:(user:User|null)=>void}){
 const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [message,setMessage]=useState('');const [register,setRegister]=useState(false);
 async function submit(e:React.FormEvent){e.preventDefault();if(!supabase)return;const result=register?await supabase.auth.signUp({email,password}):await supabase.auth.signInWithPassword({email,password});setMessage(result.error?.message??(register?'Check your email for a confirmation link.':'Signed in.'))}
 return <form className="panel" onSubmit={submit}><h3>{register?'Create account':'Sign in'}</h3><input type="email" aria-label="Account email" placeholder="Email" required value={email} onChange={e=>setEmail(e.target.value)}/><input type="password" aria-label="Password" placeholder="Password (6+ characters)" minLength={6} required value={password} onChange={e=>setPassword(e.target.value)}/><button className="primary">{register?'Register':'Sign in'}</button><button type="button" onClick={()=>{setRegister(!register);setMessage('')}}>{register?'Already have an account? Sign in':'Need an account? Register'}</button>{message&&<p role="status">{message}</p>}</form>
}
function App(){const [tab,setTab]=useState<'gym'|'leads'>('gym');const [user,setUser]=useState<User|null>(null);const [ready,setReady]=useState(!supabase);useEffect(()=>{if(!supabase)return;void supabase.auth.getUser().then(({data})=>{setUser(data.user);setReady(true)});const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>setUser(session?.user??null));return()=>subscription.unsubscribe()},[]);return <><header><div className="brand">◆ Venture Studio <span>Two products. One workspace.</span></div><nav><button className={tab==='gym'?'selected':''} onClick={()=>setTab('gym')}>Hotel Gym AI</button><button className={tab==='leads'?'selected':''} onClick={()=>setTab('leads')}>Speed to Lead</button></nav>{supabase&&user&&<button onClick={()=>void supabase?.auth.signOut()}>Sign out</button>}</header><main><div className="hero"><div className="eyebrow">BUILD · VALIDATE · LAUNCH</div><h1>From startup ideas to working products.</h1><p>Explore two independent products, built together and ready for the next development phase.</p></div>{!ready?<p>Loading account…</p>:supabase&&!user?<Auth onUser={setUser}/>:tab==='gym'?<Gym user={user}/>:<Leads user={user}/>}</main><footer>Venture Studio · {supabase?'Supabase cloud mode':'Local prototype · Data stored in this browser'}</footer></>}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
