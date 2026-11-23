export type Exercise = { name: string; equipment: string; sets: number; reps: string; muscle: string };
export type WorkoutGoal = 'Strength' | 'Cardio' | 'General Fitness';
export const equipmentOptions = ['Bodyweight','Dumbbells','Cable Machine','Treadmill','Stationary Bike'] as const;
export const exercises: Exercise[] = [
{name:'Push-ups',equipment:'Bodyweight',sets:3,reps:'12',muscle:'Chest'},
{name:'Bodyweight Squats',equipment:'Bodyweight',sets:3,reps:'15',muscle:'Legs'},
{name:'Plank',equipment:'Bodyweight',sets:3,reps:'40 sec',muscle:'Core'},
{name:'Reverse Lunges',equipment:'Bodyweight',sets:3,reps:'10/side',muscle:'Legs'},
{name:'Glute Bridges',equipment:'Bodyweight',sets:3,reps:'15',muscle:'Legs'},
{name:'Dumbbell Press',equipment:'Dumbbells',sets:3,reps:'10',muscle:'Chest'},
{name:'Dumbbell Rows',equipment:'Dumbbells',sets:3,reps:'12',muscle:'Back'},
{name:'Goblet Squats',equipment:'Dumbbells',sets:3,reps:'12',muscle:'Legs'},
{name:'Dumbbell Shoulder Press',equipment:'Dumbbells',sets:3,reps:'10',muscle:'Shoulders'},
{name:'Cable Rows',equipment:'Cable Machine',sets:3,reps:'12',muscle:'Back'},
{name:'Cable Triceps Pressdowns',equipment:'Cable Machine',sets:3,reps:'12',muscle:'Arms'},
{name:'Treadmill Intervals',equipment:'Treadmill',sets:1,reps:'12 min',muscle:'Cardio'},
{name:'Bike Intervals',equipment:'Stationary Bike',sets:1,reps:'12 min',muscle:'Cardio'}
];
export function generateWorkout(equipment: string[], goal: WorkoutGoal, minutes: number): Exercise[] {
 const available=exercises.filter(x=>equipment.includes(x.equipment));
 const cardio=available.filter(x=>x.muscle==='Cardio');
 const strength=available.filter(x=>x.muscle!=='Cardio');
 const ordered=goal==='Cardio'?[...cardio,...strength]:goal==='General Fitness'?[...strength.slice(0,3),...cardio,...strength.slice(3)]:[...strength,...cardio];
 const seen=new Set<string>();const result:Exercise[]=[];
 for(const item of ordered){if(seen.has(item.muscle)&&result.length<3)continue;result.push(item);seen.add(item.muscle);if(result.length>=Math.max(2,Math.min(7,Math.floor(minutes/7))))break;}
 return result;
}
export function substituteExercise(exercise: Exercise,equipment:string[]):Exercise | null {
 return exercises.find(x=>x.name!==exercise.name&&equipment.includes(x.equipment)&&x.muscle===exercise.muscle)??null;
}
