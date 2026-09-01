-- Migration: Nearby Dogs & Location Privacy (PostGIS)
create extension if not exists postgis;

create table if not exists public.dog_locations (
  id uuid primary key default gen_random_uuid(),
  dog_id uuid not null references public.dogs(id) on delete cascade,
  location geography(Point, 4326) not null,
  nearby_enabled boolean not null default true,
  city text null,
  location_label text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dog_locations_dog_id_unique unique (dog_id)
);

create index if not exists dog_locations_location_idx
  on public.dog_locations using gist (location);

create index if not exists dog_locations_dog_id_idx
  on public.dog_locations (dog_id);

alter table public.dog_locations enable row level security;

-- Only dog owners can read, insert, update, or delete their dog's exact location
drop policy if exists dog_locations_owner_manage on public.dog_locations;
create policy dog_locations_owner_manage on public.dog_locations
  for all
  using (
    exists (
      select 1 from public.dogs
      where dogs.id = dog_locations.dog_id
        and dogs.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.dogs
      where dogs.id = dog_locations.dog_id
        and dogs.owner_id = auth.uid()
    )
  );

grant select, insert, update, delete on public.dog_locations to authenticated;

-- Privacy-preserving RPC to discover nearby dogs without exposing exact coordinates
create or replace function public.get_nearby_dogs(
  requesting_dog_id uuid,
  center_lat double precision,
  center_lng double precision,
  radius_km double precision default 5.0
)
returns table (
  dog_id uuid,
  name text,
  slug text,
  breed text,
  photo_path text,
  size text,
  energy_level text,
  sociability text,
  play_style text,
  city text,
  approx_lat double precision,
  approx_lng double precision,
  distance_km double precision
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_owner_id uuid;
  v_center_geo geography;
  v_clamped_radius double precision;
begin
  -- Verify requesting dog belongs to calling user
  select owner_id into v_owner_id
  from public.dogs
  where id = requesting_dog_id;

  if v_owner_id is null or v_owner_id != auth.uid() then
    raise exception 'No autorizado para consultar perros cercanos para este perro.';
  end if;

  -- Clamp radius between 0.5 km and 50 km (default 5.0 km)
  v_clamped_radius := greatest(0.5, least(50.0, coalesce(radius_km, 5.0))) * 1000.0;
  v_center_geo := ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)::geography;

  return query
  select
    d.id as dog_id,
    d.name,
    d.slug,
    d.breed,
    d.photo_path,
    d.size::text,
    d.energy_level::text,
    d.sociability::text,
    d.play_style,
    d.city,
    ST_Y(ST_SnapToGrid(dl.location::geometry, 0.01)) as approx_lat,
    ST_X(ST_SnapToGrid(dl.location::geometry, 0.01)) as approx_lng,
    round((ST_Distance(dl.location, v_center_geo) / 1000.0)::numeric, 1)::double precision as distance_km
  from public.dog_locations dl
  join public.dogs d on d.id = dl.dog_id
  where dl.nearby_enabled = true
    and d.is_public = true
    and d.id != requesting_dog_id
    and d.owner_id != v_owner_id
    and ST_DWithin(dl.location, v_center_geo, v_clamped_radius)
    and not exists (
      select 1 from public.dog_friendships df
      where df.status = 'blocked'
        and (
          (df.requester_dog_id = requesting_dog_id and df.recipient_dog_id = d.id) or
          (df.recipient_dog_id = requesting_dog_id and df.requester_dog_id = d.id)
        )
    )
  order by ST_Distance(dl.location, v_center_geo) asc
  limit 50;
end;
$$;

grant execute on function public.get_nearby_dogs to authenticated;
