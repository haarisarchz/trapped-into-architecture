import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { query, city, state, position, resultsCount, userId } = await req.json();

    // Only log if there's actual search intent (query or a filter selected)
    const cleanQuery = (query || "").trim();
    if (!cleanQuery && !city && !state && !position) {
      return NextResponse.json({ success: false, message: "Empty search query" });
    }

    await supabase.from("site_searches").insert({
      search_query: cleanQuery || null,
      city: city || null,
      state: state || null,
      position: position || null,
      results_count: typeof resultsCount === "number" ? resultsCount : 0,
      user_id: userId || null,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.warn("Error logging site search:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
