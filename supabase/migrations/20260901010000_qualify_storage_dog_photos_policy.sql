-- Migration: 20260901010000_qualify_storage_dog_photos_policy.sql
-- Fix: Qualify storage.objects.name in public dog photo select policy so PostgreSQL does not resolve unqualified `name` to public.dogs.name.

drop policy if exists "dog_photos_select_owner_or_public" on storage.objects;

create policy "dog_photos_select_owner_or_public"
on storage.objects for select
to anon, authenticated
using (
  bucket_id = 'dog-photos'
  and (
    (storage.foldername(name))[1] = (select auth.uid())::text
    or exists (
      select 1 from public.dogs
      where dogs.id::text = (storage.foldername(storage.objects.name))[2]
        and dogs.photo_path = storage.objects.name
        and dogs.is_public
    )
  )
);
