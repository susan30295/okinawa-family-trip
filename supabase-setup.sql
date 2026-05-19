create table if not exists public.trip_records (
  trip_id text not null,
  entity text not null check (entity in ('day', 'stop', 'route', 'hotel', 'expense', 'people')),
  record_id text not null,
  op text not null default 'update',
  fields jsonb not null default '[]'::jsonb,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by text not null default 'unknown',
  deleted_at timestamptz,
  version integer not null default 1,
  primary key (trip_id, entity, record_id)
);

alter table public.trip_records enable row level security;

grant select, insert, update on table public.trip_records to anon;

drop policy if exists "okinawa family read" on public.trip_records;
drop policy if exists "okinawa family insert" on public.trip_records;
drop policy if exists "okinawa family update" on public.trip_records;

create policy "okinawa family read"
on public.trip_records
for select
to anon
using (trip_id = 'okinawa-family-2026');

create policy "okinawa family insert"
on public.trip_records
for insert
to anon
with check (trip_id = 'okinawa-family-2026');

create policy "okinawa family update"
on public.trip_records
for update
to anon
using (trip_id = 'okinawa-family-2026')
with check (trip_id = 'okinawa-family-2026');
