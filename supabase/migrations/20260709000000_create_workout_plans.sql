create table public.workout_plans (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  goal text not null,
  title text not null,
  summary text not null,
  workouts jsonb not null,
  change_log jsonb not null,
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workout_plans_one_active_plan_per_user unique (user_id)
);

-- This personal application deliberately does not enable RLS. Server handlers
-- authenticate every request and scope every plan query/mutation to user_id.
