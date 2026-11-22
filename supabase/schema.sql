-- Proposed schema only. Apply to a dedicated Supabase project after review.
-- Never expose service-role keys in browser code.
create extension if not exists pgcrypto;
create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text,
 created_at timestamptz not null default now()
);
create table if not exists public.workouts (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 goal text not null check (goal in ('Strength','Cardio','General Fitness')),
 equipment text[] not null default '{}',
 exercises jsonb not null default '[]'::jsonb,
 completed_at timestamptz,
 created_at timestamptz not null default now()
);
create table if not exists public.leads (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 name text not null,
 email text not null,
 service text not null,
 status text not null default 'New' check (status in ('New','Contacted','Qualified','Booked','Closed')),
 note text not null default '',
 appointment_at timestamptz,
 created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
alter table public.workouts enable row level security;
alter table public.leads enable row level security;
create policy "profiles select own" on public.profiles for select to authenticated using ((select auth.uid())=id);
create policy "profiles insert own" on public.profiles for insert to authenticated with check ((select auth.uid())=id);
create policy "profiles update own" on public.profiles for update to authenticated using ((select auth.uid())=id) with check ((select auth.uid())=id);
create policy "workouts select own" on public.workouts for select to authenticated using ((select auth.uid())=user_id);
create policy "workouts insert own" on public.workouts for insert to authenticated with check ((select auth.uid())=user_id);
create policy "workouts update own" on public.workouts for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "workouts delete own" on public.workouts for delete to authenticated using ((select auth.uid())=user_id);
create policy "leads select own" on public.leads for select to authenticated using ((select auth.uid())=user_id);
create policy "leads insert own" on public.leads for insert to authenticated with check ((select auth.uid())=user_id);
create policy "leads update own" on public.leads for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "leads delete own" on public.leads for delete to authenticated using ((select auth.uid())=user_id);
