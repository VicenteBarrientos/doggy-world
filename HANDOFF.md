# Doggy World Handoff

## Current Status

**Match distance + demo social mutations + POST demo-exit are live on production.**

- **Production URL:** https://doggy-world.vercel.app
- **GitHub:** VicenteBarrientos/doggy-world (`main` @ `8599fb2`)
- **Vercel deployment:** `dpl_9ahNsUbkHjdMzkQhUfubkj1yu4Mg` (Ready, aliased to production)
- **Supabase project:** ugqblaoyfccozkjffoeg (hosted, fully migrated)

### Verification status (all green)
- `npm run lint` — PASSED
- `npm run typecheck` — PASSED
- `npm run test` — PASSED (19 test files, 90/90 tests)
- `npm run build` — PASSED (29 compiled routes)
- Production E2E (live browser, 2026-09-01) — `/login` → `Ver demo` → social demo:
  - Match shows `Macho`/`Hembra` and `A X km` (Bruno `Santiago · A 2,9 km`, Maya `Hembra` + `A 12,4 km`, Coco `Viña del Mar · A 98,4 km`)
  - `PASAR` / `ME GUSTA` / `¡Hicieron Match!` work without the global error boundary
  - Nearby list/map and visibility toggle work
  - Playdate invite `Invitaciones 1` → `Próximos 2`
  - Demo chat send works
  - `POST /demo/exit` returns `303` + `Set-Cookie: demo_mode=; Path=/; Max-Age=0; Secure; HttpOnly; SameSite=lax`; curl then sees `/match` → `/login`

### Match distance
- Formatter: `formatApproxDistance()` in `src/lib/utils.ts` (Spanish comma, omit missing, `<1 km` → `A menos de 1 km`)
- UI: city and distance share the existing MapPin chip (`Viña del Mar · A 98,4 km`)
- Demo source: same haversine helper as Nearby (`getDemoApproxDistanceKm`)
- Real source: owner `dog_locations.location` is read server-side only, then `get_nearby_dogs` RPC (max 50 km) supplies `distance_km`. Exact geography never reaches the browser.
- Compatibility uses existing heuristic distance adjustment when a km value exists; weighting was not changed.

### Demo cookie clear
`Crear mi cuenta` remains POST-only. Clearing now uses `DEMO_COOKIE_CLEAR_OPTIONS` so production `Secure` cookies actually expire.

### Follow-up (not blocking)
- Nearby default demo center is Santiago Centro until the visitor uses GPS; Match uses the requesting dog's stored coords, so Bruno can be `~4,9 km` on Nearby and `A 2,9 km` on Match until the same origin is used. The helper is shared.
- `/discover` in explicit demo still reads hosted public dogs (those rows currently omit `sex`).
- No synthetic hosted test account was available for a real-auth Match distance E2E.
- Next product milestone remains human beta sessions in `docs/BETA_TEST_PLAN.md`.

---

## VER DEMO Fix (commit 888f9d4)

### Root Cause
The `Ver demo` button linked to `/dashboard`. The proxy middleware called
`supabase.auth.getUser()`, found no session (correct — the visitor isn't logged
in), and redirected back to `/login`. The app had only one binary demo signal:
`isSupabaseConfigured() === false`. In production with hosted Supabase, that is
always `true`, so demo mode never fired for explicit visitors.

### Architecture: Two Independent Demo Concepts

| Concept | Trigger | Notes |
|---|---|---|
| **Automatic fallback** | `NEXT_PUBLIC_SUPABASE_URL/KEY` absent | Unchanged — local/dev resilience |
| **Explicit public demo** | `demo_mode=1` HTTP-only session cookie | New — production-safe visitor demo |

### Files Added
- `src/lib/demo-cookie.ts` — `DEMO_COOKIE` constant, `isDemoCookieSet()`, session-cookie options (no maxAge)
- `src/app/demo/route.ts` — `GET /demo`: sets cookie, redirects to `/dashboard`
- `src/app/demo/exit/route.ts` — originally `GET /demo/exit`; later changed to `POST` only in `a165200` so Next.js prefetch cannot clear the demo cookie
- `tests/demo-mode.test.ts` — 12 regression tests

