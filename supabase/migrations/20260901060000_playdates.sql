-- Migration: Dog Playdates and Participants
create table if not exists public.playdates (
  id uuid primary key default gen_random_uuid(),
  host_dog_id uuid not null references public.dogs(id) on delete cascade,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz null,
  city text not null,
  location_label text not null,
  meeting_point geography(Point, 4326) null,
  notes text null,
  status text not null default 'scheduled' check (status in ('scheduled', 'cancelled', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.playdate_participants (
  id uuid primary key default gen_random_uuid(),
  playdate_id uuid not null references public.playdates(id) on delete cascade,
  dog_id uuid not null references public.dogs(id) on delete cascade,
  status text not null default 'invited' check (status in ('invited', 'accepted', 'declined')),
  invited_at timestamptz not null default now(),
  responded_at timestamptz null,
  constraint playdate_participants_unique_pair unique (playdate_id, dog_id)
);

create index if not exists playdates_host_idx on public.playdates (host_dog_id);
create index if not exists playdate_participants_dog_idx on public.playdate_participants (dog_id);
create index if not exists playdate_participants_playdate_idx on public.playdate_participants (playdate_id);

alter table public.playdates enable row level security;
alter table public.playdate_participants enable row level security;

-- Helper function for RLS
create or replace function public.is_playdate_host(p_id uuid, u_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.playdates p
    join public.dogs d on d.id = p.host_dog_id
    where p.id = p_id and d.owner_id = u_id
  );
$$;

alter function public.is_playdate_host(uuid, uuid) owner to postgres;

drop policy if exists playdates_select on public.playdates;
create policy playdates_select on public.playdates
  for select
  using (
    exists (
      select 1 from public.dogs
      where dogs.id = playdates.host_dog_id
        and dogs.owner_id = auth.uid()
    ) or
    exists (
      select 1 from public.playdate_participants pp
      join public.dogs d on d.id = pp.dog_id
      where pp.playdate_id = playdates.id
        and d.owner_id = auth.uid()
    )
  );

drop policy if exists playdates_insert on public.playdates;
create policy playdates_insert on public.playdates
  for insert
  with check (
    exists (
      select 1 from public.dogs
      where dogs.id = playdates.host_dog_id
        and dogs.owner_id = auth.uid()
    )
  );

drop policy if exists playdates_update on public.playdates;
create policy playdates_update on public.playdates
  for update
  using (
    exists (
      select 1 from public.dogs
      where dogs.id = playdates.host_dog_id
        and dogs.owner_id = auth.uid()
    )
  );

-- Participants policies
drop policy if exists playdate_participants_select on public.playdate_participants;
create policy playdate_participants_select on public.playdate_participants
  for select
  using (
    exists (
      select 1 from public.dogs
      where dogs.id = playdate_participants.dog_id
        and dogs.owner_id = auth.uid()
    ) or
    public.is_playdate_host(playdate_id, auth.uid())
  );

drop policy if exists playdate_participants_insert on public.playdate_participants;
create policy playdate_participants_insert on public.playdate_participants
  for insert
  with check (
    public.is_playdate_host(playdate_participants.playdate_id, auth.uid())
  );

drop policy if exists playdate_participants_update on public.playdate_participants;
create policy playdate_participants_update on public.playdate_participants
  for update
  using (
    exists (
      select 1 from public.dogs
      where dogs.id = playdate_participants.dog_id
        and dogs.owner_id = auth.uid()
    )
  );

grant select, insert, update on public.playdates to authenticated;
grant select, insert, update on public.playdate_participants to authenticated;
