-- Do Arena — core schema
-- Run this in the Supabase SQL editor (or `supabase db push`) on your project.
-- Safe to re-run: every statement is guarded with IF NOT EXISTS / OR REPLACE.

-- Needed so the exclusion constraint below can compare court_id with "=" and
-- time_range with "&&" in the same GiST index.
create extension if not exists btree_gist;

-- ---------------------------------------------------------------------------
-- profiles: one row per authenticated user (created by the trigger below)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles are viewable by owner" on public.profiles;
create policy "profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles are editable by owner" on public.profiles;
create policy "profiles are editable by owner"
  on public.profiles for update
  using (auth.uid() = id);

-- auto-create a profile row when someone signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- venues: one physical Do Arena location, offering a single sport
-- ---------------------------------------------------------------------------
create table if not exists public.venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sport text not null check (sport in ('futsal', 'padel', 'pickleball')),
  city text not null,
  address text,
  price_per_hour numeric(10, 2) not null default 0,
  image_url text,
  description text,
  open_time time not null default '08:00',
  close_time time not null default '23:00',
  slot_minutes int not null default 60,
  created_at timestamptz not null default now()
);

alter table public.venues enable row level security;

drop policy if exists "venues are public" on public.venues;
create policy "venues are public"
  on public.venues for select
  using (true);

-- ---------------------------------------------------------------------------
-- courts: individual bookable courts inside a venue
-- ---------------------------------------------------------------------------
create table if not exists public.courts (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

alter table public.courts enable row level security;

drop policy if exists "courts are public" on public.courts;
create policy "courts are public"
  on public.courts for select
  using (true);

-- ---------------------------------------------------------------------------
-- bookings: a confirmed/pending reservation of one court for a time range
-- ---------------------------------------------------------------------------
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  court_id uuid not null references public.courts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  time_range tstzrange not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  total_price numeric(10, 2),
  created_at timestamptz not null default now(),

  -- Prevents two active bookings on the same court from overlapping in time.
  -- Cancelled bookings are excluded so a cancelled slot frees up the court.
  constraint bookings_no_overlap
    exclude using gist (court_id with =, time_range with &&)
    where (status <> 'cancelled')
);

create index if not exists bookings_court_id_idx on public.bookings (court_id);
create index if not exists bookings_user_id_idx on public.bookings (user_id);

alter table public.bookings enable row level security;

drop policy if exists "users can view their own bookings" on public.bookings;
create policy "users can view their own bookings"
  on public.bookings for select
  using (auth.uid() = user_id);

drop policy if exists "users can create their own bookings" on public.bookings;
create policy "users can create their own bookings"
  on public.bookings for insert
  with check (auth.uid() = user_id);

drop policy if exists "users can cancel their own pending bookings" on public.bookings;
create policy "users can cancel their own pending bookings"
  on public.bookings for update
  using (auth.uid() = user_id and status = 'pending')
  with check (status = 'cancelled');

-- Booked slots must be visible to everyone (as "taken"), without exposing
-- who booked them — this view is what the availability API reads from.
create or replace view public.booked_slots as
  select court_id, time_range
  from public.bookings
  where status <> 'cancelled';

grant select on public.booked_slots to anon, authenticated;

-- ---------------------------------------------------------------------------
-- seed data — matches the four sample venues used in the UI mock
-- Comment this block out if you already have real venues.
-- ---------------------------------------------------------------------------
insert into public.venues (name, slug, sport, city, address, price_per_hour, image_url, description)
values
  ('Do Arena 163', 'do-arena-163', 'futsal', 'Alor Setar', 'Jalan 163, Alor Setar, Kedah', 80, null, 'Indoor futsal courts with artificial turf.'),
  ('Do Arena Lalaport', 'do-arena-lalaport', 'padel', 'Sungai Petani', 'Lalaport Mall, Sungai Petani, Kedah', 100, null, 'Air-conditioned indoor padel courts.'),
  ('Do Arena 1MK', 'do-arena-1mk', 'futsal', 'Kulim', '1 Mutiara Kulim, Kedah', 70, null, 'Rooftop futsal arena with night lighting.'),
  ('Do Arena Pickleball and Padel', 'do-arena-pickle-and-padel', 'pickleball', 'Jitra', 'Jitra Sports Complex, Kedah', 40, null, 'Dedicated pickleball and padel courts.')
on conflict (slug) do nothing;

insert into public.courts (venue_id, name)
select v.id, c.name
from public.venues v
cross join lateral (
  values ('Court 1'), ('Court 2'), ('Court 3')
) as c(name)
where v.slug in ('do-arena-163', 'do-arena-lalaport', 'do-arena-1mk')
on conflict do nothing;

insert into public.courts (venue_id, name)
select v.id, c.name
from public.venues v
cross join lateral (
  values ('Court 1'), ('Court 2'), ('Court 3'), ('Court 4')
) as c(name)
where v.slug = 'do-arena-pickle-and-padel'
on conflict do nothing;