### Files Changed
- `src/lib/supabase/proxy.ts` — demo cookie bypasses login redirect for protected routes; real Supabase user clears stale cookie immediately; added `/nearby`, `/match`, `/playdates`, `/messages` to `protectedPrefixes` (not `/discover`, `/products` — those remain public)
- `src/lib/data/viewer.ts` — `getViewer()` checks real session first, then demo cookie; real user always wins
- `src/lib/action-helpers.ts` — `requireActionUser()` now guards demo cookie too (not just no-Supabase case) — demo visitors cannot write to production tables
- `src/app/actions/auth.ts` — clears demo cookie after successful login/signup
- `src/app/auth/callback/route.ts` — clears demo cookie after OAuth callback
- `src/components/layout/app-shell.tsx` — async; shows DemoBanner for both automatic and explicit demo
- `src/components/layout/demo-banner.tsx` — "Crear mi cuenta" is a POST form to `/demo/exit` (not a prefetchable GET link)
- `src/lib/i18n/es.ts` — added `demo.exit` string
- `src/app/(auth)/layout.tsx` — `Ver demo` href: `/dashboard` → `/demo`
- `src/app/page.tsx` — `Explorar demo` href: `/dashboard` → `/demo`

### Security Properties
- No fake Supabase session is created
- RLS is never bypassed
- No shared credentials in the browser
- `requireActionUser()` throws for demo cookie — prevents any production write
- `beta-feedback`, `dogs`, `friendships`, `preferences`, `profile`, `chat`, `matching`, `playdates`, `location` actions all guard through `requireActionUser()`
- Real authenticated user always takes precedence and immediately clears stale demo cookie

---

## Match sex + demo social mutations (commits `5543e82`, `a165200`)

### Issue 1 — sex missing from Match cards
`dogs.sex` already existed. Match cards now render a Spanish badge via `sexLabel()`:
`male` → `Macho`, `female` → `Hembra`, unknown/null omitted.
The same helper is used on public Passport and `DogCard` (`/discover`).

### Issue 2 — Pass/Like crashed explicit demo
`recordMatchAction()` called `requireActionUser()` before checking `viewer.isDemo`, so demo mutations never reached `recordDemoMatchAction()` and the page hit `error.tsx` (`ALGO NO SALIÓ COMO ESPERÁBAMOS`).

Invariant now:

| Viewer | Mutation path |
|---|---|
| Explicit demo (`viewer.isDemo`) | Branch first. Synthetic/no-op. Zero hosted Supabase writes. Useful UI. |
| Real user | `requireActionUser()` + ownership + RLS write. |

Audited actions: matching, nearby/location, playdates, chat, friendships, product feedback, beta feedback.

### Issue 3 — `Crear mi cuenta` prefetch cleared demo
Next.js prefetched GET `/demo/exit`, which deleted `demo_mode` before Match. Exit is now POST-only; the banner submits a form.

### Client Match error handling
`MatchDeck.handleAction()` keeps the current card on `result.status === "error"`, shows an inline alert, re-enables buttons, and uses a submitting ref to prevent double submits. Ordinary action failures do not trip the global error boundary.

## Completed Milestones

### Social Layer V1 (commits 586bc83 → 7430408)

All 6 Social Layer features are live on production:

| Feature | Route | Commit |
|---|---|---|
| Instagram profile field | Dog profile / Passport | `586bc83` |
| Privacy-safe Nearby Dogs | `/nearby` | `36b385a` |
| Interactive Leaflet Map | `/nearby` (list/map toggle) | `de9e772` |
| Doggy Match (swipe + heuristic) | `/match` | `d3419f0` |
| Playdates | `/playdates` | `400c38b` |
| Realtime 1:1 Dog Chat | `/messages`, `/messages/[id]` | `04e6149` |
| Navigation + Dashboard | Header, MobileNav, Dashboard | `6fcc71d` |
| RLS policy fix (playdates/chat) | Migration sync | `7430408` |

### Supabase migrations applied (in order)
1. `20260901000000_initial_doggy_world.sql` — core schema
2. `20260901010000_*` through `20260901020000_*` — beta/analytics/storage
3. `20260901030000_dog_instagram.sql` — `instagram_handle` field
4. `20260901040000_nearby_locations.sql` — PostGIS `dog_locations`, `get_nearby_dogs` RPC
5. `20260901050000_dog_matching.sql` — `dog_match_actions`, `dog_matches`, mutual trigger
6. `20260901060000_playdates.sql` — `playdates`, `playdate_participants`, `is_playdate_host()` SECURITY DEFINER
7. `20260901070000_dog_chat.sql` — `dog_conversations`, `dog_messages`, Realtime publication

