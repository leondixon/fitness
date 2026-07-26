create table public.routine_versions (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  version integer not null check (version > 0),
  request text not null,
  title text not null,
  summary text not null,
  status text not null check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  archived_at timestamptz,
  unique (user_id, version)
);

create unique index routine_versions_one_active_per_user
  on public.routine_versions (user_id) where status = 'active';

create table public.workout_templates (
  id uuid primary key,
  routine_id uuid not null references public.routine_versions (id) on delete cascade,
  position integer not null check (position >= 0),
  title text not null,
  subtitle text,
  focus text,
  notes text,
  unique (routine_id, position)
);

create table public.prescribed_exercises (
  id uuid primary key,
  workout_template_id uuid not null references public.workout_templates (id) on delete cascade,
  position integer not null check (position >= 0),
  name text not null,
  normalized_name text not null,
  rest_seconds integer check (rest_seconds >= 0),
  work_set_seconds integer check (work_set_seconds > 0),
  unique (workout_template_id, position)
);

create table public.prescribed_sets (
  id uuid primary key,
  exercise_id uuid not null references public.prescribed_exercises (id) on delete cascade,
  position integer not null check (position >= 0),
  reps text not null,
  weight text not null,
  warmup boolean not null default false,
  unique (exercise_id, position)
);

create table public.user_routine_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  routine_id uuid not null references public.routine_versions (id) on delete cascade,
  next_workout_position integer not null default 0 check (next_workout_position >= 0)
);

create table public.workout_sessions (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  routine_id uuid not null references public.routine_versions (id),
  workout_template_id uuid not null references public.workout_templates (id),
  rotation_position integer not null check (rotation_position >= 0),
  status text not null default 'in_progress' check (status in ('in_progress', 'completed')),
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create unique index workout_sessions_one_in_progress_per_user
  on public.workout_sessions (user_id) where status = 'in_progress';

create table public.exercise_results (
  id uuid primary key,
  session_id uuid not null references public.workout_sessions (id) on delete cascade,
  exercise_id uuid not null references public.prescribed_exercises (id),
  exercise_name text not null,
  normalized_name text not null,
  completed boolean not null default true,
  sets jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  unique (session_id, exercise_id)
);

create or replace function public.activate_routine(
  p_user_id uuid,
  p_routine jsonb
) returns uuid
language plpgsql
as $$
declare
  v_routine_id uuid := (p_routine->>'id')::uuid;
  v_workout jsonb;
  v_exercise jsonb;
  v_set jsonb;
begin
  if auth.uid() is distinct from p_user_id then
    raise exception 'not authorized';
  end if;

  update public.routine_versions
  set status = 'archived', archived_at = now()
  where user_id = p_user_id and status = 'active';

  delete from public.workout_sessions
  where user_id = p_user_id and status = 'in_progress';

  insert into public.routine_versions (id, user_id, version, request, title, summary, status)
  values (
    v_routine_id,
    p_user_id,
    (p_routine->>'version')::integer,
    p_routine->>'request',
    p_routine->>'title',
    p_routine->>'summary',
    'active'
  );

  for v_workout in select value from jsonb_array_elements(p_routine->'workouts')
  loop
    insert into public.workout_templates (id, routine_id, position, title, subtitle, focus, notes)
    values (
      (v_workout->>'id')::uuid, v_routine_id, (v_workout->>'position')::integer,
      v_workout->>'title', v_workout->>'subtitle', v_workout->>'focus', v_workout->>'notes'
    );

    for v_exercise in select value from jsonb_array_elements(v_workout->'exercises')
    loop
      insert into public.prescribed_exercises (
        id, workout_template_id, position, name, normalized_name, rest_seconds, work_set_seconds
      ) values (
        (v_exercise->>'id')::uuid, (v_workout->>'id')::uuid, (v_exercise->>'position')::integer,
        v_exercise->>'name', v_exercise->>'normalizedName',
        nullif(v_exercise->>'restSeconds', '')::integer,
        nullif(v_exercise->>'workSetSeconds', '')::integer
      );

      for v_set in select value from jsonb_array_elements(v_exercise->'sets')
      loop
        insert into public.prescribed_sets (id, exercise_id, position, reps, weight, warmup)
        values (
          (v_set->>'id')::uuid, (v_exercise->>'id')::uuid, (v_set->>'position')::integer,
          v_set->>'reps', v_set->>'weight', coalesce((v_set->>'warmup')::boolean, false)
        );
      end loop;
    end loop;
  end loop;

  insert into public.user_routine_state (user_id, routine_id, next_workout_position)
  values (p_user_id, v_routine_id, 0)
  on conflict (user_id) do update
    set routine_id = excluded.routine_id, next_workout_position = 0;

  return v_routine_id;
end;
$$;

create or replace function public.finish_workout_session(
  p_user_id uuid,
  p_session_id uuid
) returns boolean
language plpgsql
as $$
declare
  v_session public.workout_sessions%rowtype;
  v_workout_count integer;
begin
  if auth.uid() is distinct from p_user_id then
    raise exception 'not authorized';
  end if;

  select * into v_session
  from public.workout_sessions
  where id = p_session_id and user_id = p_user_id
  for update;

  if not found then
    raise exception 'workout session not found';
  end if;

  if v_session.status = 'completed' then
    return false;
  end if;

  update public.workout_sessions
  set status = 'completed', completed_at = now()
  where id = p_session_id;

  select count(*) into v_workout_count
  from public.workout_templates where routine_id = v_session.routine_id;

  update public.user_routine_state
  set next_workout_position = (v_session.rotation_position + 1) % v_workout_count
  where user_id = p_user_id
    and routine_id = v_session.routine_id
    and next_workout_position = v_session.rotation_position;

  return true;
end;
$$;

-- This personal application deliberately does not enable RLS. Server handlers
-- authenticate every request and scope every query and mutation to user_id.
