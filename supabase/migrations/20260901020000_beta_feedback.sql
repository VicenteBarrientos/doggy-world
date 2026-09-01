-- Migration: 20260901020000_beta_feedback.sql
-- Lightweight beta feedback collection for authenticated testers

create table if not exists public.beta_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  category text not null default 'Otro',
  message text not null,
  page_path text,
  created_at timestamptz not null default now()
);

alter table public.beta_feedback enable row level security;

-- Authenticated users can insert their own feedback
create policy "feedback_insert_own"
on public.beta_feedback for insert
to authenticated
with check ((select auth.uid()) = user_id);

-- Normal users do not need to read feedback; keep collection write-only for testers
grant insert on public.beta_feedback to authenticated;