---



## Product Scope (v0.1 MVP)

Doggy World is an experimental digital ecosystem centered around each dog's persistent digital identity (`dog_id`), rather than generic owner accounts.

Included in v0.1:
- Email/password authentication (sign-up, sign-in, session refresh, sign-out).
- Owner profile management.
- Multi-dog support per owner.
- Complete Doggy Passport profile creation and editing (photo, breed, sex, birth/adoption dates, weight, size, energy, sociability, play style, personality tags, bio, city, country, public toggle).
- Profile completeness scoring.
- Structured dog preferences (categories: toy, treat, food, activity, behavior, other).
- Demo product catalog with category-specific feedback and reaction recording (loved, liked, neutral, disliked, durability rating, lifetime, repurchase intent).
- Dog-to-dog friendship system (request, accept, decline, block, remove friendship).
- Public Doggy Passport view (`/dog/[slug]`) with privacy-safe boundaries.
- QR code generation (`qrcode.react`), link copying, and native Web Share API integration.
- Public dog discovery (`/discover`).
- Owner dashboard (`/dashboard`) and account settings (`/settings`).
- Deterministic demo fallback mode with prominent UI banner.

Deferred from v0.1:
- Native mobile applications (iOS/Android).
- Commerce, payments, vendor payouts, and checkout.
- Geolocation tracking, GPS collars, or radius search.
- Live real-time chat and push notifications.
- Veterinary diagnosis, clinical records, or ML recommendation engines.

---

## Architecture

```text
Browser (Mobile & Desktop Web / PWA-ready)
   │
   ▼
Next.js 16 App Router (React 19, Turbopack, Tailwind CSS 4)
   ├── Server Components (default: data fetching & layout)
   ├── Client Components (interactivity: forms, QR modal, share buttons)
   └── Server Actions (src/app/actions/: auth, dog CRUD, feedback, friendships)
         │
         ├── Zod validation (src/lib/validation.ts)
         ├── Session verification (@supabase/ssr)
         └── Data access boundary (src/lib/data/)
               │
               ├── (Supabase Configured) ──► Supabase PostgreSQL (RLS enforced) & Storage
               └── (Supabase Absent)     ──► Deterministic In-Memory Demo (src/lib/demo-data.ts)
```

- **Next.js App Router:** Next.js 16.3.4 with `src/proxy.ts` session management (replaces legacy `middleware.ts`).
- **Data & Action Separation:** UI components do not execute raw database queries or direct mutations. Presentation receives typed DTOs and invokes typed Server Actions.
- **Supabase Integration:** Managed via `@supabase/ssr` using HTTP-only cookie storage for browser and server clients.
- **Fallback Resilience:** `isSupabaseConfigured()` gracefully switches to deterministic demo data when credentials are not supplied, rendering a clear UI notice without throwing unhandled exceptions.

---

## Data Model

All application data is defined in `supabase/migrations/20260901000000_initial_doggy_world.sql`:

### 1. `profiles`
- **Purpose:** Owner profile linked 1:1 with `auth.users`.
- **Primary Key:** `id uuid references auth.users(id) on delete cascade`.
- **Fields:** `display_name` (not null), `username` (unique, lowercase), `avatar_url`, `city`, `country`, `created_at`, `updated_at`.
- **Ownership:** Owner only. Auto-created on user sign-up via PostgreSQL trigger `on_auth_user_created`.

### 2. `dogs`
- **Purpose:** Central entity representing a dog's digital identity and Doggy Passport.
- **Primary Key:** `id uuid default gen_random_uuid()`.
- **Foreign Keys:** `owner_id uuid not null references public.profiles(id) on delete cascade`.
- **Fields:** `name`, `slug` (unique), `photo_path`, `breed`, `mixed_breed`, `sex` (`dog_sex`), `birth_date`, `adoption_date`, `weight_kg`, `size` (`dog_size`), `energy_level` (`energy_level`), `sociability` (`sociability_level`), `play_style`, `personality_tags` (`text[]`), `bio`, `city`, `country`, `is_public` (boolean), `created_at`, `updated_at`.
- **Ownership:** Belongs to `owner_id`. Public dogs readable by everyone; private dogs readable only by owner.

