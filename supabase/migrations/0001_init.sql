create table applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  company text not null,
  role text not null,
  status text not null default 'applied'
    check (status in ('applied','phone_screen','interview','offer','rejected')),
  date_applied date not null default current_date,
  follow_up_date date,
  notes text,
  job_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index applications_user_status_idx on applications (user_id, status);
create index applications_user_follow_up_idx on applications (user_id, follow_up_date);

-- keep updated_at current on every change
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger applications_set_updated_at
  before update on applications
  for each row execute function set_updated_at();

alter table applications enable row level security;

create policy "select own applications" on applications
  for select using (auth.uid() = user_id);
create policy "insert own applications" on applications
  for insert with check (auth.uid() = user_id);
create policy "update own applications" on applications
  for update using (auth.uid() = user_id);
create policy "delete own applications" on applications
  for delete using (auth.uid() = user_id);
