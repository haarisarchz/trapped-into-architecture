import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email")?.trim().toLowerCase();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    }

    // Check if already unsubscribed
    const { data: existing } = await supabase
      .from("contact_inquiries")
      .select("id")
      .eq("email", email)
      .eq("subject", "UNSUBSCRIBE_WEEKLY_DIGEST")
      .maybeSingle();

    if (!existing) {
      // Record unsubscribe entry
      await supabase.from("contact_inquiries").insert([
        {
          name: "Digest Unsubscriber",
          email: email,
          subject: "UNSUBSCRIBE_WEEKLY_DIGEST",
          message: `User requested to unsubscribe from weekly job digest on ${new Date().toISOString()}`,
          is_read: true,
        },
      ]);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully unsubscribed ${email} from weekly job digests.`,
      email,
    });
  } catch (err: any) {
    console.error("Unsubscribe API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process unsubscribe request." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const cleanEmail = (email || "").trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    }

    // Record unsubscribe entry
    const { data: existing } = await supabase
      .from("contact_inquiries")
      .select("id")
      .eq("email", cleanEmail)
      .eq("subject", "UNSUBSCRIBE_WEEKLY_DIGEST")
      .maybeSingle();

    if (!existing) {
      await supabase.from("contact_inquiries").insert([
        {
          name: "Digest Unsubscriber",
          email: cleanEmail,
          subject: "UNSUBSCRIBE_WEEKLY_DIGEST",
          message: `User requested to unsubscribe from weekly job digest on ${new Date().toISOString()}`,
          is_read: true,
        },
      ]);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully unsubscribed ${cleanEmail} from weekly job digests.`,
    });
  } catch (err: any) {
    console.error("Unsubscribe POST error:", err);
    return NextResponse.json({ error: err.message || "Failed to process request." }, { status: 500 });
  }
}
