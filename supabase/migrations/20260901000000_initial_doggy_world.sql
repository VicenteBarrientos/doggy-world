create extension if not exists pgcrypto with schema extensions;

create type public.dog_sex as enum ('female', 'male', 'unknown');
create type public.dog_size as enum ('small', 'medium', 'large', 'giant');
create type public.energy_level as enum ('low', 'medium', 'high', 'very_high');
create type public.sociability_level as enum ('shy', 'selective', 'social', 'very_social');
create type public.product_category as enum (
  'toy', 'treat', 'food', 'accessory', 'enrichment', 'health', 'other'
);
create type public.product_reaction as enum ('loved', 'liked', 'neutral', 'disliked');
create type public.preference_category as enum (
  'toy', 'treat', 'food', 'activity', 'behavior', 'other'
);
create type public.preference_source as enum ('owner', 'product_feedback', 'system');
create type public.friendship_status as enum ('pending', 'accepted', 'declined', 'blocked');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 60),
  username text,
  avatar_url text,
  city text check (city is null or char_length(city) <= 80),
  country text check (country is null or char_length(country) <= 80),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint profiles_username_format check (
    username is null or username ~ '^[a-z0-9_]{2,30}$'
  )
);

create unique index profiles_username_lower_unique
  on public.profiles (lower(username))
  where username is not null;

create table public.dogs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 50),
  slug text not null unique check (
    char_length(slug) between 3 and 64 and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  photo_path text,
  breed text not null check (char_length(breed) between 2 and 80),
  mixed_breed boolean not null default false,
  sex public.dog_sex not null default 'unknown',
  birth_date date,
  adoption_date date,
  weight_kg numeric(5, 2) check (weight_kg is null or weight_kg > 0 and weight_kg <= 150),
  size public.dog_size not null,
  energy_level public.energy_level not null,
  sociability public.sociability_level not null,
  play_style text check (play_style is null or char_length(play_style) <= 100),
  personality_tags text[] not null default '{}',
  bio text not null default '' check (char_length(bio) <= 600),
  city text check (city is null or char_length(city) <= 80),
  country text check (country is null or char_length(country) <= 80),
  is_public boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint dogs_dates_valid check (
    birth_date is null or adoption_date is null or adoption_date >= birth_date
  ),
  constraint dogs_personality_tags_limit check (cardinality(personality_tags) <= 6)
);

create index dogs_owner_id_idx on public.dogs(owner_id);
create index dogs_public_created_idx on public.dogs(created_at desc) where is_public;
create index dogs_city_public_idx on public.dogs(city) where is_public and city is not null;

create table public.dog_preferences (
  id uuid primary key default gen_random_uuid(),
  dog_id uuid not null references public.dogs(id) on delete cascade,
  category public.preference_category not null,
  preference_key text not null check (
    char_length(preference_key) between 2 and 60
    and preference_key ~ '^[a-z0-9_:-]+$'
  ),
  value text not null check (char_length(value) between 2 and 120),
  sentiment smallint not null default 1 check (sentiment between -2 and 2),
  confidence numeric(3, 2) check (confidence is null or confidence between 0 and 1),
  source public.preference_source not null default 'owner',
  is_public boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (dog_id, category, preference_key)
);

