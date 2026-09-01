begin;

create extension if not exists pgtap with schema extensions;

select plan(12);

select has_table('public', 'profiles', 'profiles table exists');
select has_table('public', 'dogs', 'dogs table exists');
select has_table('public', 'dog_preferences', 'preferences table exists');
select has_table('public', 'products', 'products table exists');
select has_table('public', 'dog_product_interactions', 'product interactions table exists');
select has_table('public', 'dog_friendships', 'friendships table exists');

select col_is_pk('public', 'dogs', 'id', 'dogs use a UUID primary key');
select col_is_fk('public', 'dogs', 'owner_id', 'dogs belong to profiles');

select throws_ok(
  $$
    insert into public.dog_friendships (requester_dog_id, recipient_dog_id)
    values (
      '11111111-1111-4111-8111-111111111111',
      '11111111-1111-4111-8111-111111111111'
    )
  $$,
  '23514',
  null,
  'a dog cannot friend itself'
);

set local role authenticated;
set local request.jwt.claim.sub = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

select results_eq(
  $$ select count(*)::bigint from public.profiles $$,
  array[1::bigint],
  'an owner sees only their profile'
);

select results_eq(
  $$ select count(*)::bigint from public.dogs where owner_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' $$,
  array[2::bigint],
  'an owner sees both owned dogs'
);

select is_empty(
  $$
    select * from public.dog_product_interactions
    where dog_id = '33333333-3333-4333-8333-333333333333'
  $$,
  'an owner cannot read feedback belonging to another dog'
);

select * from finish();
rollback;
