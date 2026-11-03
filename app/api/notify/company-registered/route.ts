import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Resend } from "resend";
import { notifyCeo } from "@/lib/notifyCeo";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: Request) {
  try {
    const { companyId, firmName, email, slug, city, state, phone, website } = await req.json();

    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanFirmName = (firmName || "Architecture Studio").trim();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      return NextResponse.json({ error: "Valid company email is required." }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.trappedintoarchitecture.com";
    const fromEmail = process.env.RESEND_FROM_EMAIL || "Trapped Into Architecture <notifications@trappedintoarchitecture.com>";
    const studioUrl = `${siteUrl}/companies/${slug || ""}`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Trapped Into Architecture</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a;">
        <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 36px; border: 1px solid #e2e8f0; box-shadow: 0 4px 24px rgba(0,0,0,0.04);">
          
          <div style="margin-bottom: 24px;">
            <a href="${siteUrl}" style="font-size: 19px; font-weight: 900; color: #000000; text-decoration: none; letter-spacing: -0.03em;">
              Trapped Into Architecture
            </a>
          </div>

          <div style="display: inline-block; background-color: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">
            🏛️ Studio Profile Live
          </div>

          <h1 style="font-size: 24px; font-weight: 900; color: #0f172a; margin: 0 0 10px 0; line-height: 1.3;">
            Welcome to Ti2A, ${cleanFirmName}!
          </h1>

          <p style="color: #475569; line-height: 1.6; font-size: 15px; margin: 0 0 20px 0;">
            Your official studio profile on <strong>Trapped Into Architecture</strong> has been created. Ti2A connects premier architecture practices with the best emerging design talent across India.
          </p>

          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin: 20px 0;">
            <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">
              🚀 What you can do next:
            </div>
            <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.7;">
              <li><strong>Publish Job & Internship Openings:</strong> Post openings for architects, interior designers, and interns.</li>
              <li><strong>Showcase Your Portfolio:</strong> Add studio project images and firm philosophy.</li>
              <li><strong>Receive Applications:</strong> Verified candidates apply directly with their architectural profiles.</li>
            </ul>
          </div>

          <div style="margin: 28px 0;">
            <a href="${studioUrl}" style="display: block; text-align: center; background: #000000; color: #ffffff !important; padding: 14px 20px; border-radius: 12px; font-weight: 800; font-size: 14px; text-decoration: none;">
              View Your Studio Profile →
            </a>
          </div>

          <div style="padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.5;">
            &copy; ${new Date().getFullYear()} Trapped Into Architecture. All rights reserved.<br>
            Connecting emerging architects, designers, and premier studios across India.
          </div>
        </div>
      </body>
      </html>
    `;

    let emailSent = false;
    let fallbackNotice = null;

    if (resend) {
      try {
        const sendResult = await resend.emails.send({
          from: fromEmail,
          to: cleanEmail,
          subject: `Welcome to Ti2A — ${cleanFirmName} Studio Profile is Live!`,
          html: emailHtml,
        });

        if (sendResult.data?.id) {
          emailSent = true;
        } else if (sendResult.error) {
          console.warn("Resend send note for new company:", sendResult.error.message);
          // If Resend test tier restriction:
          const match = sendResult.error.message?.match(/only send testing emails to your own email address \(([^)]+)\)/i);
          if (match && match[1]) {
            fallbackNotice = `(Delivered to test account ${match[1]} due to unverified domain)`;
            await resend.emails.send({
              from: fromEmail,
              to: match[1].trim(),
              subject: `[Test Fallback for ${cleanFirmName}] Studio Profile Live on Ti2A`,
              html: emailHtml,
            });
            emailSent = true;
          }
        }
      } catch (sendErr: any) {
        console.warn("Resend exception on new company:", sendErr.message);
      }
    }

    // Dispatch CEO Alert for newly registered practice
    try {
      await notifyCeo({
        type: "NEW_STUDIO_REGISTERED",
        data: {
          studioName: cleanFirmName,
          studioSlug: slug,
          email: cleanEmail,
          city: city || "",
          state: state || "",
          phone: phone || "",
          website: website || "",
        },
      });
    } catch (e: any) {
      console.warn("Could not dispatch CEO notification for new studio:", e?.message);
    }

    return NextResponse.json({
      success: true,
      emailSent,
      message: `Welcome email dispatched to ${cleanFirmName} (${cleanEmail})`,
    });
  } catch (err: any) {
    console.error("Company register notification error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
