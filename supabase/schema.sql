create extension if not exists pgcrypto;

-- Users (extends Supabase auth.users)
create table if not exists profiles (
  id          uuid primary key references auth.users on delete cascade,
  display_name text,
  city        text default 'Haridwar',
  state       text default 'Uttarakhand',
  diet_type   text default 'vegetarian' check (diet_type in ('vegetarian', 'non_veg', 'vegan')),
  created_at  timestamptz default now()
);

create table if not exists user_settings (
  user_id            uuid primary key references auth.users on delete cascade,
  profile            jsonb not null default '{}'::jsonb,
  language           jsonb not null default '{}'::jsonb,
  notifications      jsonb not null default '{}'::jsonb,
  appearance         jsonb not null default '{}'::jsonb,
  privacy            jsonb not null default '{}'::jsonb,
  sessions           jsonb not null default '[]'::jsonb,
  notification_items jsonb not null default '[]'::jsonb,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);

-- Emission Entries
create table if not exists emission_entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles(id) on delete cascade,
  entry_date  date not null default current_date,
  category    text not null check (category in ('transport', 'energy', 'diet', 'shopping', 'waste', 'digital')),
  sub_type    text,
  quantity    numeric not null,
  unit        text not null,
  kg_co2e     numeric not null,
  notes       text,
  created_at  timestamptz default now()
);

-- Gamification
create table if not exists user_badges (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles(id) on delete cascade,
  badge_slug  text not null,
  earned_at   timestamptz default now(),
  unique (user_id, badge_slug)
);

create table if not exists user_streaks (
  user_id      uuid primary key references profiles(id) on delete cascade,
  current_streak int default 0,
  longest_streak int default 0,
  last_entry_date date
);

create table if not exists eco_coins (
  user_id      uuid primary key references profiles(id) on delete cascade,
  total_coins  int default 0
);

-- Challenges
create table if not exists challenges (
  id          uuid primary key default gen_random_uuid(),
  title       text,
  description text,
  target_kg   numeric,
  duration_days int,
  starts_at   date,
  ends_at     date
);

create table if not exists user_challenges (
  user_id      uuid references profiles(id) on delete cascade,
  challenge_id uuid references challenges(id) on delete cascade,
  joined_at    timestamptz default now(),
  progress_kg  numeric default 0,
  completed    boolean default false,
  primary key (user_id, challenge_id)
);

-- Supports POST /api/tips/complete while keeping tip rewards idempotent.
create table if not exists completed_tips (
  user_id      uuid references profiles(id) on delete cascade,
  tip_id       text not null,
  completed_at timestamptz default now(),
  primary key (user_id, tip_id)
);

alter table profiles enable row level security;
alter table user_settings enable row level security;
alter table emission_entries enable row level security;
alter table user_badges enable row level security;
alter table user_streaks enable row level security;
alter table eco_coins enable row level security;
alter table challenges enable row level security;
alter table user_challenges enable row level security;
alter table completed_tips enable row level security;

create policy "profiles_select_own" on profiles
  for select using (auth.uid() = id);
create policy "profiles_insert_own" on profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "user_settings_select_own" on user_settings
  for select using (auth.uid() = user_id);
create policy "user_settings_insert_own" on user_settings
  for insert with check (auth.uid() = user_id);
create policy "user_settings_update_own" on user_settings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "entries_select_own" on emission_entries
  for select using (auth.uid() = user_id);
create policy "entries_insert_own" on emission_entries
  for insert with check (auth.uid() = user_id);
create policy "entries_update_own" on emission_entries
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "entries_delete_own" on emission_entries
  for delete using (auth.uid() = user_id);

create policy "badges_select_own" on user_badges
  for select using (auth.uid() = user_id);
create policy "badges_insert_own" on user_badges
  for insert with check (auth.uid() = user_id);

create policy "streaks_select_own" on user_streaks
  for select using (auth.uid() = user_id);
create policy "streaks_upsert_own" on user_streaks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "coins_select_own" on eco_coins
  for select using (auth.uid() = user_id);
create policy "coins_upsert_own" on eco_coins
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "challenges_public_read" on challenges
  for select using (true);

create policy "user_challenges_select_own" on user_challenges
  for select using (auth.uid() = user_id);
create policy "user_challenges_upsert_own" on user_challenges
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "completed_tips_select_own" on completed_tips
  for select using (auth.uid() = user_id);
create policy "completed_tips_insert_own" on completed_tips
  for insert with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, city, state, diet_type)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    'Haridwar',
    'Uttarakhand',
    'vegetarian'
  )
  on conflict (id) do nothing;

  insert into public.user_streaks (user_id) values (new.id)
  on conflict (user_id) do nothing;

  insert into public.eco_coins (user_id) values (new.id)
  on conflict (user_id) do nothing;

  insert into public.user_settings (user_id, profile, language, notifications, appearance, privacy, sessions, notification_items)
  values (
    new.id,
    jsonb_build_object(
      'id', new.id,
      'name', coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
      'username', '',
      'email', coalesce(new.email, ''),
      'phone', '',
      'bio', '',
      'avatar', coalesce(new.raw_user_meta_data->>'avatar_url', ''),
      'createdAt', now()::text,
      'lastLogin', now()::text,
      'passwordHash', ''
    ),
    jsonb_build_object('code', 'en', 'unitSystem', 'metric', 'currency', 'INR', 'dateFormat', 'DD/MM/YYYY'),
    jsonb_build_object(
      'paused', false,
      'loginAlerts', true,
      'securityAlerts', true,
      'passwordChanges', true,
      'accountUpdates', true,
      'dailyCarbonReminders', true,
      'weeklyReports', true,
      'streakReminders', true,
      'challengeUpdates', true,
      'badgeUnlocks', true,
      'ecoCoinRewards', true,
      'productUpdates', true,
      'newsletter', false,
      'sustainabilityTips', true,
      'monthlySummaries', true,
      'browserNotifications', false,
      'mobileNotifications', false,
      'instantAlerts', false,
      'quietFrom', '22:00',
      'quietTo', '07:00',
      'noWeekends', false
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into challenges (title, description, target_kg, duration_days, starts_at, ends_at)
values (
  'Low-Carbon Week',
  'Reduce by 20% vs last week',
  7.5,
  7,
  current_date,
  current_date + interval '7 days'
)
on conflict do nothing;
