# Do Booking for Do Arena 

Book futsal, padel, and pickleball courts across Kuala Lumpur — Next.js (App Router) + Supabase.


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
