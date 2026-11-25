import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, email, username, fullName, displayName, phone, profession, role } = body;

    if (!userId || !email) {
      return NextResponse.json(
        { error: "User ID and email are required." },
        { status: 400 }
      );
    }

    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          id: userId,
          email: email.trim().toLowerCase(),
          username: username ? username.trim().toLowerCase() : email.split("@")[0],
          full_name: fullName || displayName || email.split("@")[0],
          display_name: displayName || fullName || email.split("@")[0],
          phone: phone || null,
          profession: profession || "Student",
          role: role || "user",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      )
      .select()
      .single();

    if (error) {
      console.error("Backend create-profile error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, profile });
  } catch (err: any) {
    console.error("Route error in create-profile:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create profile." },
      { status: 500 }
    );
  }
}
