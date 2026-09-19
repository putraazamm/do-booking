import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import SportTabs from "@/components/SportTabs";
import VenueCard, { type VenueSummary } from "@/components/VenueCard";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";
import type { Sport } from "@/types/databases";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ sport?: string }>;
}) {
  const { sport } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("venues")
    .select("id, slug, name, city, sport, price_per_hour, image_url, courts(count)")
    .order("name")
    .limit(8);

  if (sport && ["futsal", "padel", "pickleball"].includes(sport)) {
    query = query.eq("sport", sport as Sport);
  }

  const { data } = await query;

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
      <Hero />

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold text-ink">Popular venues</h2>
          <SportTabs />
        </div>

        {venues.length === 0 ? (
          <p className="text-sm text-ink/60">
            No venues yet — run the migration in supabase/migrations and seed
            a few venues to see them here.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {venues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
