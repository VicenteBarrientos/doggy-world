insert into public.products (
  id, name, slug, category, description, durability, material,
  intended_dog_size, toy_type, food_protein, texture
)
values
  (
    'aaaaaaaa-1111-4111-8111-111111111111',
    'Cuerda resistente',
    'cuerda-resistente',
    'toy',
    'Cuerda trenzada para tirar, buscar y jugar acompañado.',
    4,
    'Algodón trenzado',
    'large',
    'rope',
    null,
    'fibrous'
  ),
  (
    'aaaaaaaa-2222-4222-8222-222222222222',
    'Zorro de felpa con sonido',
    'zorro-felpa-sonido',
    'toy',
    'Juguete suave con sonido para perros que disfrutan cazar y cargar.',
    2,
    'Felpa',
    'medium',
    'plush_squeaky',
    null,
    'soft'
  ),
  (
    'aaaaaaaa-3333-4333-8333-333333333333',
    'Pelota de caucho',
    'pelota-caucho',
    'toy',
    'Pelota flexible y durable para buscar y masticar.',
    5,
    'Caucho natural',
    null,
    'ball',
    null,
    'firm'
  ),
  (
    'aaaaaaaa-4444-4444-8444-444444444444',
    'Premios de salmón',
    'premios-salmon',
    'treat',
    'Bocados pequeños pensados para sesiones de entrenamiento.',
    null,
    null,
    null,
    null,
    'salmon',
    'soft'
  ),
  (
    'aaaaaaaa-5555-4555-8555-555555555555',
    'Bocaditos de pollo',
    'bocaditos-pollo',
    'treat',
    'Snack crujiente de porción pequeña.',
    null,
    null,
    null,
    null,
    'chicken',
    'crunchy'
  )
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  durability = excluded.durability,
  material = excluded.material,
  intended_dog_size = excluded.intended_dog_size,
  toy_type = excluded.toy_type,
  food_protein = excluded.food_protein,
  texture = excluded.texture;

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'authenticated',
    'authenticated',
    'demo.owner@example.test',
    crypt('DoggyDemo!2026', gen_salt('bf')),
    timezone('utc', now()),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Sofi Demo"}',
    timezone('utc', now()),
    timezone('utc', now()),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    'authenticated',
    'authenticated',
    'demo.friend@example.test',
    crypt('DoggyDemo!2026', gen_salt('bf')),
    timezone('utc', now()),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Alex Demo"}',
    timezone('utc', now()),
    timezone('utc', now()),
    '',
    '',
    '',
    ''
  )
on conflict (id) do nothing;

insert into auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
values
  (
    gen_random_uuid(),
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    '{"sub":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa","email":"demo.owner@example.test"}',
    'email',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    timezone('utc', now()),
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    gen_random_uuid(),
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    '{"sub":"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb","email":"demo.friend@example.test"}',
    'email',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    timezone('utc', now()),
    timezone('utc', now()),
    timezone('utc', now())
  )
on conflict (provider_id, provider) do nothing;

update public.profiles
set display_name = case id
  when 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' then 'Sofi Demo'
  when 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' then 'Alex Demo'
end,
city = case id
  when 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' then 'Santiago'
  else 'Viña del Mar'
end,
country = 'Chile'
where id in (
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
);

insert into public.dogs (
  id, owner_id, name, slug, photo_path, breed, sex, birth_date, adoption_date,
  weight_kg, size, energy_level, sociability, play_style, personality_tags,
  bio, city, country, is_public
)
values
  (
    '11111111-1111-4111-8111-111111111111',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'Rocky',
    'rocky-111111',
    'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1200&q=85',
    'Golden Retriever',
    'male',
    '2023-04-18',
    '2023-07-02',
    31,
    'large',
    'high',
    'very_social',
    'Fetch, carreras y juegos de cuerda',
    array['playful', 'gentle', 'social', 'toy_motivated'],
    'Rocky convierte cada paseo en una aventura y siempre llega con una pelota lista para compartir.',
    'Santiago',
    'Chile',
    true
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'Luna',
    'luna-222222',
    'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1200&q=85',
    'Poodle',
    'female',
    '2024-02-10',
    '2024-05-04',
    7.8,
    'small',
    'medium',
    'social',
    'Buscar premios escondidos',
    array['curious', 'cuddly', 'food_motivated'],
    'Luna es una pequeña detective: encuentra cualquier premio y después busca el mejor lugar para dormir una siesta.',
    'Santiago',
    'Chile',
    true
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    'Coco',
    'coco-333333',
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=1200&q=85',
    'Labrador',
    'male',
    '2022-07-22',
    null,
    29,
    'large',
    'high',
    'very_social',
    'Agua, pelotas y persecuciones',
    array['social', 'energetic', 'explorer'],
    'Coco ama el agua, los parques grandes y conocer nuevos amigos en cada paseo.',
    'Viña del Mar',
    'Chile',
    true
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    'Milo',
    'milo-444444',
    'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=1200&q=85',
    'Border Collie',
    'male',
    '2024-01-15',
    '2024-04-20',
    20,
    'medium',
    'very_high',
    'selective',
    'Agility y frisbee',
    array['curious', 'energetic', 'independent'],
    'Milo aprende trucos a toda velocidad y elige con calma a sus compañeros de juego.',
    'Santiago',
    'Chile',
    true
  )
on conflict (id) do nothing;

insert into public.dog_preferences (
  id, dog_id, category, preference_key, value, sentiment, confidence, source, is_public
)
values
  (
    'bbbbbbbb-1111-4111-8111-111111111111',
    '11111111-1111-4111-8111-111111111111',
    'toy',
    'rope_toys',
    'Juegos de cuerda',
    2,
    0.95,
    'owner',
    true
  ),
  (
    'bbbbbbbb-2222-4222-8222-222222222222',
    '11111111-1111-4111-8111-111111111111',
    'activity',
    'fetch',
    'Buscar la pelota',
    2,
    1,
    'owner',
    true
  ),
  (
    'bbbbbbbb-3333-4333-8333-333333333333',
    '11111111-1111-4111-8111-111111111111',
    'treat',
    'salmon',
    'Premios de salmón',
    2,
    0.90,
    'product_feedback',
    true
  )
on conflict (id) do nothing;

insert into public.dog_product_interactions (
  id, dog_id, product_id, reaction, rating, favorite, destroyed,
  lifetime_hours, accepted, would_buy_again, possible_reaction, notes
)
values
  (
    'cccccccc-1111-4111-8111-111111111111',
    '11111111-1111-4111-8111-111111111111',
    'aaaaaaaa-1111-4111-8111-111111111111',
    'loved',
    5,
    true,
    false,
    720,
    null,
    true,
    null,
    'Sigue entero después de un mes.'
  ),
  (
    'cccccccc-2222-4222-8222-222222222222',
    '11111111-1111-4111-8111-111111111111',
    'aaaaaaaa-4444-4444-8444-444444444444',
    'loved',
    5,
    true,
    null,
    null,
    true,
    true,
    false,
    null
  )
on conflict (dog_id, product_id) do nothing;

insert into public.dog_friendships (
  id, requester_dog_id, recipient_dog_id, status, responded_at
)
values
  (
    'dddddddd-1111-4111-8111-111111111111',
    '11111111-1111-4111-8111-111111111111',
    '33333333-3333-4333-8333-333333333333',
    'accepted',
    timezone('utc', now())
  ),
  (
    'dddddddd-2222-4222-8222-222222222222',
    '44444444-4444-4444-8444-444444444444',
    '22222222-2222-4222-8222-222222222222',
    'pending',
    null
  )
on conflict do nothing;
