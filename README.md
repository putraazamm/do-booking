# Do Booking for Do Arena 

Book futsal, padel, and pickleball courts in Kedah — Next.js (App Router) + Supabase.


## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Connect Supabase**
   - Copy `.env.local.example` to `.env.local` and fill in your project's URL
     and anon key (Supabase dashboard → Project Settings → API).

3. **Apply the schema**
   - Open your Supabase project's SQL editor and run
     `supabase/migrations/0001_init.sql`.
   - It creates `venues`, `courts`, `bookings`, `profiles`, enables RLS, and
     adds a database-level exclusion constraint so two people can never book
     the same court for an overlapping time slot (no race conditions).
   - It also seeds 4 sample venues matching the original UI mock — delete
     that block from the migration first if you already have real venues in
     your database, and instead make sure your existing tables match the
     columns this app queries (see "Adjusting to a different schema" below).

4. **Run it**
   ```bash
   npm run dev
   ```

## How booking works

- `/` and `/venues` list venues from the `venues` table (filterable by sport
  and city via the URL, e.g. `/venues?sport=padel`).
- `/venues/[slug]` shows one venue's courts and calls
  `GET /api/availability?court_id=...&date=...` to grey out already-booked
  slots, then `POST /api/bookings` to reserve a slot.
- The `bookings` table has an `exclude using gist (court_id, time_range)`
  constraint, so even two simultaneous requests can't double-book — the
  loser gets a 409 and the UI greys out that slot.
- `/bookings` lists the signed-in user's own bookings (protected by RLS).
- `/sign-in` handles email/password sign in and sign up via Supabase Auth.

## Adjusting to a different schema

This was built assuming a fresh schema (see the migration). If you already
have differently-named tables/columns in Supabase, the places to edit are:

- `types/databases.ts` — the TypeScript shape
- `app/page.tsx`, `app/venues/page.tsx`, `app/venues/[id]/page.tsx` — the
  `.select(...)` queries
- `app/api/bookings/route.ts`, `app/api/bookings/[id]/route.ts`,
  `app/api/availability/route.ts` — the booking/availability logic
