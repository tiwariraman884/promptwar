-- =============================================================================
-- Migration 003: Create public.profiles + RLS + trigger
-- GreenStep India — run in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- Safe to run multiple times (fully idempotent).
-- =============================================================================

-- ── 1. Create the profiles table ─────────────────────────────────────────────
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

-- Add columns that may be missing if the table was already created from an
-- older version of schema.sql (each ALTER is a no-op if the column exists).
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'email'
  ) then
    alter table public.profiles add column email text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'full_name'
  ) then
    alter table public.profiles add column full_name text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'avatar_url'
  ) then
    alter table public.profiles add column avatar_url text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'updated_at'
  ) then
    alter table public.profiles add column updated_at timestamptz default now();
  end if;
end;
$$;

-- ── 2. Enable Row Level Security ──────────────────────────────────────────────
alter table public.profiles enable row level security;

-- ── 3. Drop any pre-existing policies to avoid conflicts ─────────────────────
drop policy if exists "profiles_select_own"              on public.profiles;
drop policy if exists "profiles_insert_own"              on public.profiles;
drop policy if exists "profiles_update_own"              on public.profiles;
drop policy if exists "Users can view their own profile"   on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;

-- ── 4. Create RLS policies ────────────────────────────────────────────────────
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using  (auth.uid() = id)
  with check (auth.uid() = id);

-- ── 5. Backfill profiles for existing auth users ──────────────────────────────
-- Safe: ON CONFLICT DO NOTHING means existing rows are never overwritten.
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

-- ── 6. Also ensure user_streaks / eco_coins rows exist for existing users ─────
-- (These tables are referenced by handle_new_user; without rows here the
--  dashboard returns 0 for streak/coins which is correct but avoids errors.)
insert into public.user_streaks (user_id)
select id from auth.users
on conflict (user_id) do nothing;

insert into public.eco_coins (user_id)
select id from auth.users
on conflict (user_id) do nothing;

-- ── 7. Trigger function — runs for every new signup ───────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Profile row
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

  -- Streak row
  insert into public.user_streaks (user_id) values (new.id)
  on conflict (user_id) do nothing;

  -- Eco-coins row
  insert into public.eco_coins (user_id) values (new.id)
  on conflict (user_id) do nothing;

  -- User settings row (matches original schema.sql)
  insert into public.user_settings (
    user_id, profile, language, notifications, appearance, privacy,
    sessions, notification_items
  )
  values (
    new.id,
    jsonb_build_object(
      'id',           new.id,
      'name',         coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
      'username',     '',
      'email',        coalesce(new.email, ''),
      'phone',        '',
      'bio',          '',
      'avatar',       coalesce(new.raw_user_meta_data->>'avatar_url', ''),
      'createdAt',    now()::text,
      'lastLogin',    now()::text,
      'passwordHash', ''
    ),
    jsonb_build_object('code', 'en', 'unitSystem', 'metric', 'currency', 'INR', 'dateFormat', 'DD/MM/YYYY'),
    jsonb_build_object(
      'paused', false, 'loginAlerts', true, 'securityAlerts', true,
      'passwordChanges', true, 'accountUpdates', true,
      'dailyCarbonReminders', true, 'weeklyReports', true,
      'streakReminders', true, 'challengeUpdates', true,
      'badgeUnlocks', true, 'ecoCoinRewards', true,
      'productUpdates', true, 'newsletter', false,
      'sustainabilityTips', true, 'monthlySummaries', true,
      'browserNotifications', false, 'mobileNotifications', false,
      'instantAlerts', false, 'quietFrom', '22:00',
      'quietTo', '07:00', 'noWeekends', false
    ),
    jsonb_build_object('theme', 'system'),
    jsonb_build_object('profileVisibility', 'public', 'dataSharing', false, 'analyticsOptIn', false),
    '[]'::jsonb,
    '[]'::jsonb
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- ── 8. Register trigger on auth.users (idempotent) ───────────────────────────
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
