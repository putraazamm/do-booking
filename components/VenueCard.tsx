import Link from "next/link";
import type { Sport } from "@/types/databases";

export interface VenueSummary {
  id: string;
  slug: string;
  name: string;
  city: string;
  sport: Sport;
  price_per_hour: number;
  image_url: string | null;
  courtsCount: number;
}

const sportLabel: Record<Sport, string> = {
  futsal: "Futsal",
  padel: "Padel",
  pickleball: "Pickleball",
};

export default function VenueCard({ venue }: { venue: VenueSummary }) {
  return (
    <Link
      href={`/venues/${venue.slug}`}
      className="block overflow-hidden rounded-2xl border border-line bg-base transition-shadow hover:shadow-md"
    >
      {venue.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={venue.image_url}
          alt={venue.name}
          className="h-40 w-full object-cover"
        />
      ) : (
        <div className="img-placeholder h-40 w-full">
          Venue photo placeholder
        </div>
      )}

      <div className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="rounded-full bg-primary-light px-2.5 py-1 text-xs font-semibold text-primary">
            {sportLabel[venue.sport]}
          </span>
          <span className="text-xs text-ink/50">
            {venue.courtsCount} court{venue.courtsCount === 1 ? "" : "s"}
          </span>
        </div>

        <h3 className="text-base font-semibold text-ink">{venue.name}</h3>
        <p className="text-sm text-ink/60">{venue.city}, Kedah</p>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-secondary">
            RM{venue.price_per_hour.toFixed(0)}/hr
          </p>
          <span className="rounded-lg bg-ink px-3 py-1.5 text-xs font-medium text-base transition-colors hover:bg-primary">
            View slots
          </span>
        </div>
      </div>
    </Link>
  );
}
