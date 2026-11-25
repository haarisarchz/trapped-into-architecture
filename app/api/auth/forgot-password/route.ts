import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const origin = req.headers.get("origin") || "https://trappedintoarchitecture.com";
    const redirectTo = `${origin}/reset-password`;

    // 1. Try to generate recovery link using Supabase Admin
    let resetLink: string | null = null;
    try {
      const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        email: cleanEmail,
        options: { redirectTo },
      });

      if (!linkErr && linkData?.properties?.action_link) {
        resetLink = linkData.properties.action_link;
      }
    } catch (adminErr) {
      console.warn("generateLink failed or service role not available, using standard reset:", adminErr);
    }

    // 2. If Resend is available and we generated a direct action link, send branded email
    const apiKey = process.env.RESEND_API_KEY;
    if (resetLink && apiKey) {
      try {
        const resend = new Resend(apiKey);
        const fromEmail = process.env.RESEND_FROM_EMAIL || "Trapped Into Architecture <onboarding@resend.dev>";

        await resend.emails.send({
          from: fromEmail,
          to: cleanEmail,
          subject: "Reset Your Password - Trapped Into Architecture",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px; }
                .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 36px; border: 1px solid #e5e7eb; }
                .logo { font-size: 20px; font-weight: 800; color: #000000; text-decoration: none; display: inline-block; margin-bottom: 24px; }
                h1 { font-size: 24px; font-weight: 700; color: #111827; margin: 0 0 12px; }
                p { color: #4b5563; line-height: 1.6; font-size: 15px; margin: 0 0 18px; }
                .btn { display: inline-block; width: 100%; box-sizing: border-box; text-align: center; background: #000000; color: #ffffff !important; padding: 14px 24px; border-radius: 12px; font-weight: 600; font-size: 15px; text-decoration: none; margin-top: 14px; margin-bottom: 14px; }
                .link-box { word-break: break-all; background: #f3f4f6; padding: 12px; border-radius: 8px; font-size: 12px; color: #6b7280; margin-top: 12px; }
                .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #9ca3af; }
              </style>
            </head>
            <body>
              <div class="container">
                <a href="${origin}" class="logo">Trapped Into Architecture</a>
                <h1>Reset Your Password</h1>
                <p>We received a request to reset the password for your Trapped Into Architecture account.</p>
                <p>Click the button below to set a new password. This link will expire in 24 hours.</p>

                <a href="${resetLink}" class="btn">Set New Password</a>

                <p style="font-size: 13px; color: #6b7280; margin-top: 16px;">If the button above does not work, copy and paste this link into your browser:</p>
                <div class="link-box">${resetLink}</div>

                <p style="margin-top: 24px; font-size: 13px; color: #9ca3af;">If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>

                <div class="footer">
                  &copy; ${new Date().getFullYear()} Trapped Into Architecture. All rights reserved.
                </div>
              </div>
            </body>
            </html>
          `,
        });

        return NextResponse.json({
          success: true,
          message: "Password reset link sent to your email! Please check your inbox and spam folder.",
        });
      } catch (resendErr: any) {
        console.warn("Resend email failed, falling back to Supabase auth reset:", resendErr);
      }
    }

    // 3. Fallback: Call standard Supabase resetPasswordForEmail
    const { error: resetErr } = await supabaseAdmin.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo,
    });

    if (resetErr) {
      return NextResponse.json(
        { error: resetErr.message || "Failed to send reset email. Please try again." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password reset link sent to your email! Please check your inbox.",
    });
  } catch (err: any) {
    console.error("Forgot password route error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process password reset request." },
      { status: 500 }
    );
  }
}
