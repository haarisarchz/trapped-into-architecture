import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: Request) {
  try {
    const { name, email, phone, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
    }

    // 1. Store message in Supabase
    let dbSaved = false;
    try {
      const { error: dbError } = await supabase.from("contact_inquiries").insert([{
        name: name.trim(),
        email: email.trim(),
        phone: phone ? phone.trim() : null,
        subject: subject ? subject.trim() : "General Inquiry",
        message: message.trim(),
        is_read: false
      }]);
      if (dbError) {
        console.warn("DB insert error for contact inquiry:", dbError);
      } else {
        dbSaved = true;
      }
    } catch (dbErr) {
      console.warn("DB insert exception for contact inquiry:", dbErr);
    }

    // 2. Determine recipient email (defaults to admin.ti2a@gmail.com, or configured site_settings email)
    let recipientEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "admin.ti2a@gmail.com";
    try {
      const { data: settings } = await supabase
        .from("site_settings")
        .select("email")
        .eq("id", "global")
        .maybeSingle();
      if (settings?.email && settings.email.trim()) {
        recipientEmail = settings.email.trim();
      }
    } catch (e) {
      // fallback to default
    }

    // 3. Dispatch Email alert to admin via Resend
    let emailSent = false;
    let emailErrorMsg = null;
    if (resend) {
      try {
        const fromEmail = process.env.RESEND_FROM_EMAIL || "Trapped Into Architecture <onboarding@resend.dev>";
        const mailResult = await resend.emails.send({
          from: fromEmail,
          to: recipientEmail,
          replyTo: email.trim(),
          subject: `📩 [Ti2A Contact] ${subject ? subject.trim() : `New message from ${name}`}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background: #ffffff;">
              <div style="margin-bottom: 20px;">
                <span style="background: #000; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase;">New Contact Inquiry</span>
                <h2 style="color: #111827; margin: 12px 0 4px 0; font-size: 20px;">${subject || "General Inquiry"}</h2>
                <p style="color: #6b7280; font-size: 13px; margin: 0;">Sent via trappedintoarchitecture.com/contact</p>
              </div>
              
              <div style="background-color: #f9fafb; padding: 16px; border-radius: 12px; margin: 16px 0; border: 1px solid #f3f4f6;">
                <p style="margin: 6px 0; font-size: 14px; color: #374151;"><strong>Sender:</strong> ${name}</p>
                <p style="margin: 6px 0; font-size: 14px; color: #374151;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #2563eb;">${email}</a></p>
                <p style="margin: 6px 0; font-size: 14px; color: #374151;"><strong>Phone:</strong> ${phone ? `<a href="tel:${phone}" style="color: #2563eb;">${phone}</a>` : "Not provided"}</p>
                <p style="margin: 6px 0; font-size: 14px; color: #374151;"><strong>Date:</strong> ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</p>
              </div>

              <div style="margin: 20px 0;">
                <p style="font-size: 13px; font-weight: bold; color: #4b5563; text-transform: uppercase; margin-bottom: 8px;">Message:</p>
                <div style="background: #ffffff; padding: 16px; border: 1px solid #e5e7eb; border-radius: 12px; font-size: 14px; line-height: 1.6; color: #1f2937; white-space: pre-wrap;">${message}</div>
              </div>

              <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; text-align: center;">
                Reply directly to this email to reach <strong>${name}</strong> at <strong>${email}</strong>.
              </div>
            </div>
          `
        });
        if (mailResult.data?.id) {
          emailSent = true;
        } else if (mailResult.error) {
          emailErrorMsg = mailResult.error.message;
          console.warn("Resend email response error:", mailResult.error);
        }
      } catch (mailErr: any) {
        console.warn("Resend email dispatch error:", mailErr);
        emailErrorMsg = mailErr?.message;
      }
    }

    return NextResponse.json({ success: true, dbSaved, emailSent, emailErrorMsg, recipient: recipientEmail });
  } catch (err: any) {
    console.error("Contact API error:", err);
    return NextResponse.json({ error: err.message || "Failed to send message" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { data, error } = await supabase
      .from("contact_inquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      if (error.code === "PGRST205" || error.code === "42P01") {
        return NextResponse.json({ inquiries: [], setupRequired: true });
      }
      throw error;
    }

    return NextResponse.json({ inquiries: data || [], setupRequired: false });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, is_read } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing inquiry ID" }, { status: 400 });
    }

    const { error } = await supabase
      .from("contact_inquiries")
      .update({ is_read })
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing inquiry ID" }, { status: 400 });
    }

    const { error } = await supabase
      .from("contact_inquiries")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
