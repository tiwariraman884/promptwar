-- ============================================================
-- 003 FALLBACK — simplified migration without anonymous blocks
-- Use this ONLY if 003_profiles_and_trigger.sql showed no result.
-- ============================================================

-- 1. Create profiles table
create table if not exists public.profiles (
  id                   uuid primary key references auth.users(id) on delete cascade,
  display_name         text,
  city                 text default 'Haridwar',
  state                text default 'Uttarakhand',
  diet_type            text default 'vegetarian'
                         check (diet_type in ('vegetarian', 'non_veg', 'vegan')),
  onboarding_completed boolean not null default false,
  email                text,
  full_name            text,
  avatar_url           text,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

-- 2. Enable RLS
alter table public.profiles enable row level security;

-- 3. Policies — drop first to avoid "already exists" errors
drop policy if exists "profiles_select_own"              on public.profiles;
drop policy if exists "profiles_insert_own"              on public.profiles;
drop policy if exists "profiles_update_own"              on public.profiles;
drop policy if exists "Users can view their own profile"   on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;

create policy "profiles_select_own" on public.profiles
  for select to authenticated using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using  (auth.uid() = id)
  with check (auth.uid() = id);

-- 4. Backfill existing auth users into profiles
insert into public.profiles (id, email, display_name)
select
  u.id,
  u.email,
  coalesce(
    u.raw_user_meta_data->>'display_name',
    u.raw_user_meta_data->>'full_name',
    split_part(u.email, '@', 1)
  )
from auth.users u
on conflict (id) do nothing;

-- 5. Trigger function
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, city, state, diet_type)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      new.raw_user_meta_data->>'full_name',
      split_part(new.email, '@', 1)
    ),
    'Haridwar',
    'Uttarakhand',
    'vegetarian'
  )
  on conflict (id) do nothing;

  insert into public.user_streaks (user_id) values (new.id)
  on conflict (user_id) do nothing;

  insert into public.eco_coins (user_id) values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- 6. Trigger on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 7. Verify — should return 1 row with profile_row_count >= 1
select
  'profiles table exists' as status,
  count(*) as profile_row_count
from public.profiles;
