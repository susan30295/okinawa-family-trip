begin;

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.trips (
  id text primary key,
  title text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id),
  deleted_at timestamptz,
  version integer not null default 1
);

create table if not exists public.trip_members (
  trip_id text not null references public.trips(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  role text not null default 'member' check (role in ('admin', 'member')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (trip_id, user_id)
);

create or replace function public.is_trip_member(target_trip_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.trip_members tm
    where tm.trip_id = target_trip_id
      and tm.user_id = auth.uid()
  );
$$;

create or replace function public.is_trip_admin(target_trip_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.trip_members tm
    where tm.trip_id = target_trip_id
      and tm.user_id = auth.uid()
      and tm.role = 'admin'
  );
$$;

create table if not exists public.trip_days (
  id uuid primary key default gen_random_uuid(),
  trip_id text not null references public.trips(id) on delete cascade,
  legacy_id text,
  label text not null,
  title text not null,
  date_value date,
  sort_order numeric not null default 1000,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id),
  deleted_at timestamptz,
  version integer not null default 1,
  unique (trip_id, legacy_id)
);

create table if not exists public.trip_hotels (
  id uuid primary key default gen_random_uuid(),
  trip_id text not null references public.trips(id) on delete cascade,
  day_id uuid references public.trip_days(id) on delete cascade,
  legacy_day_id text,
  name text not null default '',
  address text,
  phone text,
  maps_url text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id),
  deleted_at timestamptz,
  version integer not null default 1
);
create unique index if not exists trip_hotels_trip_legacy_day_unique
on public.trip_hotels (trip_id, legacy_day_id);

create table if not exists public.trip_stops (
  id uuid primary key default gen_random_uuid(),
  trip_id text not null references public.trips(id) on delete cascade,
  day_id uuid references public.trip_days(id) on delete cascade,
  legacy_id text,
  legacy_day_id text,
  stop_time time,
  title text not null,
  transport text,
  summary text,
  rain_plan text,
  tags text[] not null default '{}',
  budget numeric not null default 0,
  link_label text,
  official_url text,
  maps_url text,
  lat numeric,
  lng numeric,
  sort_order numeric not null default 1000,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id),
  deleted_at timestamptz,
  version integer not null default 1,
  unique (trip_id, legacy_id)
);

create table if not exists public.trip_routes (
  id uuid primary key default gen_random_uuid(),
  trip_id text not null references public.trips(id) on delete cascade,
  from_stop_id uuid references public.trip_stops(id) on delete cascade,
  to_stop_id uuid references public.trip_stops(id) on delete set null,
  legacy_from_stop_id text,
  transport text,
  mode text not null default 'driving',
  route_url text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id),
  deleted_at timestamptz,
  version integer not null default 1
);
create unique index if not exists trip_routes_trip_legacy_from_unique
on public.trip_routes (trip_id, legacy_from_stop_id);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  trip_id text not null references public.trips(id) on delete cascade,
  legacy_id text,
  title text not null,
  amount numeric not null default 0,
  payer_user_id uuid references auth.users(id),
  payer_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id),
  deleted_at timestamptz,
  version integer not null default 1,
  unique (trip_id, legacy_id)
);

create table if not exists public.expense_participants (
  expense_id uuid not null references public.expenses(id) on delete cascade,
  user_id uuid references auth.users(id),
  person_name text not null,
  created_at timestamptz not null default now(),
  primary key (expense_id, person_name)
);

create table if not exists public.location_points (
  id uuid primary key default gen_random_uuid(),
  trip_id text not null references public.trips(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  lat numeric not null,
  lng numeric not null,
  accuracy numeric,
  recorded_at timestamptz not null default now(),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id),
  deleted_at timestamptz,
  version integer not null default 1
);

create table if not exists public.personal_items (
  id uuid primary key default gen_random_uuid(),
  trip_id text not null references public.trips(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  owner_name text not null,
  item_type text not null check (item_type in ('packing', 'meds', 'shopping')),
  title text not null,
  amount numeric not null default 0,
  done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id),
  deleted_at timestamptz,
  version integer not null default 1
);

create table if not exists public.emergency_contacts (
  id uuid primary key default gen_random_uuid(),
  trip_id text not null references public.trips(id) on delete cascade,
  title text not null,
  value text not null,
  note text,
  sort_order numeric not null default 1000,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id),
  deleted_at timestamptz,
  version integer not null default 1
);
create unique index if not exists emergency_contacts_trip_title_unique
on public.emergency_contacts (trip_id, title);

insert into public.trips (id, title, description)
values ('okinawa-family-2026', '沖繩家庭旅程', '家人共同使用的沖繩旅遊行程')
on conflict (id) do update
set title = excluded.title,
    description = excluded.description,
    updated_at = now(),
    version = public.trips.version + 1;