### 3. `dog_preferences`
- **Purpose:** Queryable structured preferences and traits.
- **Primary Key:** `id uuid default gen_random_uuid()`.
- **Foreign Keys:** `dog_id uuid not null references public.dogs(id) on delete cascade`.
- **Fields:** `category` (`preference_category`), `preference_key`, `value`, `sentiment` (smallint -2 to 2), `confidence`, `source` (`preference_source`), `is_public` (boolean), timestamps.
- **Constraints:** `unique (dog_id, category, preference_key)`.
- **Ownership:** Owner of `dog_id` manages; public viewable only when dog AND preference are public.

### 4. `products`
- **Purpose:** Catalog foundation for feedback and preferences (non-commerce).
- **Primary Key:** `id uuid default gen_random_uuid()`.
- **Fields:** `name`, `slug` (unique), `brand`, `category` (`product_category`), `description`, `image_url`, `durability` (1-5), `material`, `intended_dog_size`, `toy_type`, `food_protein`, `texture`, `enrichment_type`, `is_active` (boolean), timestamps.
- **Access:** Active products are readable by all users.

### 5. `dog_product_interactions`
- **Purpose:** Structured dog reactions to specific products.
- **Primary Key:** `id uuid default gen_random_uuid()`.
- **Foreign Keys:** `dog_id uuid references public.dogs(id) on delete cascade`, `product_id uuid references public.products(id) on delete restrict`.
- **Fields:** `reaction` (`product_reaction`), `rating` (1-5), `favorite` (boolean), `destroyed` (boolean), `lifetime_hours`, `accepted` (boolean), `would_buy_again` (boolean), `possible_reaction` (boolean), `notes`, timestamps.
- **Constraints:** `unique (dog_id, product_id)`.
- **Ownership:** Managed strictly by the dog's owner. Public queries can only access top favorite products via the security definer function `get_public_dog_favorites(uuid)`.

### 6. `dog_friendships`
- **Purpose:** Dog-to-dog relationship tracking with explicit state machine.
- **Primary Key:** `id uuid default gen_random_uuid()`.
- **Foreign Keys:** `requester_dog_id uuid references public.dogs(id)`, `recipient_dog_id uuid references public.dogs(id)`.
- **Fields:** `status` (`friendship_status`: pending, accepted, declined, blocked), `created_at`, `updated_at`, `responded_at`.
- **Constraints:** `requester_dog_id <> recipient_dog_id`, unique unordered pair index `least(requester, recipient), greatest(requester, recipient)`. Trigger `validate_friendship_update` enforces valid status transitions and endpoint immutability.
- **Ownership:** Only owners of the involved dogs can create, update, or remove relationships.

---

## Security & Privacy

1. **Row Level Security (RLS):**
   - RLS is enabled and enforced on every public table: `profiles`, `dogs`, `dog_preferences`, `products`, `dog_product_interactions`, `dog_friendships`.
   - Never disabled for convenience.
2. **Storage Security:**
   - Bucket `dog-photos` is private.
   - Insert/update/delete restricted to user-scoped folder `(storage.foldername(name))[1] = auth.uid()`.
   - Read access allowed only to the owner or if the photo is linked to a verified public dog profile.
3. **Public Passport Privacy Boundary:**
   - Route `/dog/[slug]` never exposes owner email, raw auth user IDs, private coordinates, full home address, or internal interaction notes.
   - City and country are the finest location granularity.
   - Product feedback is only surfaced as favorite badges via the filtered function `get_public_dog_favorites`.
4. **Server Action Authorization:**
   - Every mutating Server Action verifies the authenticated user session via `auth.getUser()`.
   - Validates user ownership of the referenced dog before executing queries.

---

## Implemented Flows

