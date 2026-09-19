"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

const sports = [
  { id: "all", label: "All sports" },
  { id: "futsal", label: "Futsal" },
  { id: "padel", label: "Padel" },
  { id: "pickleball", label: "Pickleball" },
] as const;

export default function SportTabs({ basePath = "/" }: { basePath?: string }) {
  const searchParams = useSearchParams();
  const active = searchParams.get("sport") ?? "all";

  return (
    <div className="flex flex-wrap gap-2">
      {sports.map((sport) => {
        const isActive = active === sport.id;
        const href =
          sport.id === "all" ? basePath : `${basePath}?sport=${sport.id}`;
        return (
          <Link
            key={sport.id}
            href={href}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "border-primary bg-primary text-base"
                : "border-line bg-base text-ink/70 hover:border-primary/40 hover:text-ink"
            }`}
          >
            {sport.label}
          </Link>
        );
      })}
    </div>
  );
}
