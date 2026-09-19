import type { Venue } from "@/types/databases";

export interface Slot {
  /** "09:00" 24h label */
  label: string;
  /** ISO start, e.g. 2026-09-20T09:00:00+08:00 */
  start: string;
  /** ISO end */
  end: string;
}

/**
 * Build the list of bookable hourly (or venue.slot_minutes) slots for a
 * given venue on a given calendar date (YYYY-MM-DD, in the venue's local
 * time — we treat everything as Asia/Kuala_Lumpur, UTC+8, since all venues
 * are in Kedah).
 */
export function buildSlotsForDate(venue: Venue, dateStr: string): Slot[] {
  const TZ_OFFSET = "+08:00";
  const [openH, openM] = venue.open_time.split(":").map(Number);
  const [closeH, closeM] = venue.close_time.split(":").map(Number);

  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;
  const step = venue.slot_minutes || 60;

  const slots: Slot[] = [];
  for (let m = openMinutes; m + step <= closeMinutes; m += step) {
    const startLabel = minutesToLabel(m);
    const endLabel = minutesToLabel(m + step);
    slots.push({
      label: `${startLabel} – ${endLabel}`,
      start: `${dateStr}T${startLabel}:00${TZ_OFFSET}`,
      end: `${dateStr}T${endLabel}:00${TZ_OFFSET}`,
    });
  }
  return slots;
}

function minutesToLabel(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** The next N calendar dates as YYYY-MM-DD strings, starting today. */
export function nextDates(count: number): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

/** Parse a Postgres tstzrange literal like ["2026-09-20 09:00+08","2026-09-20 10:00+08") into [startISO, endISO]. */
export function parseTimeRange(range: string): [string, string] {
  const inner = range.slice(1, -1); // drop leading [/( and trailing ]/)
  const [start, end] = inner.split(",");
  return [start.replace(/"/g, ""), end.replace(/"/g, "")];
}
