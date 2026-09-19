"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Hero() {
  const router = useRouter();
  const [sport, setSport] = useState("");
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (sport) params.set("sport", sport);
    if (city) params.set("city", city);
    if (date) params.set("date", date);
    router.push(`/venues${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <section className="border-b border-line bg-primary-light">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:items-center md:py-24">
        <div>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">
            Book a court in Do Arena.
          </h1>
          <p className="mt-4 max-w-md text-base text-ink/70">
            Futsal, padel, and pickleball courts.
            Socialize with friends, play sports, and have fun. Find a Do Arena court near you and book it in just a few clicks.
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-base p-5 shadow-sm">
          <p className="mb-4 text-sm font-semibold text-ink">
            Find a court
          </p>

          <div className="space-y-3">
            <select
              className="w-full rounded-lg border border-line bg-base px-3 py-2.5 text-sm text-ink focus:border-primary focus:outline-none"
              value={sport}
              onChange={(e) => setSport(e.target.value)}
            >
              <option value="">Choose a sport</option>
              <option value="futsal">Futsal</option>
              <option value="padel">Padel</option>
              <option value="pickleball">Pickleball</option>
            </select>

            <select
              className="w-full rounded-lg border border-line bg-base px-3 py-2.5 text-sm text-ink focus:border-primary focus:outline-none"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            >
              <option value="">Choose a city</option>
              <option value="Mont Kiara">Mont Kiara</option>
              <option value="Bukit Bintang">Bukit Bintang</option>
              <option value="Shah Alam">Shah Alam</option>
            </select>

            <input
              type="date"
              className="w-full rounded-lg border border-line bg-base px-3 py-2.5 text-sm text-ink focus:border-primary focus:outline-none"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <button
              type="button"
              onClick={handleSearch}
              className="w-full rounded-lg bg-secondary px-4 py-2.5 text-sm font-semibold text-base transition-colors hover:bg-red-700"
            >
              Search venues
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