alter table public.profiles enable row level security;
alter table public.trips enable row level security;
alter table public.trip_members enable row level security;
alter table public.trip_days enable row level security;
alter table public.trip_hotels enable row level security;
alter table public.trip_stops enable row level security;
alter table public.trip_routes enable row level security;
alter table public.expenses enable row level security;
alter table public.expense_participants enable row level security;
alter table public.location_points enable row level security;
alter table public.personal_items enable row level security;
alter table public.emergency_contacts enable row level security;

revoke select, insert, update on table public.trip_records from anon;
grant select, insert, update on table public.trip_records to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;

drop policy if exists "okinawa family read" on public.trip_records;
drop policy if exists "okinawa family insert" on public.trip_records;
drop policy if exists "okinawa family update" on public.trip_records;

create policy "profiles self read" on public.profiles
for select to authenticated
using (user_id = auth.uid());

create policy "profiles self upsert" on public.profiles
for insert to authenticated
with check (user_id = auth.uid());

create policy "profiles self update" on public.profiles
for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "members read own trips" on public.trip_members
for select to authenticated
using (user_id = auth.uid() or public.is_trip_member(trip_id));

create policy "admins manage members" on public.trip_members
for all to authenticated
using (public.is_trip_admin(trip_id))
with check (public.is_trip_admin(trip_id));

create policy "members read trips" on public.trips
for select to authenticated
using (public.is_trip_member(id));

create policy "admins update trips" on public.trips
for update to authenticated
using (public.is_trip_admin(id))
with check (public.is_trip_admin(id));

create policy "members read trip records" on public.trip_records
for select to authenticated
using (public.is_trip_member(trip_id));

create policy "members insert trip records" on public.trip_records
for insert to authenticated
with check (public.is_trip_member(trip_id));

create policy "members update trip records" on public.trip_records
for update to authenticated
using (public.is_trip_member(trip_id))
with check (public.is_trip_member(trip_id));

create policy "members read days" on public.trip_days
for select to authenticated
using (public.is_trip_member(trip_id));
create policy "members write days" on public.trip_days
for all to authenticated
using (public.is_trip_member(trip_id))
with check (public.is_trip_member(trip_id));

create policy "members read hotels" on public.trip_hotels
for select to authenticated
using (public.is_trip_member(trip_id));
create policy "members write hotels" on public.trip_hotels
for all to authenticated
using (public.is_trip_member(trip_id))
with check (public.is_trip_member(trip_id));

create policy "members read stops" on public.trip_stops
for select to authenticated
using (public.is_trip_member(trip_id));
create policy "members write stops" on public.trip_stops
for all to authenticated
using (public.is_trip_member(trip_id))
with check (public.is_trip_member(trip_id));

create policy "members read routes" on public.trip_routes
for select to authenticated
using (public.is_trip_member(trip_id));
create policy "members write routes" on public.trip_routes
for all to authenticated
using (public.is_trip_member(trip_id))
with check (public.is_trip_member(trip_id));

create policy "members read expenses" on public.expenses
for select to authenticated
using (public.is_trip_member(trip_id));
create policy "members write expenses" on public.expenses
for all to authenticated
using (public.is_trip_member(trip_id))
with check (public.is_trip_member(trip_id));

create policy "members read expense participants" on public.expense_participants
for select to authenticated
using (
  exists (
    select 1 from public.expenses e
    where e.id = expense_participants.expense_id
      and public.is_trip_member(e.trip_id)
  )
);
create policy "members write expense participants" on public.expense_participants
for all to authenticated
using (
  exists (
    select 1 from public.expenses e
    where e.id = expense_participants.expense_id
      and public.is_trip_member(e.trip_id)
  )
)
with check (
  exists (
    select 1 from public.expenses e
    where e.id = expense_participants.expense_id
      and public.is_trip_member(e.trip_id)
  )
);

create policy "members read locations" on public.location_points
for select to authenticated
using (public.is_trip_member(trip_id));
create policy "owners write locations" on public.location_points
for all to authenticated
using (owner_user_id = auth.uid() or public.is_trip_admin(trip_id))
with check (owner_user_id = auth.uid() or public.is_trip_admin(trip_id));

create policy "members read personal items" on public.personal_items
for select to authenticated
using (public.is_trip_member(trip_id));
create policy "owners write personal items" on public.personal_items
for all to authenticated
using (owner_user_id = auth.uid() or public.is_trip_admin(trip_id))
with check (owner_user_id = auth.uid() or public.is_trip_admin(trip_id));

create policy "members read emergency contacts" on public.emergency_contacts
for select to authenticated
using (public.is_trip_member(trip_id));
create policy "members write emergency contacts" on public.emergency_contacts
for all to authenticated
using (public.is_trip_member(trip_id))
with check (public.is_trip_member(trip_id));

commit;
