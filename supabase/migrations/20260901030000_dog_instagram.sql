-- Migration: Add optional instagram_handle to public.dogs
alter table public.dogs
  add column if not exists instagram_handle text null;

-- Add check constraint for valid Instagram handles (1-30 chars, letters, numbers, periods, underscores)
alter table public.dogs
  drop constraint if exists dogs_instagram_handle_format,
  add constraint dogs_instagram_handle_format
  check (
    instagram_handle is null or
    instagram_handle ~ '^[a-zA-Z0-9._]{1,30}$'
  );
