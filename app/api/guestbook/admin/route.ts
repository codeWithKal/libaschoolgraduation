import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // This should be protected with authentication in production
    const { data, error } = await supabase
      .from("guestbook")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase admin GET error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (err) {
    console.error("Admin GET error:", err);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 },
    );
  }
}
