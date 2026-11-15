import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.trappedintoarchitecture.com";

export async function GET() {
  try {
    // 1. Fetch already notified firms from contact_inquiries
    const { data: notifiedRecords } = await supabase
      .from("contact_inquiries")
      .select("name, email")
      .eq("subject", "WHATSAPP_STUDIO_INVITE_SENT");

    const notifiedNames = new Set(
      (notifiedRecords || []).map((r) => (r.name || "").trim().toLowerCase())
    );

    // 2. Fetch all unclaimed companies with phone or whatsapp
    const { data: companies, error: compErr } = await supabase
      .from("companies")
      .select("id, firm_name, phone, whatsapp, slug, city, state, logo_url, is_claimed")
      .order("firm_name", { ascending: true });

    if (compErr) {
      return NextResponse.json({ error: compErr.message }, { status: 500 });
    }

    const allWithPhone = (companies || []).filter((c) => {
      const raw = (c.whatsapp || c.phone || "").replace(/\D/g, "");
      return raw.length >= 10 && !c.is_claimed;
    });

    const pending = allWithPhone.filter((c) => {
      const key = (c.firm_name || "").trim().toLowerCase();
      return !notifiedNames.has(key);
    });

    const nextBatch = pending.slice(0, 15).map((c) => {
      const raw = (c.whatsapp || c.phone || "").replace(/\D/g, "");
      const fullPhone = raw.length === 10 ? `91${raw}` : raw;
      const slug = c.slug || c.firm_name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const claimUrl = `${siteUrl}/companies/${slug}`;
      const inviteText = `Hello ${c.firm_name} Team! 👋\n\nYour studio directory listing is live on Trapped Into Architecture (Ti2A):\n👉 ${claimUrl}\n\nYou can claim your studio profile for free to publish vacancies, showcase your latest architectural projects, and hire verified architects directly.\n\nClaim your studio profile here:\n👉 ${claimUrl}\n\nWarm regards,\nTrapped Into Architecture Team`;

      return {
        id: c.id,
        firmName: c.firm_name,
        rawPhone: c.whatsapp || c.phone,
        fullPhone,
        slug,
        claimUrl,
        city: c.city,
        state: c.state,
        logoUrl: c.logo_url,
        inviteText,
        waUrl: `https://wa.me/${fullPhone}?text=${encodeURIComponent(inviteText)}`,
      };
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalWithWhatsApp: allWithPhone.length,
        alreadyNotifiedCount: allWithPhone.length - pending.length,
        pendingCount: pending.length,
        batchSize: nextBatch.length,
      },
      nextBatch,
    });
  } catch (err: any) {
    console.error("WhatsApp outreach GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { companyId, firmName, phone, slug } = await req.json();

    if (!firmName || !phone) {
      return NextResponse.json({ error: "firmName and phone are required." }, { status: 400 });
    }

    const raw = String(phone).replace(/\D/g, "");
    const cleanPhone = raw.length === 10 ? `91${raw}` : raw;

    // Log in contact_inquiries so it is tracked and never queued again
    const { error: insertErr } = await supabase.from("contact_inquiries").insert([
      {
        name: firmName,
        email: `${cleanPhone}@whatsapp`,
        subject: "WHATSAPP_STUDIO_INVITE_SENT",
        message: `WhatsApp claim invite dispatched to ${firmName} (+${cleanPhone}). Claim URL: ${siteUrl}/companies/${slug || ""}`,
        is_read: true,
      },
    ]);

    if (insertErr) {
      console.warn("Could not insert contact inquiry for WhatsApp dispatch:", insertErr.message);
    }

    return NextResponse.json({
      success: true,
      message: `Studio ${firmName} marked as notified on WhatsApp.`,
    });
  } catch (err: any) {
    console.error("WhatsApp outreach POST error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
