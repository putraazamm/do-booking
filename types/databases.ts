// Hand-written types matching supabase/migrations/0001_init.sql.
// Once the project is linked, you can replace this with the real generated
// file: `supabase gen types typescript --linked > types/databases.ts`

export type Sport = "futsal" | "padel" | "pickleball";
export type BookingStatus = "pending" | "confirmed" | "cancelled";

export interface Venue {
  id: string;
  name: string;
  slug: string;
  sport: Sport;
  city: string;
  address: string | null;
  price_per_hour: number;
  image_url: string | null;
  description: string | null;
  open_time: string; // "08:00:00"
  close_time: string; // "23:00:00"
  slot_minutes: number;
  created_at: string;
}

export interface Court {
  id: string;
  venue_id: string;
  name: string;
  created_at: string;
}

export interface Booking {
  id: string;
  court_id: string;
  user_id: string;
  time_range: string; // Postgres tstzrange literal, e.g. ["2026-09-20 09:00+08","2026-09-20 10:00+08")
  status: BookingStatus;
  total_price: number | null;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      venues: {
        Row: Venue;
        Insert: Partial<Venue> & Pick<Venue, "name" | "slug" | "sport" | "city">;
        Update: Partial<Venue>;
      };
      courts: {
        Row: Court;
        Insert: Partial<Court> & Pick<Court, "venue_id" | "name">;
        Update: Partial<Court>;
      };
      bookings: {
        Row: Booking;
        Insert: Partial<Booking> &
          Pick<Booking, "court_id" | "user_id" | "time_range">;
        Update: Partial<Booking>;
      };
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & Pick<Profile, "id">;
        Update: Partial<Profile>;
      };
    };
    Views: {
      booked_slots: {
        Row: Pick<Booking, "court_id" | "time_range">;
      };
    };
  };
}
