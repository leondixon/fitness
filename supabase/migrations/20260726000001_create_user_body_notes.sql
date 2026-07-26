create table public.user_body_notes (
  user_id uuid primary key references auth.users (id) on delete cascade,
  notes text not null check (char_length(notes) <= 2000),
  updated_at timestamptz not null default now()
);
