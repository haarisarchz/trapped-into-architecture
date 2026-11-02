import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: Request) {
  try {
    const { to, subject, message, recipientName } = await req.json();

    const cleanTo = (to || "").trim().toLowerCase();
    const cleanSubject = (subject || "").trim();
    const cleanMessage = (message || "").trim();

    if (!cleanTo || !cleanTo.includes("@")) {
      return NextResponse.json({ error: "A valid recipient email address is required." }, { status: 400 });
    }

    if (!cleanSubject) {
      return NextResponse.json({ error: "Email subject cannot be empty." }, { status: 400 });
    }

    if (!cleanMessage) {
      return NextResponse.json({ error: "Email message cannot be empty." }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.trappedintoarchitecture.com";
    const fromEmail = process.env.RESEND_FROM_EMAIL || "Trapped Into Architecture <notifications@trappedintoarchitecture.com>";
    const name = recipientName?.trim() || cleanTo.split("@")[0];

    let emailSent = false;
    let emailId = null;

    if (resend) {
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${cleanSubject}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a;">
          <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 32px; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
            
            <div style="margin-bottom: 20px;">
              <a href="${siteUrl}" style="font-size: 18px; font-weight: 900; color: #000000; text-decoration: none; letter-spacing: -0.03em;">
                Trapped Into Architecture
              </a>
            </div>

            <div style="font-size: 14px; line-height: 1.7; color: #1e293b; white-space: pre-wrap; margin: 24px 0;">${cleanMessage}</div>

            <div style="margin: 28px 0 16px 0;">
              <a href="${siteUrl}" style="display: inline-block; background: #000000; color: #ffffff !important; padding: 12px 22px; border-radius: 12px; font-weight: 700; font-size: 13px; text-decoration: none;">
                Visit Trapped Into Architecture →
              </a>
            </div>

            <div style="padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.5;">
              &copy; ${new Date().getFullYear()} Trapped Into Architecture. All rights reserved.<br>
              India's premier network connecting emerging architects with top practices.
            </div>
          </div>
        </body>
        </html>
      `;

      try {
        const sendResult = await resend.emails.send({
          from: fromEmail,
          to: cleanTo,
          subject: cleanSubject,
          html: emailHtml,
        });

        if (sendResult.data?.id) {
          emailSent = true;
          emailId = sendResult.data.id;
        } else if (sendResult.error) {
          console.warn("Direct email send note:", sendResult.error.message);
        }
      } catch (err: any) {
        console.warn("Direct email exception:", err?.message);
      }
    }

    // Record in contact_inquiries so it shows up in "Sent" folder
    await supabase.from("contact_inquiries").insert([
      {
        name,
        email: cleanTo,
        subject: `ADMIN_DIRECT_MAIL: ${cleanSubject}`,
        message: cleanMessage,
        is_read: true,
      },
    ]);

    return NextResponse.json({
      success: true,
      emailSent,
      emailId,
      message: emailSent
        ? `Email dispatched successfully to ${cleanTo}`
        : `Email logged in Sent mailbox (delivery pending configuration)`,
    });
  } catch (error: any) {
    console.error("Direct send error:", error);
    return NextResponse.json({ error: error.message || "Failed to send email." }, { status: 500 });
  }
}