- **Authentication:** Sign-up (`/sign-up`), Sign-in (`/login`), Sign-out, Session Refresh (`src/proxy.ts`), Auth callback (`/auth/callback`).
- **Dog Management:** Add dog (`/dogs/new`), View dog details (`/dogs/[id]`), Edit dog (`/dogs/[id]/edit`), Upload photo to private storage.
- **Doggy Passport:** Public profile (`/dog/[slug]`), QR code modal, Share link copy, Web Share API trigger.
- **Product Feedback:** Browse products (`/products`, `/products/[id]`), Record structured dog review (`/dogs/[id]/products`).
- **Dog Friendships:** Send request from dog profile, view pending incoming requests (`/friend-requests`), accept, decline, block, or remove friend (`/dogs/[id]/friends`).
- **Public Discovery:** Search/browse public dog cards (`/discover`).
- **Settings:** Update owner display name, city, and country (`/settings`).
- **Demo Mode:** Fully browsable sample data with notification banners when Supabase is not connected.

---

## Verification

| Check | Command | Result | Notes |
|---|---|---|---|
| Lint | `npm run lint` | **PASSED** | 0 errors, 0 warnings (`eslint . --max-warnings=0`) |
| Typecheck | `npm run typecheck` | **PASSED** | 0 TypeScript errors (`tsc --noEmit`) |
| Unit & Component Tests | `npm run test` | **PASSED** | 20/20 tests passing in Vitest (5 test suites) |
| Production Build | `npm run build` | **PASSED** | Next.js 16 Turbopack production build succeeded (17 routes) |
| SQL / pgTAP Tests | `npm run db:test` | **NOT EXECUTED** | Reason: Local Docker engine daemon unavailable |
| Browser Desktop QA | Pre-verified | **PASSED** | Responsive layout, navigation, forms, passport |
| Browser Mobile QA | Pre-verified | **PASSED** | Mobile viewport tested, no horizontal overflow |

---

## Known Limitations

1. **Multi-owner households:** A dog currently has exactly one owner (`owner_id`). Shared ownership or co-caretakers is deferred.
2. **Discovery radius:** Public discovery displays a global feed sorted by creation date; GPS coordinates and radius filtering are deferred.
3. **No direct commerce:** Product pages are catalogs for dog reviews, not e-commerce checkouts.
4. **No push/websockets:** Friend requests and responses require page refresh/action execution; realtime channels are not active.
5. **QR download:** QR code is rendered in canvas/SVG on screen; PNG export download button is not yet implemented.
6. **Local pgTAP execution:** Requires a running Docker engine.

---

## Demo Mode

When `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are not set:
- The app enters deterministic demo mode automatically.
- A prominent banner appears: *"Modo demo — estás explorando datos sintéticos. Conecta Supabase para guardar cambios de forma permanente."*
- Enriched synthetic dataset loaded from `src/lib/demo-data.ts`:
  - **5 Owners:** Sofía Demo, Martín Demo, Camila Demo, Tomás Demo, Valentina Demo.
  - **10 Dogs:** Rocky, Luna, Coco, Milo, Nala, Bruno, Kira, Simba, Toby, Maya.
  - **12 Products:** Cuerda resistente, Zorro de felpa con sonido, Pelota de caucho, Premios de salmón, Bocaditos de pollo, Puzzle de snacks, Frisbee flexible, Bandana aventura, Mordedor de goma, Alfombra de olfato, Stick dental vegetal, Arnés ergonómico reflectante.
  - **22 Product Interactions:** Varied reactions (loved, liked, neutral, disliked), ratings, favorites, durability metrics, and repurchase intent.
  - **Structured Preferences:** 20+ queryable preferences spanning toys, treats, activities, and behaviors.
  - **10 Friendships:** 6 accepted friendships, 3 pending requests (including incoming requests to Rocky and Luna for the viewer), and 1 declined relationship.
- Form submissions display an informational message indicating demo state without throwing application errors.

---

## Production Supabase Setup (Connected & Verified)

- **Status:** **Active & Healthy in Production**
- **Project Reference:** `ugqblaoyfccozkjffoeg`
- **Region:** `sa-east-1` (São Paulo, South America / LATAM)
- **Project URL:** `https://ugqblaoyfccozkjffoeg.supabase.co`
- **Canonical Migration:** `supabase/migrations/20260901000000_initial_doggy_world.sql` (deployed via `supabase db push`)
- **Tables Active & Protected by RLS:**
  - `public.profiles` (auto-created via `handle_new_user()` trigger on `auth.users`)
  - `public.dogs` (owner CRUD + public read when `is_public = true`)
  - `public.dog_preferences` (owner CRUD + public read when `is_public = true` and dog is public)
  - `public.products` (12 generic products seeded; public read of active products)
  - `public.dog_product_interactions` (owner CRUD; private notes strictly protected)
  - `public.dog_friendships` (symmetric friendship pair constraint, state machine validation trigger)
