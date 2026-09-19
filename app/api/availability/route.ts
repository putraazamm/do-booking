import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();

  const courtId = req.nextUrl.searchParams.get("court_id");
  const date = req.nextUrl.searchParams.get("date"); // YYYY-MM-DD

  if (!courtId || !date) {
    return NextResponse.json(
      { error: "court_id and date are required" },
      { status: 400 }
    );
  }

  const dayStart = `${date}T00:00:00+08:00`;
  const dayEnd = `${date}T23:59:59+08:00`;

  const { data, error } = await supabase
    .from("booked_slots")
    .select("time_range")
    .eq("court_id", courtId)
    // range-overlap filter: any booking whose time_range intersects the day
    .overlaps("time_range", `[${dayStart},${dayEnd})`);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ booked: data ?? [] });
}
