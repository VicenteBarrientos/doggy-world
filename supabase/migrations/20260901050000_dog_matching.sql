-- Migration: Doggy Match (Preferences, Actions, and Mutual Matches)
create table if not exists public.dog_match_preferences (
  dog_id uuid primary key references public.dogs(id) on delete cascade,
  enabled boolean not null default true,
  min_distance_km double precision not null default 0,
  max_distance_km double precision not null default 25.0,
  preferred_sizes text[] default array[]::text[],
  preferred_energy_levels text[] default array[]::text[],
  preferred_sociability text[] default array[]::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dog_match_actions (
  id uuid primary key default gen_random_uuid(),
  from_dog_id uuid not null references public.dogs(id) on delete cascade,
  to_dog_id uuid not null references public.dogs(id) on delete cascade,
  action text not null check (action in ('like', 'pass')),
  created_at timestamptz not null default now(),
  constraint dog_match_actions_unique_pair unique (from_dog_id, to_dog_id),
  constraint dog_match_actions_not_self check (from_dog_id != to_dog_id)
);

create table if not exists public.dog_matches (
  id uuid primary key default gen_random_uuid(),
  dog_a_id uuid not null references public.dogs(id) on delete cascade,
  dog_b_id uuid not null references public.dogs(id) on delete cascade,
  matched_at timestamptz not null default now(),
  status text not null default 'active' check (status in ('active', 'archived', 'unmatched')),
  constraint dog_matches_canonical_order check (dog_a_id < dog_b_id),
  constraint dog_matches_unique_pair unique (dog_a_id, dog_b_id)
);

create index if not exists dog_match_actions_from_to_idx
  on public.dog_match_actions (from_dog_id, to_dog_id);

create index if not exists dog_matches_pair_idx
  on public.dog_matches (dog_a_id, dog_b_id);

-- Enable RLS
alter table public.dog_match_preferences enable row level security;
alter table public.dog_match_actions enable row level security;
alter table public.dog_matches enable row level security;

-- Preferences policy (only dog owner)
drop policy if exists dog_match_preferences_owner_all on public.dog_match_preferences;
create policy dog_match_preferences_owner_all on public.dog_match_preferences
  for all
  using (
    exists (
      select 1 from public.dogs
      where dogs.id = dog_match_preferences.dog_id
        and dogs.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.dogs
      where dogs.id = dog_match_preferences.dog_id
        and dogs.owner_id = auth.uid()
    )
  );

-- Actions policy (owner of from_dog_id only)
drop policy if exists dog_match_actions_owner_all on public.dog_match_actions;
create policy dog_match_actions_owner_all on public.dog_match_actions
  for all
  using (
    exists (
      select 1 from public.dogs
      where dogs.id = dog_match_actions.from_dog_id
        and dogs.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.dogs
      where dogs.id = dog_match_actions.from_dog_id
        and dogs.owner_id = auth.uid()
    )
  );

-- Matches policy (participants only)
drop policy if exists dog_matches_participants_select on public.dog_matches;
create policy dog_matches_participants_select on public.dog_matches
  for select
  using (
    exists (
      select 1 from public.dogs
      where (dogs.id = dog_matches.dog_a_id or dogs.id = dog_matches.dog_b_id)
        and dogs.owner_id = auth.uid()
    )
  );

-- Grants
grant select, insert, update, delete on public.dog_match_preferences to authenticated;
grant select, insert, update, delete on public.dog_match_actions to authenticated;
grant select on public.dog_matches to authenticated;

-- Trigger to automatically create mutual match when both dogs like each other
create or replace function public.handle_dog_match_action()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reverse_like boolean;
  v_a uuid;
  v_b uuid;
begin
  if NEW.action = 'like' then
    select exists (
      select 1 from public.dog_match_actions
      where from_dog_id = NEW.to_dog_id
        and to_dog_id = NEW.from_dog_id
        and action = 'like'
    ) into v_reverse_like;

    if v_reverse_like then
      v_a := least(NEW.from_dog_id, NEW.to_dog_id);
      v_b := greatest(NEW.from_dog_id, NEW.to_dog_id);

      insert into public.dog_matches (dog_a_id, dog_b_id)
      values (v_a, v_b)
      on conflict (dog_a_id, dog_b_id) do update set status = 'active';
    end if;
  end if;
  return NEW;
end;
$$;

drop trigger if exists on_dog_match_action on public.dog_match_actions;
create trigger on_dog_match_action
  after insert or update on public.dog_match_actions
  for each row
  execute function public.handle_dog_match_action();