- **Storage Bucket:**
  - `dog-photos` (private bucket, 3MB limit, image/jpeg, image/png, image/webp; RLS folder hierarchy `{owner_id}/{dog_id}/profile.{ext}`)
- **Auth URL Configuration:**
  - Site URL: `https://doggy-world.vercel.app`
  - Redirect URLs: `https://doggy-world.vercel.app/**`, `http://localhost:3000/**`
  - Mailer autoconfirm: enabled for friction-free onboarding verification
- **Verification & E2E Testing Performed:**
  - Two synthetic test users (`Owner A`, `Owner B`) registered and verified.
  - Profile auto-generation verified through `on_auth_user_created` trigger.
  - Photo uploads to private `dog-photos` storage verified for both owners.
  - Dog creation (`Tango`, `Bella`) with public passport links verified.
  - Anonymous visitor privacy check: 0 sensitive fields exposed (no email, no coordinates, no auth UID, no private interaction notes).
  - Multi-user friendship cycle: Dog A requests Dog B -> User B views pending request -> User B accepts -> symmetric friendship visible on public passports.
  - Negative authorization checks:
    - Cross-user dog updates blocked (RLS enforced: 0 rows modified).
    - Cross-user dog deletions blocked (RLS enforced: 0 rows deleted).
    - Cross-user storage folder writes blocked.
    - Cross-user product feedback creation blocked.
    - Self-friendship requests blocked by check constraint (`dog_friendships_not_self`).
    - Duplicate friendship requests blocked by unique pair index (`dog_friendships_unique_pair_idx`).

---

## Closed Beta Launch & Mobile Hardening (Completed & Live)

- **Status:** **Ready for 5–10 Human Beta Testers**
- **Mobile Photo Pipeline (`src/lib/client-photo.ts`):**
  - Procesamiento 100% en el cliente de fotos de alta resolución (cámaras de 48 MP):
    - Escala proporcional automática con límite de 1800 px en el lado mayor.
    - Corrección nativa de orientación EXIF (`createImageBitmap(file, { imageOrientation: 'from-image' })` y fallback en Canvas 2D).
    - Compresión inteligente a JPEG (calidad 0.85) manteniendo el archivo final típicamente entre 200 KB y 800 KB (muy por debajo del límite de 1.5 MB deseado y de los 3 MB de Supabase).
  - Manejo de HEIC / HEIF: detección nativa en Safari iOS/macOS; en navegadores sin soporte de códec HEIC, se captura de inmediato con mensaje claro en español: *"No pudimos procesar esta foto. Intenta elegir otra imagen o guardarla como JPG."*
  - Estados UX de foto en `DogForm`: selección inicial, preparación/compresión (`"Preparando foto…"` con spinner), vista previa inmediata con dimensiones optimizadas, subida (`"Subiendo foto…"`), éxito (`"Foto lista"`) y error recuperable.
- **Mecanismo de Feedback de la Beta:**
  - Nueva migración: `supabase/migrations/20260901020000_beta_feedback.sql` aplicada a producción.
  - Tabla `public.beta_feedback` con RLS estricto: usuarios autenticados solo pueden insertar su propio feedback; usuarios anónimos tienen acceso denegado total.
  - Server Action: `src/app/actions/beta-feedback.ts` con validación Zod (mensaje obligatorio, categorías: *Algo no funciona*, *No entendí algo*, *Tengo una idea*, *Me gustó algo*, *Otro*, ruta actual capturada automáticamente).
  - Componente: `src/components/feedback/beta-feedback-dialog.tsx` accesible desde la barra superior (`AppHeader`) y el pie del panel (`DashboardPage`).
- **Identificación de Beta & Ayuda:**
  - Píldora brutalista `[Beta]` integrada en el logo de marca (`Logo`).
  - 6 preguntas esenciales para testers agregadas en las FAQ de la landing y accesibles desde el panel de control.
