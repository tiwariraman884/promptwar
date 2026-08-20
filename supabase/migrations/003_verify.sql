-- ============================================================
-- STEP 1: Run this first to check if the migration worked
-- ============================================================
select
  table_name,
  (select count(*) from public.profiles) as profile_row_count
from information_schema.tables
where table_schema = 'public'
  and table_name = 'profiles';
