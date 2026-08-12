create table application_status_history (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications(id) on delete cascade,
  status text not null
    check (status in ('applied','phone_screen','interview','offer','rejected')),
  changed_at timestamptz not null default now()
);

create index application_status_history_app_idx
  on application_status_history (application_id, changed_at);

alter table application_status_history enable row level security;

create policy "select own application history" on application_status_history
  for select using (
    exists (
      select 1 from applications a
      where a.id = application_id and a.user_id = auth.uid()
    )
  );

-- Audit-log triggers write regardless of the caller's own RLS grants on this
-- table (there are none for insert/update/delete — only select, above).
create or replace function log_application_status_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.application_status_history (application_id, status)
  values (new.id, new.status);
  return new;
end;
$$;

create trigger applications_log_status_insert
  after insert on applications
  for each row execute function log_application_status_insert();

create or replace function log_application_status_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    insert into public.application_status_history (application_id, status)
    values (new.id, new.status);
  end if;
  return new;
end;
$$;

create trigger applications_log_status_update
  after update on applications
  for each row execute function log_application_status_update();

-- These are trigger-only functions; nothing useful happens if called directly
-- (NEW/OLD aren't bound outside trigger context), but revoke the RPC surface
-- anyway. Supabase grants EXECUTE directly to anon/authenticated by default
-- (not just via the PUBLIC pseudo-role), so both must be revoked explicitly.
revoke execute on function log_application_status_insert() from anon, authenticated;
revoke execute on function log_application_status_update() from anon, authenticated;

-- Backfill history for applications that already existed before this migration.
insert into application_status_history (application_id, status, changed_at)
select id, status, created_at from applications;