- **Plan y Registro de Pruebas Humanas:**
  - `docs/BETA_TEST_PLAN.md` actualizado con el mensaje breve y directo de invitación que Vicente puede copiar y enviar directamente por WhatsApp/Telegram.
  - `docs/BETA_SESSIONS.md` preparado para registrar de forma anónima y estructurada el embudo, fricciones, comportamiento natural, citas textuales e ideas de Tester 01 a Tester 05+.
  - Regla estricta: No se agregan nuevas features ni se rediseña la UI hasta obtener evidencia empírica de al menos 5 usuarios humanos reales.
- **Próxima Acción Inmediata:** Vicente envía la invitación al primer dueño de perro real.

---

## Real-User Beta Readiness (Completed & Deployed)

- **Status:** **Ready for First Real-User Beta**
- **First-Run Onboarding Flow:**
  - **Paso 1 (Cuenta):** `/sign-up` con indicador de progreso editorial de 4 pasos (`OnboardingProgress`). Mensajes de error en español amigable.
  - **Paso 2 & 3 (Tu perro & Foto):** `/dogs/new` simplificado con requisitos mínimos indispensables (Nombre, Raza/mezcla, Sexo opcional, Fecha de nacimiento opcional) y valores por defecto automáticos en `dogSchema` para campos avanzados.
  - **Subida de foto prominente:** Selector de imagen con previsualización inmediata, validación de tipo (JPG, PNG, WebP) y peso (< 3 MB), y confirmación visual clara.
  - **Paso 4 (Pasaporte creado):** Redirección inmediata a `/dog/${slug}?created=true` mostrando el pasaporte canónico con `CelebrationBanner` celebratorio y 3 acciones primarias:
    1. *Compartir pasaporte* (Web Share API con fallback a copia en portapapeles y aviso "¡Enlace copiado!").
    2. *Ver código QR* (modal brutalista con QR escaneable al pasaporte público).
    3. *Completar perfil avanzado* (acceso directo a `/dogs/[id]/edit` para añadir peso, energía, sociabilidad y biografía).
- **Estado de Dashboard para Usuarios Nuevos (Zero Dogs):**
  - Si el usuario tiene 0 perros, el panel muestra un estado guiado dedicado: *"Creemos el pasaporte de tu perro"* con CTA directo para crear el pasaporte sin elementos confusos ni listas vacías.
  - Usuarios con 1 o más perros continúan viendo el panel normal multi-perro con métricas y amigos.
- **Analítica de Producto Consciente de la Privacidad (`src/lib/analytics.ts`):**
  - Integración nativa de `@vercel/analytics` encapsulada en una abstracción segura `track(eventName, properties)`.
  - Eventos instrumentados: `landing_view`, `signup_started`, `signup_completed`, `login_completed`, `dog_creation_started`, `dog_created`, `dog_photo_uploaded`, `passport_viewed_owner`, `passport_viewed_public`, `passport_share_opened`, `passport_qr_opened`, `friendship_request_sent`, `friendship_request_accepted`, `product_feedback_submitted`.
  - Privacidad estricta: nunca se envían correos, contraseñas, tokens, notas privadas ni datos personales.
- **Resiliencia ante Errores y Monitoreo:**
  - Errores de Supabase Auth traducidos a español amigable (`friendlyAuthError`).
  - Errores de base de datos sanitizados en `actionMessage` para nunca exponer detalles técnicos o de PostgreSQL al usuario.
  - Botones con estado de carga para prevenir envíos dobles accidentales.
- **Nueva Migración Timestamped:**
  - `supabase/migrations/20260901010000_qualify_storage_dog_photos_policy.sql` aplicada en Supabase hosted para calificar `storage.objects.name` en la política RLS de lectura de fotos, permitiendo el acceso anónimo seguro a fotos de perros públicos.
- **Pruebas y Calidad:**
  - 6 archivos de test, 24/24 pruebas unitarias pasando en Vitest (`tests/onboarding.test.tsx` añadido).
  - `npm run lint` pasando con 0 advertencias y 0 errores.
  - `npm run typecheck` pasando con 0 errores.
  - `npm run build` compilando las 17 rutas con Turbopack.
  - Script E2E en vivo (`scratch/live-beta-test.js`) ejecutado contra `https://doggy-world.vercel.app` confirmando el flujo completo.

---

## Vercel Setup (Connected & Deployed)

