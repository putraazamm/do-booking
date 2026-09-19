import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { court_id, start_time, end_time, total_price } = await req.json();

  if (!court_id || !start_time || !end_time) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      court_id,
      user_id: user.id,
      time_range: `[${start_time},${end_time})`,
      status: "pending",
      total_price: total_price ?? null,
    })
    .select()
    .single();

  if (error) {
    // 23P01 = exclusion_violation → slot already booked
    if (error.code === "23P01") {
      return NextResponse.json(
        { error: "This time slot was just booked by someone else. Please pick another." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ booking: data }, { status: 201 });
}

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("bookings")
    .select("*, courts(name, venues(name, slug, sport))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ bookings: data ?? [] });
}
