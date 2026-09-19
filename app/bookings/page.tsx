import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";
import { parseTimeRange } from "@/lib/slots";

const statusColor: Record<string, string> = {
  pending: "bg-primary-light text-primary",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-line text-ink/50",
};

export default async function BookingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?next=/bookings");
  }

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, courts(name, venues(name, slug, sport))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main>
      <Navbar />
      <section className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="mb-6 text-xl font-bold text-ink">My bookings</h1>

        {!bookings || bookings.length === 0 ? (
          <p className="text-sm text-ink/60">
            You haven&apos;t booked a court yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {bookings.map((booking) => {
              const [start, end] = parseTimeRange(booking.time_range);
              const court = booking.courts as unknown as {
                name: string;
                venues: { name: string; slug: string; sport: string };
              } | null;

              return (
                <li
                  key={booking.id}
                  className="flex items-center justify-between rounded-xl border border-line bg-base p-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      {court?.venues?.name ?? "Venue"} — {court?.name}
                    </p>
                    <p className="text-xs text-ink/60">
                      {new Date(start).toLocaleString("en-MY", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}{" "}
                      –{" "}
                      {new Date(end).toLocaleTimeString("en-MY", {
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                      statusColor[booking.status] ?? ""
                    }`}
                  >
                    {booking.status}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
      <Footer />
    </main>
  );
}
