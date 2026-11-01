import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: Request) {
  try {
    const { email, code, userId } = await req.json();

    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanCode = (code || "").trim();

    if (!cleanCode) {
      return NextResponse.json(
        { success: false, error: "Please enter your 6-digit verification code." },
        { status: 400 }
      );
    }

    if (!cleanEmail && !userId) {
      return NextResponse.json(
        { success: false, error: "Email or user ID is required for verification." },
        { status: 400 }
      );
    }

    // 1. Fetch user profile
    let query = supabase.from("profiles").select("id, email, full_name, username, verification_token, verification_token_expires, email_verified, verified");
    if (userId) {
      query = query.eq("id", userId);
    } else {
      query = query.eq("email", cleanEmail);
    }

    const { data: profile, error: fetchErr } = await query.maybeSingle();

    if (fetchErr || !profile) {
      return NextResponse.json(
        { success: false, error: "User profile not found. Please try again or register." },
        { status: 404 }
      );
    }

    // 2. Already verified check
    if (profile.email_verified) {
      return NextResponse.json({
        success: true,
        alreadyVerified: true,
        message: "Your email is already verified! You are good to go.",
      });
    }

    // 3. Verify token exists
    if (!profile.verification_token) {
      return NextResponse.json(
        { success: false, error: "No pending verification code found. Please request a code first." },
        { status: 400 }
      );
    }

    // 4. Check token expiration
    if (profile.verification_token_expires) {
      const expiresAt = new Date(profile.verification_token_expires).getTime();
      if (Date.now() > expiresAt) {
        return NextResponse.json(
          { success: false, error: "Verification code has expired. Please request a fresh code." },
          { status: 400 }
        );
      }
    }

    // 5. Compare code
    if (profile.verification_token.trim() !== cleanCode) {
      return NextResponse.json(
        { success: false, error: "Incorrect verification code. Please check and try again." },
        { status: 400 }
      );
    }

    // 6. Update profile: mark verified
    const { error: updateErr } = await supabase
      .from("profiles")
      .update({
        email_verified: true,
        verified: true,
        verification_token: null,
        verification_token_expires: null,
      })
      .eq("id", profile.id);

    if (updateErr) {
      console.error("Profile update error during verification:", updateErr);
      return NextResponse.json(
        { success: false, error: "Failed to update profile verification status." },
        { status: 500 }
      );
    }

    const recipientName = profile.full_name || profile.username || "Architect";
    const userTargetEmail = profile.email || cleanEmail;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.trappedintoarchitecture.com";
    const fromEmail = process.env.RESEND_FROM_EMAIL || "Trapped Into Architecture <onboarding@resend.dev>";

    // 7. Dispatch Official Confirmation & Thank You Email via Resend
    if (resend && userTargetEmail) {
      const confirmHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Account Verified - Trapped Into Architecture</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a;">
          <div style="max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 36px; border: 1px solid #e2e8f0; box-shadow: 0 4px 24px rgba(0,0,0,0.04);">
            
            <div style="margin-bottom: 24px;">
              <a href="${siteUrl}" style="font-size: 19px; font-weight: 900; color: #000000; text-decoration: none; letter-spacing: -0.03em;">
                Trapped Into Architecture
              </a>
            </div>

            <div style="display: inline-block; background-color: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">
              🎉 Account Verified Successfully
            </div>

            <h1 style="font-size: 24px; font-weight: 900; color: #0f172a; margin: 0 0 10px 0; line-height: 1.3; letter-spacing: -0.02em;">
              Thank you for verifying, ${recipientName}!
            </h1>

            <p style="color: #475569; line-height: 1.6; font-size: 15px; margin: 0 0 20px 0;">
              Your email address (<strong>${userTargetEmail}</strong>) is now officially verified on <strong>Trapped Into Architecture</strong>.
            </p>

            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin: 20px 0;">
              <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">
                ✨ What this means for your profile:
              </div>
              <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.7;">
                <li><strong>Verified Badge Active:</strong> Your profile now carries the verified checkmark.</li>
                <li><strong>+5% Profile Score Added:</strong> Helps you rank higher on search and talent listings.</li>
                <li><strong>Studio Claims:</strong> Eligible to claim or register your architectural studio.</li>
              </ul>
            </div>

            <div style="margin: 28px 0;">
              <a href="${siteUrl}/profile/${profile.username || ''}" style="display: block; text-align: center; background: #000000; color: #ffffff !important; padding: 13px 20px; border-radius: 12px; font-weight: 800; font-size: 14px; text-decoration: none;">
                View Your Verified Profile →
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

      try {
        await resend.emails.send({
          from: fromEmail,
          to: userTargetEmail,
          subject: `🎉 Your Ti2A Account is Verified, ${recipientName}!`,
          html: confirmHtml,
        });
      } catch (err: any) {
        console.warn("Could not dispatch confirmation email:", err?.message);
      }
    }

    // 8. Log notification for CEO audit feed
    try {
      await supabase.from("contact_inquiries").insert([
        {
          name: recipientName,
          email: userTargetEmail,
          subject: "COMPANY_JOB_EMAIL_SENT",
          message: `User completed verification successfully: ${userTargetEmail} (${profile.username || "user"})`,
          is_read: false,
        },
      ]);
    } catch (e) {
      // non-blocking
    }

    return NextResponse.json({
      success: true,
      message: "Email verified successfully! Your Verified Badge (+5% profile score) has been activated.",
      verified: true,
    });
  } catch (err: any) {
    console.error("Verification API error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "An unexpected error occurred during verification." },
      { status: 500 }
    );
  }
}