create index dog_preferences_dog_id_idx on public.dog_preferences(dog_id);
create index dog_preferences_analysis_idx
  on public.dog_preferences(category, preference_key, sentiment);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  slug text not null unique check (
    char_length(slug) between 3 and 140 and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  brand text check (brand is null or char_length(brand) <= 100),
  category public.product_category not null,
  description text check (description is null or char_length(description) <= 1000),
  image_url text,
  external_reference text,
  durability smallint check (durability is null or durability between 1 and 5),
  material text check (material is null or char_length(material) <= 80),
  intended_dog_size public.dog_size,
  toy_type text check (toy_type is null or char_length(toy_type) <= 60),
  food_protein text check (food_protein is null or char_length(food_protein) <= 60),
  texture text check (texture is null or char_length(texture) <= 60),
  enrichment_type text check (enrichment_type is null or char_length(enrichment_type) <= 60),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index products_category_active_idx on public.products(category) where is_active;

create table public.dog_product_interactions (
  id uuid primary key default gen_random_uuid(),
  dog_id uuid not null references public.dogs(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  reaction public.product_reaction not null,
  rating smallint check (rating is null or rating between 1 and 5),
  favorite boolean not null default false,
  destroyed boolean,
  lifetime_hours numeric(10, 2) check (lifetime_hours is null or lifetime_hours >= 0),
  accepted boolean,
  would_buy_again boolean,
  possible_reaction boolean,
  notes text check (notes is null or char_length(notes) <= 400),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (dog_id, product_id)
);

create index dog_product_interactions_dog_idx
  on public.dog_product_interactions(dog_id, updated_at desc);
create index dog_product_interactions_analysis_idx
  on public.dog_product_interactions(product_id, reaction, rating);
create index dog_product_interactions_favorites_idx
  on public.dog_product_interactions(dog_id)
  where favorite;

create table public.dog_friendships (
  id uuid primary key default gen_random_uuid(),
  requester_dog_id uuid not null references public.dogs(id) on delete cascade,
  recipient_dog_id uuid not null references public.dogs(id) on delete cascade,
  status public.friendship_status not null default 'pending',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  responded_at timestamptz,
  constraint dog_friendships_not_self check (requester_dog_id <> recipient_dog_id)
);

create unique index dog_friendships_unique_pair_idx
  on public.dog_friendships (
    least(requester_dog_id, recipient_dog_id),
    greatest(requester_dog_id, recipient_dog_id)
  );
create index dog_friendships_requester_idx on public.dog_friendships(requester_dog_id, status);
create index dog_friendships_recipient_idx on public.dog_friendships(recipient_dog_id, status);

create or replace function public.validate_friendship_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.requester_dog_id <> old.requester_dog_id
    or new.recipient_dog_id <> old.recipient_dog_id then
    raise exception 'Friendship endpoints are immutable';
  end if;

  if new.status <> old.status then
    if not (
      (old.status = 'pending' and new.status in ('accepted', 'declined', 'blocked'))
      or (old.status = 'accepted' and new.status = 'blocked')
    ) then
      raise exception 'Invalid friendship status transition';
    end if;
    new.responded_at = timezone('utc', now());
  end if;

  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();
create trigger dogs_set_updated_at
before update on public.dogs
for each row execute function public.set_updated_at();
create trigger dog_preferences_set_updated_at
before update on public.dog_preferences
for each row execute function public.set_updated_at();
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();
create trigger dog_product_interactions_set_updated_at
before update on public.dog_product_interactions
for each row execute function public.set_updated_at();
create trigger dog_friendships_validate_update
before update on public.dog_friendships
for each row execute function public.validate_friendship_update();
create trigger dog_friendships_set_updated_at
before update on public.dog_friendships
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    left(
      coalesce(
        nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
        nullif(split_part(new.email, '@', 1), ''),
        'Dog lover'
      ),
      60
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.dogs enable row level security;
alter table public.dog_preferences enable row level security;
alter table public.products enable row level security;
alter table public.dog_product_interactions enable row level security;
alter table public.dog_friendships enable row level security;

create policy "profiles_select_own"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check ((select auth.uid()) = id);

create policy "profiles_update_own"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "dogs_select_owner_or_public"
on public.dogs for select
to anon, authenticated
using (is_public or (select auth.uid()) = owner_id);

create policy "dogs_insert_own"
on public.dogs for insert
to authenticated
with check ((select auth.uid()) = owner_id);

create policy "dogs_update_own"
on public.dogs for update
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

create policy "dogs_delete_own"
on public.dogs for delete
to authenticated
using ((select auth.uid()) = owner_id);

create policy "preferences_select_owner_or_public"
on public.dog_preferences for select
to anon, authenticated
using (
  exists (
    select 1
    from public.dogs
    where dogs.id = dog_preferences.dog_id
      and (dogs.owner_id = (select auth.uid()) or (dogs.is_public and dog_preferences.is_public))
  )
);

create policy "preferences_insert_for_owned_dog"
on public.dog_preferences for insert
to authenticated
with check (
  exists (
    select 1 from public.dogs
    where dogs.id = dog_preferences.dog_id
      and dogs.owner_id = (select auth.uid())
  )
);

create policy "preferences_update_for_owned_dog"
on public.dog_preferences for update
to authenticated
using (
  exists (
    select 1 from public.dogs
    where dogs.id = dog_preferences.dog_id
      and dogs.owner_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.dogs
    where dogs.id = dog_preferences.dog_id
      and dogs.owner_id = (select auth.uid())
  )
);

create policy "preferences_delete_for_owned_dog"
on public.dog_preferences for delete
to authenticated
using (
  exists (
    select 1 from public.dogs
    where dogs.id = dog_preferences.dog_id
      and dogs.owner_id = (select auth.uid())
  )
);

create policy "products_select_active"
on public.products for select
to anon, authenticated
using (is_active);

create policy "interactions_select_for_owned_dog"
on public.dog_product_interactions for select
to authenticated
using (
  exists (
    select 1 from public.dogs
    where dogs.id = dog_product_interactions.dog_id
      and dogs.owner_id = (select auth.uid())
  )
);

create policy "interactions_insert_for_owned_dog"
on public.dog_product_interactions for insert
to authenticated
with check (
  exists (
    select 1 from public.dogs
    where dogs.id = dog_product_interactions.dog_id
      and dogs.owner_id = (select auth.uid())
  )
);

create policy "interactions_update_for_owned_dog"
on public.dog_product_interactions for update
to authenticated
using (
  exists (
    select 1 from public.dogs
    where dogs.id = dog_product_interactions.dog_id
      and dogs.owner_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.dogs
    where dogs.id = dog_product_interactions.dog_id
      and dogs.owner_id = (select auth.uid())
  )
);

create policy "interactions_delete_for_owned_dog"
on public.dog_product_interactions for delete
to authenticated
using (
  exists (
    select 1 from public.dogs
    where dogs.id = dog_product_interactions.dog_id
      and dogs.owner_id = (select auth.uid())
  )
);

create policy "friendships_select_relevant_or_public"
on public.dog_friendships for select
to anon, authenticated
using (
  exists (
    select 1 from public.dogs
    where dogs.id in (dog_friendships.requester_dog_id, dog_friendships.recipient_dog_id)
      and dogs.owner_id = (select auth.uid())
  )
  or (
    dog_friendships.status = 'accepted'
    and exists (
      select 1 from public.dogs requester
      join public.dogs recipient on recipient.id = dog_friendships.recipient_dog_id
      where requester.id = dog_friendships.requester_dog_id
        and requester.is_public
        and recipient.is_public
    )
  )
);

create policy "friendships_insert_from_owned_to_public"
on public.dog_friendships for insert
to authenticated
with check (
  dog_friendships.status = 'pending'
  and exists (
    select 1 from public.dogs requester
    where requester.id = dog_friendships.requester_dog_id
      and requester.owner_id = (select auth.uid())
  )
  and exists (
    select 1 from public.dogs recipient
    where recipient.id = dog_friendships.recipient_dog_id
      and recipient.is_public
  )
);

create policy "friendships_update_by_recipient_owner"
on public.dog_friendships for update
to authenticated
using (
  exists (
    select 1 from public.dogs recipient
    where recipient.id = dog_friendships.recipient_dog_id
      and recipient.owner_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.dogs recipient
    where recipient.id = dog_friendships.recipient_dog_id
      and recipient.owner_id = (select auth.uid())
  )
);

create policy "friendships_delete_by_relevant_owner"
on public.dog_friendships for delete
to authenticated
using (
  exists (
    select 1 from public.dogs
    where dogs.id in (dog_friendships.requester_dog_id, dog_friendships.recipient_dog_id)
      and dogs.owner_id = (select auth.uid())
  )
);

create or replace function public.get_public_dog_favorites(public_dog_id uuid)
returns table (
  product_id uuid,
  name text,
  slug text,
  category public.product_category,
  image_url text
)
language sql
stable
security definer
set search_path = ''
as $$
  select products.id, products.name, products.slug, products.category, products.image_url
  from public.dog_product_interactions interactions
  join public.dogs on dogs.id = interactions.dog_id
  join public.products on products.id = interactions.product_id
  where interactions.dog_id = public_dog_id
    and interactions.favorite
    and dogs.is_public
    and products.is_active
  order by interactions.updated_at desc
  limit 6;
$$;

revoke all on function public.get_public_dog_favorites(uuid) from public;
grant execute on function public.get_public_dog_favorites(uuid) to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'dog-photos',
  'dog-photos',
  false,
  3145728,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "dog_photos_select_owner_or_public"
on storage.objects for select
to anon, authenticated
using (
  bucket_id = 'dog-photos'
  and (
    (storage.foldername(name))[1] = (select auth.uid())::text
    or exists (
      select 1 from public.dogs
      where dogs.id::text = (storage.foldername(name))[2]
        and dogs.photo_path = storage.objects.name
        and dogs.is_public
    )
  )
);

create policy "dog_photos_insert_own_folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'dog-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "dog_photos_update_own_folder"
on storage.objects for update
to authenticated
using (
  bucket_id = 'dog-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'dog-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "dog_photos_delete_own_folder"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'dog-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

grant usage on schema public to anon, authenticated;
grant select on public.dogs, public.dog_preferences, public.products, public.dog_friendships
  to anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
grant insert, update, delete on public.dogs, public.dog_preferences, public.dog_friendships
  to authenticated;
grant select, insert, update, delete on public.dog_product_interactions to authenticated;
