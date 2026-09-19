import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingCalendar from "@/components/BookingCalendar";
import { createClient } from "@/lib/supabase/server";

const sportLabel: Record<string, string> = {
  futsal: "Futsal",
  padel: "Padel",
  pickleball: "Pickleball",
};

export default async function VenuePage({
  params,
}: {
  // [id] holds the venue's slug (e.g. "do-arena-163")
  params: Promise<{ id: string }>;
}) {
  const { id: slug } = await params;
  const supabase = await createClient();

  const { data: venue, error: venueError } = await supabase
    .from("venues")
    .select("*")
    .eq("slug", slug)
    .single();

  if (venueError || !venue) {
    notFound();
  }

  const { data: courts } = await supabase
    .from("courts")
    .select("*")
    .eq("venue_id", venue.id)
    .order("name");

  return (
    <main>
      <Navbar />

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 grid gap-8 md:grid-cols-2">
          <div>
            {venue.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={venue.image_url}
                alt={venue.name}
                className="h-64 w-full rounded-2xl object-cover"
              />
            ) : (
              <div className="img-placeholder h-64 w-full rounded-2xl">
                Venue photo placeholder
              </div>
            )}
          </div>

          <div>
            <span className="rounded-full bg-primary-light px-2.5 py-1 text-xs font-semibold text-primary">
              {sportLabel[venue.sport] ?? venue.sport}
            </span>
            <h1 className="mt-3 text-2xl font-bold text-ink">{venue.name}</h1>
            <p className="mt-1 text-sm text-ink/60">
              {venue.address ?? venue.city}
            </p>
            {venue.description && (
              <p className="mt-4 text-sm text-ink/70">{venue.description}</p>
            )}
            <p className="mt-4 text-lg font-semibold text-secondary">
              RM{venue.price_per_hour.toFixed(0)}/hr
            </p>
          </div>
        </div>

        <h2 className="mb-4 text-lg font-bold text-ink">Pick a time</h2>

        {courts && courts.length > 0 ? (
          <BookingCalendar venue={venue} courts={courts} />
        ) : (
          <p className="text-sm text-ink/60">
            This venue has no bookable courts set up yet.
          </p>
        )}
      </section>

      <Footer />
    </main>
  );
}