- **Production URL:** [https://doggy-world.vercel.app](https://doggy-world.vercel.app)
- **Framework Preset:** Next.js (App Router, Turbopack)
- **Environment Variables Configured (Production & Preview):**
  - `NEXT_PUBLIC_SUPABASE_URL`: `https://ugqblaoyfccozkjffoeg.supabase.co`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (Production Anon Public Key)
  - `NEXT_PUBLIC_SITE_URL`: `https://doggy-world.vercel.app`
- **Dynamic Data Rendering:** Pages (`/dashboard`, `/discover`, `/products`, `/dog/[slug]`, `/friend-requests`) render live data dynamically from Supabase.
- **Deterministic Demo Fallback:** Fully preserved in `src/lib/demo-data.ts`; seamlessly takes over whenever Supabase environment variables are not supplied.

---

## Lovable Visual Integration

- **Visual source of truth:** `VicenteBarrientos/doggy-world-design-system` (maintained via Lovable)
- **Functional source of truth:** `VicenteBarrientos/doggy-world` (this repository)
- **Status:** **Completed (First Pass)**
  - **Typography:** Integrated `Archivo Black` (display/headings), `Caveat Brush` (handwritten accents), and `Hind` (body/sans) via `next/font/google`.
  - **Color Tokens:** Integrated ink (`#1F1D1B`), cream (`#FBF9F3`), cream-deep (`#F3ECE0`), electric blue (`#0B50F5`), and sun yellow (`#FFD426`).
  - **Design Elements:** Brutalist 2px ink borders, hard offset box-shadows (`shadow-[4px_4px_0_var(--ink)]`, `shadow-[6px_6px_0_var(--ink)]`), warning hazard stripes, and marquee banner.
  - **Components Updated:**
    - `Wordmark` with custom SVG paw icon over Doggy.
    - `MarketingHeader`, `AppHeader`, and `MobileNav` with editorial shell and top announcement banner.
    - Landing page (`src/app/page.tsx`) with hero dog photography, floating badges, bento grid, and FAQ accordion.
    - Public Doggy Passport (`/dog/[slug]`).
    - Dog Discovery (`/discover`).
    - Owner Dashboard (`/dashboard`).
    - Product Catalog & Details (`/products`, `/products/[id]`).
    - Friend Requests (`/friend-requests`).
    - Share profile modal (`/dog/[slug]#share`).

---

## Important Files

- `src/app/`: App Router route definitions, layouts, metadata, and error boundaries.
- `src/app/actions/`: Server Actions for auth, dog CRUD, preferences, feedback, and friendships.
- `src/lib/data/`: Server-only data access layer abstracting Supabase queries and demo fallbacks.
- `src/lib/supabase/`: Client, server, and proxy Supabase clients (`@supabase/ssr`).
- `src/lib/validation.ts`: Zod schemas for all domain entities and mutation payloads.
- `src/lib/demo-data.ts`: Deterministic synthetic fixtures for demo mode.
- `src/types/database.ts`: TypeScript definitions matching the PostgreSQL schema.
- `supabase/migrations/20260901000000_initial_doggy_world.sql`: Canonical database schema, triggers, RLS, and storage rules.
- `supabase/tests/database.sql`: pgTAP test suite.

---

## Next Milestones

1. **Commit & Push:** Preserve local repository to `VicenteBarrientos/doggy-world` on branch `main`.
2. **Deploy Demo to Vercel:** Deploy the functional demo app to Vercel.
3. **Supabase Production:** Provision live Supabase project, execute migrations, configure Auth redirect URLs, and set environment variables in Vercel.
4. **Lovable Visual Alignment:** Review `VicenteBarrientos/doggy-world-design-system`, extract tokens and visual components, and apply them cleanly to Doggy World presentation layer.

---

## Continuation Prompt

```text
You are continuing work on the Doggy World project (VicenteBarrientos/doggy-world).
Read HANDOFF.md, README.md, and AGENTS.md first.
All v0.1 MVP features, tests, lint, and production build are verified and committed.
Proceed with the next prioritized milestone according to HANDOFF.md:
1. If deployment to Vercel is pending, deploy the current verified build.
2. If production Supabase credentials are provided, link and push migrations.
3. If visual integration is requested, inspect VicenteBarrientos/doggy-world-design-system and adopt styling tokens into the presentation components without disrupting existing domain logic or Server Actions.
```
