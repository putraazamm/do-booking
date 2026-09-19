import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SportTabs from "@/components/SportTabs";
import VenueCard, { type VenueSummary } from "@/components/VenueCard";
import { createClient } from "@/lib/supabase/server";
import type { Sport } from "@/types/databases";

export default async function VenuesPage({
  searchParams,
}: {
  searchParams: Promise<{ sport?: string; city?: string; date?: string }>;
}) {
  const { sport, city } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("venues")
    .select("id, slug, name, city, sport, price_per_hour, image_url, courts(count)")
    .order("name");

  if (sport && ["futsal", "padel", "pickleball"].includes(sport)) {
    query = query.eq("sport", sport as Sport);
  }
  if (city) {
    query = query.ilike("city", `%${city}%`);
  }

  const { data, error } = await query;

  const venues: VenueSummary[] = (data ?? []).map((v) => ({
    id: v.id,
    slug: v.slug,
    name: v.name,
    city: v.city,
    sport: v.sport,
    price_per_hour: v.price_per_hour,
    image_url: v.image_url,
    courtsCount: Array.isArray(v.courts) ? (v.courts[0]?.count ?? 0) : 0,
  }));

  return (
    <main>
      <Navbar />

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-bold text-ink">
            {venues.length} venue{venues.length === 1 ? "" : "s"} found
          </h1>
          <SportTabs basePath="/venues" />
        </div>

        {error && (
          <p className="rounded-lg bg-secondary-light p-4 text-sm text-secondary">
            Couldn&apos;t load venues: {error.message}
          </p>
        )}

        {!error && venues.length === 0 && (
          <p className="text-sm text-ink/60">
            No venues match your search. Try a different sport or city.
          </p>
        )}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {venues.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
