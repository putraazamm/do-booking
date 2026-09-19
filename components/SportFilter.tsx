"use client";

import { useState } from "react";

const sports = [
  { id: "all", label: "All sports" },
  { id: "futsal", label: "Futsal" },
  { id: "padel", label: "Padel" },
  { id: "pickleball", label: "Pickleball" },
] as const;

export default function SportFilter({
  onChange,
}: {
  onChange?: (sport: string) => void;
}) {
  const [active, setActive] = useState<string>("all");

  const handleClick = (id: string) => {
    setActive(id);
    onChange?.(id);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {sports.map((sport) => {
        const isActive = active === sport.id;
        return (
          <button
            key={sport.id}
            type="button"
            onClick={() => handleClick(sport.id)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "border-primary bg-primary text-base"
                : "border-line bg-base text-ink/70 hover:border-primary/40 hover:text-ink"
            }`}
          >
            {sport.label}
          </button>
        );
      })}
    </div>
  );
}
