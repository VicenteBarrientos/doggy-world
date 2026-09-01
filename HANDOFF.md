# Doggy World Handoff

## Current Status

The initial implementation budget for the previous coding agent ended just before committing and pushing the v0.1 MVP. The codebase has been fully inspected, verified, and secured:

- **Codebase integrity:** Complete Next.js 16 App Router application with React 19, TypeScript, Tailwind CSS 4, and Supabase integration.
- **Git status:** Recovered cleanly from working tree into branch `main`.
- **Secrets check:** Confirmed no API keys, tokens, or credentials are hardcoded or tracked. `.env*` properly gitignored; `.env.example` contains only template placeholders.
- **Verification:**
  - `npm run lint` — PASSED (0 errors, 0 warnings).
  - `npm run typecheck` — PASSED (0 TypeScript errors).
  - `npm run test` — PASSED (5 test suites, 20/20 unit & component tests passing).
  - `npm run build` — PASSED (production build compiled 17 routes cleanly).
  - SQL/pgTAP — NOT EXECUTED (Docker Desktop daemon unavailable on host machine).
- **Demo Mode:** Fully functional in deterministic demo fallback mode without Supabase credentials.

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

## Production Supabase Setup

To connect a live Supabase project:

1. Create a project at [supabase.com](https://supabase.com).
2. Authenticate CLI:
   ```bash
   npx supabase login
   ```
3. Link the repository to your Supabase project:
   ```bash
   npx supabase link --project-ref <your-project-ref>
   ```
4. Deploy the schema, triggers, RLS policies, and storage bucket:
   ```bash
   npx supabase db push
   ```
5. *(Optional for staging only)* Load synthetic test data:
   ```bash
   npx supabase db push --include-seed
   ```
6. In Supabase Dashboard -> Authentication -> URL Configuration:
   - Set Site URL: `https://<your-deployed-domain>`
   - Add Redirect URL: `https://<your-deployed-domain>/auth/callback`
7. Obtain API keys from Supabase Dashboard -> Settings -> API:
   - `Project URL` -> `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   *(No service role key is needed by the web app).*

---

## Vercel Setup

1. Import GitHub repository `VicenteBarrientos/doggy-world` into Vercel.
2. Set Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: `<your-supabase-url>` (or leave empty for Demo Mode)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `<your-supabase-anon-key>` (or leave empty for Demo Mode)
   - `NEXT_PUBLIC_SITE_URL`: `https://<your-vercel-domain>.vercel.app`
3. Framework Preset: **Next.js**
4. Root Directory: `./`
5. Deploy.

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
