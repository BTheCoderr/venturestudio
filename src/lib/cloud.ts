import { supabase } from './supabase';
import type { Lead } from './leads';
import type { Exercise } from './workouts';
export async function loadLeads():Promise<Lead[]> {
 if(!supabase)throw new Error('Cloud is not configured');
 const {data,error}=await supabase.from('leads').select('*').order('created_at',{ascending:false});
 if(error)throw error;
 return (data??[]).map(x=>({id:x.id,name:x.name,email:x.email,service:x.service,status:x.status,note:x.note,createdAt:x.created_at,appointmentAt:x.appointment_at??undefined}));
}
export async function saveLead(l:Lead,userId:string){
 if(!supabase)throw new Error('Cloud is not configured');
 const {error}=await supabase.from('leads').upsert({id:l.id,user_id:userId,name:l.name,email:l.email,service:l.service,status:l.status,note:l.note,created_at:l.createdAt,appointment_at:l.appointmentAt||null});
 if(error)throw error;
}
export async function saveWorkout(userId:string,goal:string,equipment:string[],exercises:Exercise[]){
 if(!supabase)throw new Error('Cloud is not configured');
 const {error}=await supabase.from('workouts').insert({user_id:userId,goal,equipment,exercises});
 if(error)throw error;
}
