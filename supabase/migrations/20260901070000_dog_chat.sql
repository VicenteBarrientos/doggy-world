-- Migration: Dog Chat (Conversations and Realtime Messages)
create table if not exists public.dog_conversations (
  id uuid primary key default gen_random_uuid(),
  dog_a_id uuid not null references public.dogs(id) on delete cascade,
  dog_b_id uuid not null references public.dogs(id) on delete cascade,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  constraint dog_conversations_canonical_order check (dog_a_id < dog_b_id),
  constraint dog_conversations_unique_pair unique (dog_a_id, dog_b_id)
);

create table if not exists public.dog_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.dog_conversations(id) on delete cascade,
  sender_dog_id uuid not null references public.dogs(id) on delete cascade,
  body text not null check (char_length(body) >= 1 and char_length(body) <= 1000),
  created_at timestamptz not null default now()
);

create index if not exists dog_conversations_pair_idx
  on public.dog_conversations (dog_a_id, dog_b_id);

create index if not exists dog_messages_conversation_idx
  on public.dog_messages (conversation_id, created_at);

alter table public.dog_conversations enable row level security;
alter table public.dog_messages enable row level security;

-- Helper function to check conversation participation
create or replace function public.is_conversation_participant(c_id uuid, u_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.dog_conversations c
    join public.dogs d on (d.id = c.dog_a_id or d.id = c.dog_b_id)
    where c.id = c_id and d.owner_id = u_id
  );
$$;

-- Helper to verify if two dogs can chat (mutual match OR accepted friendship, AND NOT blocked)
create or replace function public.can_dogs_chat(d_a uuid, d_b uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select not exists (
    select 1 from public.dog_friendships
    where status = 'blocked'
      and (
        (requester_dog_id = d_a and recipient_dog_id = d_b) or
        (requester_dog_id = d_b and recipient_dog_id = d_a)
      )
  ) and (
    exists (
      select 1 from public.dog_matches
      where status = 'active'
        and (
          (dog_a_id = least(d_a, d_b) and dog_b_id = greatest(d_a, d_b))
        )
    ) or exists (
      select 1 from public.dog_friendships
      where status = 'accepted'
        and (
          (requester_dog_id = d_a and recipient_dog_id = d_b) or
          (requester_dog_id = d_b and recipient_dog_id = d_a)
        )
    )
  );
$$;

-- Conversations policies
drop policy if exists dog_conversations_select on public.dog_conversations;
create policy dog_conversations_select on public.dog_conversations
  for select
  using (public.is_conversation_participant(id, auth.uid()));

drop policy if exists dog_conversations_insert on public.dog_conversations;
create policy dog_conversations_insert on public.dog_conversations
  for insert
  with check (
    (
      exists (select 1 from public.dogs where id = dog_a_id and owner_id = auth.uid()) or
      exists (select 1 from public.dogs where id = dog_b_id and owner_id = auth.uid())
    ) and public.can_dogs_chat(dog_a_id, dog_b_id)
  );

-- Messages policies
drop policy if exists dog_messages_select on public.dog_messages;
create policy dog_messages_select on public.dog_messages
  for select
  using (public.is_conversation_participant(conversation_id, auth.uid()));

drop policy if exists dog_messages_insert on public.dog_messages;
create policy dog_messages_insert on public.dog_messages
  for insert
  with check (
    exists (
      select 1 from public.dogs
      where id = dog_messages.sender_dog_id
        and owner_id = auth.uid()
    ) and
    public.is_conversation_participant(conversation_id, auth.uid())
  );

grant select, insert on public.dog_conversations to authenticated;
grant select, insert on public.dog_messages to authenticated;

-- Realtime publication for dog_messages
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'dog_messages'
  ) then
    alter publication supabase_realtime add table public.dog_messages;
  end if;
end $$;
