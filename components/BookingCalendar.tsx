"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { buildSlotsForDate, nextDates, type Slot } from "@/lib/slots";
import type { Court, Venue } from "@/types/databases";

interface Props {
  venue: Venue;
  courts: Court[];
}

type SlotState = "available" | "booked" | "selected";

export default function BookingCalendar({ venue, courts }: Props) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const dates = useMemo(() => nextDates(14), []);
  const [selectedDate, setSelectedDate] = useState(dates[0]);
  const [selectedCourtId, setSelectedCourtId] = useState(courts[0]?.id ?? "");
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const [bookedRanges, setBookedRanges] = useState<[string, string][]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const slots = useMemo(
    () => buildSlotsForDate(venue, selectedDate),
    [venue, selectedDate]
  );

  // Fetch which slots are already taken whenever the court or date changes.
  useEffect(() => {
    if (!selectedCourtId) return;
    setSelectedSlot(null);
    setLoadingAvailability(true);

    fetch(
      `/api/availability?court_id=${selectedCourtId}&date=${selectedDate}`
    )
      .then((res) => res.json())
      .then((json) => {
        const ranges: [string, string][] = (json.booked ?? []).map(
          (row: { time_range: string }) => parseRange(row.time_range)
        );
        setBookedRanges(ranges);
      })
      .catch(() => setBookedRanges([]))
      .finally(() => setLoadingAvailability(false));
  }, [selectedCourtId, selectedDate]);

  const stateFor = (slot: Slot): SlotState => {
    if (selectedSlot && selectedSlot.start === slot.start) return "selected";
    const isBooked = bookedRanges.some(
      ([start, end]) =>
        new Date(slot.start) < new Date(end) &&
        new Date(slot.end) > new Date(start)
    );
    return isBooked ? "booked" : "available";
  };

  const handleConfirm = async () => {
    if (!selectedSlot || !selectedCourtId) return;
    setSubmitting(true);
    setMessage(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/sign-in?next=/venues/${venue.slug}`);
      return;
    }

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        court_id: selectedCourtId,
        start_time: selectedSlot.start,
        end_time: selectedSlot.end,
        total_price: venue.price_per_hour * (venue.slot_minutes / 60),
      }),
    });

    const json = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setMessage({ type: "error", text: json.error ?? "Booking failed." });
      if (res.status === 409) {
        setBookedRanges((prev) => [
          ...prev,
          [selectedSlot.start, selectedSlot.end],
        ]);
        setSelectedSlot(null);
      }
      return;
    }

    setMessage({
      type: "success",
      text: `Booked! ${selectedSlot.label} on ${selectedDate}. Your booking is pending confirmation.`,
    });
    setBookedRanges((prev) => [...prev, [selectedSlot.start, selectedSlot.end]]);
    setSelectedSlot(null);
  };

  return (
    <div className="rounded-2xl border border-line bg-base p-5">
      {/* Court switcher */}
      {courts.length > 1 && (
        <div className="mb-4">
          <p className="mb-2 text-sm font-semibold text-ink">Court</p>
          <div className="flex flex-wrap gap-2">
            {courts.map((court) => (
              <button
                key={court.id}
                type="button"
                onClick={() => setSelectedCourtId(court.id)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                  selectedCourtId === court.id
                    ? "border-primary bg-primary text-base"
                    : "border-line bg-base text-ink/70 hover:border-primary/40"
                }`}
              >
                {court.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Date tabs */}
      <div className="mb-4">
        <p className="mb-2 text-sm font-semibold text-ink">Date</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {dates.map((date) => {
            const d = new Date(`${date}T00:00:00`);
            const isActive = date === selectedDate;
            return (
              <button
                key={date}
                type="button"
                onClick={() => setSelectedDate(date)}
                className={`flex min-w-[64px] flex-col items-center rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? "border-primary bg-primary text-base"
                    : "border-line bg-base text-ink/70 hover:border-primary/40"
                }`}
              >
                <span>{d.toLocaleDateString("en-MY", { weekday: "short" })}</span>
                <span className="text-sm font-semibold">{d.getDate()}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Slot grid */}
      <div className="mb-4">
        <p className="mb-2 text-sm font-semibold text-ink">
          Available times {loadingAvailability && "(checking...)"}
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {slots.map((slot) => {
            const state = stateFor(slot);
            return (
              <button
                key={slot.start}
                type="button"
                disabled={state === "booked"}
                onClick={() => setSelectedSlot(slot)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  state === "selected"
                    ? "border-primary bg-primary text-base"
                    : state === "booked"
                      ? "cursor-not-allowed border-line bg-line/40 text-ink/30 line-through"
                      : "border-line bg-base text-ink hover:border-primary/40"
                }`}
              >
                {slot.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Confirm */}
      <div className="flex items-center justify-between border-t border-line pt-4">
        <div>
          <p className="text-xs text-ink/50">Price</p>
          <p className="text-lg font-semibold text-secondary">
            RM{(venue.price_per_hour * (venue.slot_minutes / 60)).toFixed(0)}
          </p>
        </div>
        <button
          type="button"
          disabled={!selectedSlot || submitting}
          onClick={handleConfirm}
          className="rounded-lg bg-secondary px-5 py-2.5 text-sm font-semibold text-base transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? "Booking..." : "Confirm booking"}
        </button>
      </div>

      {message && (
        <p
          className={`mt-3 text-sm ${
            message.type === "error" ? "text-secondary" : "text-green-600"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}

function parseRange(range: string): [string, string] {
  const inner = range.slice(1, -1);
  const [start, end] = inner.split(",");
  return [start.replace(/"/g, ""), end.replace(/"/g, "")];
}
