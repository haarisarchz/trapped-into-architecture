import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: Request) {
  try {
    const { email, fullName, userId, isResend } = await req.json();
    const cleanEmail = (email || "").trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    }

    // 1. Fetch user profile if needed to get full_name or id
    let resolvedName = fullName;
    let resolvedId = userId;
    try {
      let profileQuery = supabase.from("profiles").select("id, full_name, username, email");
      if (userId) {
        profileQuery = profileQuery.eq("id", userId);
      } else {
        profileQuery = profileQuery.eq("email", cleanEmail);
      }
      const { data: prof } = await profileQuery.maybeSingle();
      if (prof) {
        if (!resolvedName) resolvedName = prof.full_name || prof.username;
        if (!resolvedId) resolvedId = prof.id;
      }
    } catch (e) {
      // non-fatal
    }

    // 2. Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    // 3. Update profile with verification token
    let updateQuery = supabase.from("profiles").update({
      verification_token: code,
      verification_token_expires: expiresAt,
    });

    if (resolvedId) {
      updateQuery = updateQuery.eq("id", resolvedId);
    } else {
      updateQuery = updateQuery.eq("email", cleanEmail);
    }

    const { error: updateErr } = await updateQuery;
    if (updateErr) {
      console.warn("Could not save verification_token to profile:", updateErr.message);
    }

    if (!resend) {
      console.warn("RESEND_API_KEY is not configured.");
      return NextResponse.json({
        success: true,
        message: "Verification code generated, but email sending is skipped (no RESEND_API_KEY).",
        code, // for local dev fallback
      });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.trappedintoarchitecture.com";
    const fromEmail = process.env.RESEND_FROM_EMAIL || "Trapped Into Architecture <onboarding@resend.dev>";
    const recipientName = resolvedName || "Architect";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Ti2A Verification Code</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a;">
        <div style="max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 36px; border: 1px solid #e2e8f0; box-shadow: 0 4px 24px rgba(0,0,0,0.04);">
          
          <!-- BRAND HEADER -->
          <div style="margin-bottom: 24px;">
            <a href="${siteUrl}" style="font-size: 19px; font-weight: 900; color: #000000; text-decoration: none; letter-spacing: -0.03em;">
              Trapped Into Architecture
            </a>
          </div>

          <!-- BADGE -->
          <div style="display: inline-block; background-color: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">
            ${isResend ? "🔄 Code Resend Request" : "🔒 Email Verification Request"}
          </div>

          <h1 style="font-size: 24px; font-weight: 900; color: #0f172a; margin: 0 0 10px 0; line-height: 1.3; letter-spacing: -0.02em;">
            Here is your verification code, ${recipientName}
          </h1>

          <p style="color: #475569; line-height: 1.6; font-size: 15px; margin: 0 0 24px 0;">
            You requested an email verification code for your account on <strong>Trapped Into Architecture</strong>. Enter the 6-digit code below on the platform to verify your email and unlock your <strong>Verified Badge (+5% profile score)</strong>.
          </p>

          <!-- VERIFICATION CODE BOX -->
          <div style="background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 18px; padding: 26px; text-align: center; margin: 24px 0;">
            <div style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px;">
              6-Digit Verification Code
            </div>
            
            <div style="font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #000000; font-family: ui-monospace, Menlo, Monaco, monospace; margin: 12px 0;">
              ${code}
            </div>

            <div style="font-size: 12px; color: #64748b; margin-top: 8px;">
              Valid for <strong>24 hours</strong>. Enter this code on the platform to complete verification.
            </div>
          </div>

          <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 16px 0 24px 0; text-align: center;">
            If you did not request this verification code, please ignore this email. Your account remains safe.
          </p>

          <div style="margin: 24px 0;">
            <a href="${siteUrl}" style="display: block; text-align: center; background: #000000; color: #ffffff !important; padding: 13px 20px; border-radius: 12px; font-weight: 800; font-size: 14px; text-decoration: none;">
              Open Trapped Into Architecture →
            </a>
          </div>

          <!-- FOOTER -->
          <div style="padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.5;">
            &copy; ${new Date().getFullYear()} Trapped Into Architecture. All rights reserved.<br>
            Connecting emerging architects, designers, and premier studios across India.
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const sendResult = await resend.emails.send({
        from: fromEmail,
        to: cleanEmail,
        subject: `Your Ti2A Verification Code: ${code}`,
        html: emailHtml,
      });

      if (sendResult.error) {
        console.warn("Resend send error:", sendResult.error.message);
      } else {
        // Log notification for CEO activity feed
        try {
          await supabase.from("contact_inquiries").insert([
            {
              name: recipientName,
              email: cleanEmail,
              subject: "COMPANY_JOB_EMAIL_SENT",
              message: `Verification code requested by user: ${cleanEmail} (${recipientName})`,
              is_read: false,
            },
          ]);
        } catch (e) {}
      }

      return NextResponse.json({
        success: true,
        message: `Verification code sent to ${cleanEmail}.`,
        emailSent: !sendResult.error,
        code: process.env.NODE_ENV !== "production" ? code : undefined,
      });
    } catch (sendErr: any) {
      console.warn("Resend exception:", sendErr.message);
      return NextResponse.json({
        success: true,
        message: "Code generated, but email delivery had an issue.",
        code: process.env.NODE_ENV !== "production" ? code : undefined,
      });
    }
  } catch (err: any) {
    console.error("Verification code API error:", err);
    return NextResponse.json({ error: err.message || "Failed to send code." }, { status: 500 });
  }
}
